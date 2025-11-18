
import json
import os
import sys
import pathlib
import tempfile
from typing import Any, Dict, List, Tuple, Optional
from flask import Flask, request, jsonify, send_from_directory, send_file, Response, stream_with_context
from werkzeug.utils import secure_filename

ROOT = pathlib.Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

PROJECT_DIR = pathlib.Path(__file__).resolve().parent

from apple_vision_ocr import ocr_image
from ollama_ocr_chat import build_messages, call_ollama_chat, stream_ollama_chat

try:
    import requests
except ImportError:
    requests = None

try:
    import PyPDF2
except ImportError:
    PyPDF2 = None


MODEL_CHAR_LIMITS: Dict[str, int] = {
    "1b": 4000,
    "2b": 6000,
    "3b": 8000,
    "4b": 10000,
    "7b": 14000,
    "8b": 16000,
    "14b": 22000,
    "32b": 30000,
    "70b": 45000,
    "110b": 60000,
    "480b": 100000,
}


def estimate_char_limit(model_name: str) -> int:
    lower = model_name.lower()
    for token, limit in MODEL_CHAR_LIMITS.items():
        if token in lower:
            return limit
    return 16000


def clamp_text(text: str, max_chars: int) -> Tuple[str, bool]:
    if max_chars <= 0:
        return text, False
    if len(text) <= max_chars:
        return text, False
    return text[:max_chars], True


def read_text_file(file_storage, max_chars: int) -> Tuple[str, bool]:
    try:
        file_storage.stream.seek(0)
    except Exception:
        pass
    raw = file_storage.read()
    if not isinstance(raw, bytes):
        raw = raw.encode("utf-8", errors="ignore")
    for enc in ("utf-8", "utf-16", "utf-32", "cp1251", "latin-1"):
        try:
            decoded = raw.decode(enc)
            break
        except Exception:
            decoded = None
    if decoded is None:
        decoded = raw.decode("utf-8", errors="replace")
    decoded = decoded.replace("\ufeff", "")
    return clamp_text(decoded, max_chars)


def read_pdf_file(file_storage, max_chars: int) -> Tuple[str, bool]:
    if PyPDF2 is None:
        raise RuntimeError("PDF support requires PyPDF2 to be installed")

    try:
        file_storage.stream.seek(0)
    except Exception:
        pass

    with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as tmp:
        tmp_path = tmp.name
        file_storage.save(tmp_path)

    try:
        reader = PyPDF2.PdfReader(tmp_path)
        chunks = []
        for page in reader.pages:
            try:
                txt = page.extract_text() or ""
            except Exception:
                txt = ""
            if txt:
                chunks.append(txt)
            if max_chars > 0 and sum(len(c) for c in chunks) >= max_chars:
                break
        joined = "\n\n".join(chunks)
        return clamp_text(joined, max_chars)
    finally:
        try:
            os.remove(tmp_path)
        except OSError:
            pass


app = Flask(__name__, static_folder="static", template_folder="static")


@app.route("/")
def index():
    return send_from_directory(app.static_folder, "index.html")


@app.route("/qelion-wrapper-bridge/Inp.png")
def serve_brand_image():
    logo_path = PROJECT_DIR / "Inp.png"
    if not logo_path.exists():
        return jsonify({"error": "brand asset missing"}), 404
    return send_file(logo_path, mimetype="image/png", conditional=True)


@app.route("/api/chat", methods=["POST"])
def chat():
    model = request.form.get("model", "qwen3:4b")
    langs = request.form.get("lang", "").strip()
    lang_list = [s.strip() for s in langs.split(",") if s.strip()] if langs else []
    fast = request.form.get("fast", "false").lower() in {"1", "true", "yes", "on"}
    prompt = request.form.get("prompt", "").strip()
    history = request.form.get("history", "[]")
    upload_kind = request.form.get("upload_kind", "")
    try:
        hist_list: List[Dict[str, str]] = json.loads(history)
        if not isinstance(hist_list, list):
            hist_list = []
    except Exception:
        hist_list = []

    ocr_text = ""
    warning: Optional[str] = None

    file = request.files.get("upload") or request.files.get("image")
    if file and file.filename:
        filename = secure_filename(file.filename)
        ext = pathlib.Path(filename).suffix.lower()
        char_cap = estimate_char_limit(model)

        if upload_kind == "text" or ext in {".txt", ".md", ".csv"}:
            try:
                text, truncated = read_text_file(file, char_cap)
            except Exception as exc:
                return jsonify({"error": f"Text import error: {exc}"}), 400
            ocr_text = text
            if truncated:
                warning = "text_truncated"
        elif upload_kind == "pdf" or ext == ".pdf":
            try:
                text, truncated = read_pdf_file(file, char_cap)
            except RuntimeError as exc:
                return jsonify({"error": str(exc)}), 500
            except Exception as exc:
                return jsonify({"error": f"PDF import error: {exc}"}), 400
            ocr_text = text
            if truncated:
                warning = "pdf_truncated"
        else:
            with tempfile.TemporaryDirectory() as td:
                p = os.path.join(td, filename)
                try:
                    file.stream.seek(0)
                except Exception:
                    pass
                file.save(p)
                try:
                    ocr_text = ocr_image(p, lang_list, fast)
                except Exception as e:
                    return jsonify({"error": f"OCR error: {e}"}), 400

    messages = build_messages(hist_list, ocr_text or None, prompt)

    wants_stream = request.args.get("stream", "1").lower() not in {"0", "false", "off"}

    if not wants_stream:
        try:
            reply = call_ollama_chat(messages, model=model, stream=False)
        except Exception as e:
            return jsonify({"error": f"LLM error: {e}"}), 500

        return jsonify({
            "reply": reply,
            "ocr_text": ocr_text,
            "document_warning": warning,
        })

    def generate() -> Any:
        accumulator: List[str] = []
        meta_payload = {
            "type": "meta",
            "ocr_text": ocr_text,
            "document_warning": warning,
        }
        yield json.dumps(meta_payload) + "\n"
        try:
            for chunk in stream_ollama_chat(messages, model=model):
                if not chunk:
                    continue
                ctype = chunk.get("type")
                if ctype == "delta":
                    delta = chunk.get("delta") or chunk.get("content") or ""
                    if delta:
                        accumulator.append(delta)
                        yield json.dumps({"type": "token", "delta": delta}) + "\n"
                elif ctype == "error":
                    yield json.dumps({"type": "error", "error": chunk.get("error", "Unknown error")}) + "\n"
                    return
        except Exception as exc:
            yield json.dumps({"type": "error", "error": str(exc)}) + "\n"
            return

        full_text = "".join(accumulator)
        yield json.dumps({"type": "done", "content": full_text}) + "\n"

    headers = {
        "Cache-Control": "no-cache",
        "X-Accel-Buffering": "no",
    }
    return Response(stream_with_context(generate()), mimetype="application/x-ndjson", headers=headers)


@app.route("/api/models", methods=["GET"])
def list_models():
    if requests is None:
        return jsonify({"error": "requests library not available"}), 500

    ollama_host = os.environ.get("OLLAMA_HOST", "http://localhost:11434")
    url = ollama_host.rstrip("/") + "/api/tags"
    try:
        resp = requests.get(url, timeout=10)
        resp.raise_for_status()
        payload = resp.json()
    except Exception as exc:
        return jsonify({"error": f"Failed to load models: {exc}"}), 502

    models: List[Dict[str, Any]] = []
    for item in payload.get("models", []):
        tag_name = item.get("name") or item.get("model")
        if not tag_name:
            continue
        details = item.get("details") or {}
        models.append({
            "name": tag_name,
            "model": item.get("model", tag_name),
            "parameter_size": details.get("parameter_size"),
            "context_length": details.get("context_length"),
        })

    return jsonify({"models": models})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8765, debug=True)
