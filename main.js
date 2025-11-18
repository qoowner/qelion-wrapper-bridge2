const chat = document.getElementById('chat');
const imageInput = document.getElementById('imageFile');
const textInput = document.getElementById('textFile');
const pdfInput = document.getElementById('pdfFile');
const fileButtons = Array.from(document.querySelectorAll('.picker__btn'));
const picker = document.getElementById('picker');
const pickerClose = document.getElementById('pickerClose');
const promptInput = document.getElementById('prompt');
const sendBtn = document.getElementById('send');
const modelSelect = document.getElementById('modelSelect');
const languageSelect = document.getElementById('languageSelect');
const addBtn = document.getElementById('addBtn');
const titleEl = document.querySelector('[data-i18n="title"]');
const metaEl = document.querySelector('[data-i18n="metaPrefix"]');
const sendIcon = document.querySelector('.send__icon');
const newChatBtn = document.getElementById('newChat');
const historyBtn = document.getElementById('historyBtn');
const historyPanel = document.getElementById('historyPanel');
const historyClose = document.getElementById('historyClose');
const historyList = document.getElementById('historyList');
const settingsBtn = document.getElementById('settingsBtn');
const settingsPanel = document.getElementById('settingsPanel');
const settingsClose = document.getElementById('settingsClose');
const themeSelect = document.getElementById('themeSelect');
const headerLogo = document.getElementById('headerLogo');
const sessionChip = document.getElementById('sessionChip');
const sessionChipPrimary = document.getElementById('sessionChipPrimary');
const sessionChipHint = document.getElementById('sessionChipHint');
const sessionMenu = document.getElementById('sessionMenu');
const sessionMenuButtons = sessionMenu ? Array.from(sessionMenu.querySelectorAll('[data-mode]')) : [];
const DEVICE_BREAKPOINT = 820;
const SESSION_MODES = { stored: 'stored', ephemeral: 'ephemeral' };
const EPHEMERAL_ID = '__ephemeral__';
let isMobileView = false;
let resizeTimer = null;
let sessionMode = SESSION_MODES.stored;
let ephemeralConversation = null;

const localeStrings = {
  en: {
    htmlLang: 'en',
    title: "Let's talk!",
    metaPrefix: 'Apple OCR × Ollama',
    sessionModePersistent: 'Standard chat',
    sessionModePersistentHint: 'Saves to history',
    sessionModeEphemeral: 'One-shot',
    sessionModeEphemeralHint: 'Won’t appear in history',
    modelLabel: 'Model',
    modelLoading: 'Loading…',
    modelLoadError: 'Failed to load models',
    modelEmpty: 'No models found',
    langLabel: 'Language',
    placeholder: 'Type a message…',
    send: 'Send',
    addTitle: 'Attach image or document',
    thoughtsSummary: '💭 Model thoughts',
    error: 'Error',
    ready: 'Done',
    network: 'Network error: ',
    uploadTitle: 'What do you want to upload?',
    uploadImage: 'Photo',
    uploadText: 'Text file',
    uploadPdf: 'PDF document',
    uploadCancel: 'Cancel',
    warning_text_truncated: 'The document is too long; it will be truncated for this model.',
    warning_pdf_truncated: 'The PDF is too long; only the beginning will be processed.',
    newChat: 'New chat',
    historyButton: 'History',
    historyTitle: 'Conversations',
    historyClose: 'Close',
    historyEmpty: 'No conversations yet',
    historyDelete: 'Delete',
    historyUntitled: 'Untitled chat',
    copy: 'Copy',
    copied: 'Copied!',
    themeLabel: 'Theme',
    themeDefault: 'Default',
    themeOcean: 'Ocean',
    themeSunset: 'Sunset',
    themeForest: 'Forest',
    themeMidnight: 'Midnight',
    stopGeneration: 'Stop generation',
    warning_generation_stopped: 'Generation stopped by user.',
    settingsButton: 'Settings',
    settingsTitle: 'Settings',
    settingsClose: 'Close',
  },
  ru: {
    htmlLang: 'ru',
    title: 'Поговорим!',
    metaPrefix: 'Apple OCR × Ollama',
    sessionModePersistent: 'Обычный диалог',
    sessionModePersistentHint: 'Сохраняется в истории',
    sessionModeEphemeral: 'Одноразовый',
    sessionModeEphemeralHint: 'Не сохраняется в истории',
    modelLabel: 'Модель',
    modelLoading: 'Загрузка…',
    modelLoadError: 'Не удалось загрузить модели',
    modelEmpty: 'Модели не найдены',
    langLabel: 'Язык',
    placeholder: 'Напиши сообщение…',
    send: 'Отправить',
    addTitle: 'Прикрепить изображение или документ',
    thoughtsSummary: '💭 Мысли модели',
    error: 'Ошибка',
    ready: 'Готово',
    network: 'Сеть недоступна: ',
    uploadTitle: 'Что загрузить?',
    uploadImage: 'Фото',
    uploadText: 'Текстовый файл',
    uploadPdf: 'PDF документ',
    uploadCancel: 'Отмена',
    warning_text_truncated: 'Файл слишком большой — будет использована только часть текста.',
    warning_pdf_truncated: 'PDF превышает лимит модели — обработаны будут только первые страницы.',
    newChat: 'Новый диалог',
    historyButton: 'История',
    historyTitle: 'История диалогов',
    historyClose: 'Закрыть',
    historyEmpty: 'Диалоги ещё не созданы',
    historyDelete: 'Удалить',
    historyUntitled: 'Без названия',
    copy: 'Копировать',
    copied: 'Скопировано!',
    themeLabel: 'Тема',
    themeDefault: 'Стандартная',
    themeOcean: 'Океан',
    themeSunset: 'Закат',
    themeForest: 'Лес',
    themeMidnight: 'Ночь',
    stopGeneration: 'Остановить генерацию',
    warning_generation_stopped: 'Генерация остановлена пользователем.',
    settingsButton: 'Настройки',
    settingsTitle: 'Настройки',
    settingsClose: 'Закрыть',
  },
  de: {
    htmlLang: 'de',
    title: 'Lass uns reden!',
    metaPrefix: 'Apple OCR × Ollama',
    sessionModePersistent: 'Standard-Chat',
    sessionModePersistentHint: 'Wird im Verlauf gespeichert',
    sessionModeEphemeral: 'Einmalig',
    sessionModeEphemeralHint: 'Wird nicht gespeichert',
    modelLabel: 'Modell',
    modelLoading: 'Lädt…',
    modelLoadError: 'Modelle konnten nicht geladen werden',
    modelEmpty: 'Keine Modelle gefunden',
    langLabel: 'Sprache',
    placeholder: 'Schreibe eine Nachricht…',
    send: 'Senden',
    addTitle: 'Bild oder Dokument anhängen',
    thoughtsSummary: '💭 Gedanken des Modells',
    error: 'Fehler',
    ready: 'Fertig',
    network: 'Netzwerkfehler: ',
    uploadTitle: 'Was möchtest du hochladen?',
    uploadImage: 'Foto',
    uploadText: 'Textdatei',
    uploadPdf: 'PDF-Dokument',
    uploadCancel: 'Abbrechen',
    warning_text_truncated: 'Die Datei ist zu lang – nur ein Teil wird genutzt.',
    warning_pdf_truncated: 'Das PDF ist zu groß – nur der Anfang wird verarbeitet.',
    newChat: 'Neuer Chat',
    historyButton: 'Verlauf',
    historyTitle: 'Unterhaltungen',
    historyClose: 'Schließen',
    historyEmpty: 'Noch keine Unterhaltungen',
    historyDelete: 'Löschen',
    historyUntitled: 'Ohne Titel',
    copy: 'Kopieren',
    copied: 'Kopiert!',
    themeLabel: 'Thema',
    themeDefault: 'Standard',
    themeOcean: 'Ozean',
    themeSunset: 'Sonnenuntergang',
    themeForest: 'Wald',
    themeMidnight: 'Mitternacht',
    stopGeneration: 'Generierung stoppen',
    warning_generation_stopped: 'Generierung durch den Nutzer gestoppt.',
    settingsButton: 'Einstellungen',
    settingsTitle: 'Einstellungen',
    settingsClose: 'Schließen',
  },
  fr: {
    htmlLang: 'fr',
    title: 'Discutons !',
    metaPrefix: 'Apple OCR × Ollama',
    sessionModePersistent: 'Discussion standard',
    sessionModePersistentHint: 'Enregistrée dans l’historique',
    sessionModeEphemeral: 'Session éphémère',
    sessionModeEphemeralHint: 'Non enregistrée',
    modelLabel: 'Modèle',
    modelLoading: 'Chargement…',
    modelLoadError: 'Impossible de charger les modèles',
    modelEmpty: 'Aucun modèle trouvé',
    langLabel: 'Langue',
    placeholder: 'Écris un message…',
    send: 'Envoyer',
    addTitle: 'Joindre une image ou un document',
    thoughtsSummary: '💭 Réflexions du modèle',
    error: 'Erreur',
    ready: 'Terminé',
    network: 'Erreur réseau : ',
    uploadTitle: 'Que souhaites-tu importer ?',
    uploadImage: 'Photo',
    uploadText: 'Fichier texte',
    uploadPdf: 'Document PDF',
    uploadCancel: 'Annuler',
    warning_text_truncated: 'Le fichier est trop long — seule une partie sera utilisée.',
    warning_pdf_truncated: 'Le PDF dépasse la limite — seules les premières pages seront lues.',
    newChat: 'Nouvelle discussion',
    historyButton: 'Historique',
    historyTitle: 'Discussions',
    historyClose: 'Fermer',
    historyEmpty: 'Aucune discussion pour l’instant',
    historyDelete: 'Supprimer',
    historyUntitled: 'Sans titre',
    copy: 'Copier',
    copied: 'Copié !',
    themeLabel: 'Thème',
    themeDefault: 'Par défaut',
    themeOcean: 'Océan',
    themeSunset: 'Coucher de soleil',
    themeForest: 'Forêt',
    themeMidnight: 'Minuit',
    stopGeneration: 'Arrêter la génération',
    warning_generation_stopped: 'Génération interrompue par l’utilisateur.',
    settingsButton: 'Paramètres',
    settingsTitle: 'Paramètres',
    settingsClose: 'Fermer',
  },
};

const localePrompts = {
  en: 'You are a helpful assistant. Reply in English.',
  ru: 'Ты — полезный помощник. Отвечай на русском языке.',
  de: 'Du bist ein hilfsbereiter Assistent. Antworte auf Deutsch.',
  fr: 'Tu es un assistant utile. Réponds en français.',
};

const localeLangCodes = {
  en: 'en-US',
  ru: 'ru-RU',
  de: 'de-DE',
  fr: 'fr-FR',
};

const LOCAL_CHAR_LIMITS = {
  '1b': 4000,
  '2b': 6000,
  '3b': 8000,
  '4b': 10000,
  '7b': 14000,
  '8b': 16000,
  '14b': 22000,
  '32b': 30000,
  '70b': 45000,
  '110b': 60000,
  '480b': 100000,
};

const STORAGE_KEYS = {
  conversations: 'ocr_chat_conversations_v1',
  theme: 'ocr_chat_theme_v1',
};

const THEME_VARS = ['--bg', '--panel', '--accent', '--ink', '--ink-soft', '--ink-muted', '--white', '--border'];

const THEMES = {
  default: {},
  ocean: {
    '--bg': '#e6f1ff',
    '--panel': '#f4f8ff',
    '--accent': '#2563eb',
    '--ink': '#0f172a',
    '--ink-soft': '#1e293b',
    '--ink-muted': '#475569',
    '--white': '#ffffff',
    '--border': '#cdd9f3',
  },
  sunset: {
    '--bg': '#fff1e6',
    '--panel': '#fff7f0',
    '--accent': '#f97316',
    '--ink': '#3a0f0f',
    '--ink-soft': '#4c1d1d',
    '--ink-muted': '#7c2d12',
    '--white': '#ffffff',
    '--border': '#fcd9c2',
  },
  forest: {
    '--bg': '#ecf4f1',
    '--panel': '#f5faf7',
    '--accent': '#2f855a',
    '--ink': '#082c1f',
    '--ink-soft': '#134f37',
    '--ink-muted': '#2f6f51',
    '--white': '#ffffff',
    '--border': '#cde7db',
  },
  midnight: {
    '--bg': '#0f172a',
    '--panel': '#111c34',
    '--accent': '#6366f1',
    '--ink': '#e2e8f0',
    '--ink-soft': '#cbd5f5',
    '--ink-muted': '#94a3b8',
    '--white': '#1e293b',
    '--border': '#1f2a44',
  },
};

let history = [];
let currentLocale = 'en';
let modelsState = { status: 'loading', items: [] };
let selectedModel = 'qwen3:4b';
let pendingUpload = null;
let activeStream = null;
let currentSendState = 'idle';

const STREAM_ENDPOINT = '/api/chat?stream=1';
const streamDecoder = typeof TextDecoder !== 'undefined' ? new TextDecoder() : null;
let conversations = [];
let currentConversationId = null;

if(typeof marked !== 'undefined'){
  marked.setOptions({
    breaks: true,
    gfm: true,
    headerIds: false,
    mangle: false,
  });
}

function t(key){
  const table = localeStrings[currentLocale] || localeStrings.en;
  if(Object.prototype.hasOwnProperty.call(table, key)){
    return table[key];
  }
  const fall = localeStrings.en;
  return Object.prototype.hasOwnProperty.call(fall, key) ? fall[key] : key;
}

function translateWarning(code){
  if(!code) return null;
  const key = `warning_${code}`;
  return t(key);
}

function estimateCharLimitLocal(modelName){
  const lower = (modelName || '').toLowerCase();
  for(const token in LOCAL_CHAR_LIMITS){
    if(lower.includes(token)) return LOCAL_CHAR_LIMITS[token];
  }
  return 16000;
}

function findModelInfo(name){
  if(!name || !Array.isArray(modelsState.items)) return null;
  return modelsState.items.find((item) => item && item.name === name) || null;
}

function charLimitForModel(name){
  const info = findModelInfo(name);
  if(info){
    const ctx = Number(info.context_length);
    if(Number.isFinite(ctx) && ctx > 0){
      return Math.round(ctx * 4);
    }
    if(typeof info.parameter_size === 'string'){
      const lower = info.parameter_size.toLowerCase();
      for(const token in LOCAL_CHAR_LIMITS){
        if(lower.includes(token)) return LOCAL_CHAR_LIMITS[token];
      }
    }
  }
  return estimateCharLimitLocal(name);
}

function syncSystemPrompt(){
  const prompt = localePrompts[currentLocale] || localePrompts.en;
  if(history.length === 0){
    history.push({ role: 'system', content: prompt });
  } else {
    history[0] = { ...history[0], content: prompt };
  }
}

function updateMeta(){
  if(!metaEl) return;
  metaEl.textContent = t('metaPrefix');
}

function applyTranslations(){
  document.querySelectorAll('[data-i18n]').forEach((node) => {
    const key = node.dataset.i18n;
    if(!key) return;
    const text = t(key);
    if(node instanceof HTMLInputElement){
      node.placeholder = text;
    } else {
      node.textContent = text;
    }
  });
}

function applyLocale(locale){
  if(!localeStrings[locale]){
    locale = 'en';
  }
  currentLocale = locale;
  const strings = localeStrings[currentLocale];

  document.documentElement.lang = strings.htmlLang;
  if(titleEl) titleEl.textContent = strings.title;
  if(promptInput) promptInput.placeholder = strings.placeholder;
  if(sendBtn){
    setSendButtonState(currentSendState);
  }
  if(addBtn) addBtn.title = strings.addTitle;
  if(settingsBtn){
    const settingsLabel = t('settingsButton');
    settingsBtn.setAttribute('aria-label', settingsLabel);
    settingsBtn.title = settingsLabel;
    const expanded = settingsPanel && !settingsPanel.classList.contains('settings--hidden') ? 'true' : 'false';
    settingsBtn.setAttribute('aria-expanded', expanded);
  }
  if(languageSelect) languageSelect.value = currentLocale;

  applyTranslations();
  updateSessionChipTexts();
  renderModelOptions();
  updateMeta();
  syncSystemPrompt();
  renderHistoryList();
  renderCurrentConversation();
  saveCurrentConversation({ silent: true, preserveTimestamp: true });
}

function renderModelOptions(){
  if(!modelSelect) return;
  modelSelect.innerHTML = '';

  if(modelsState.status === 'loading'){
    const opt = new Option(t('modelLoading'), '', true, true);
    opt.disabled = true;
    opt.dataset.i18n = 'modelLoading';
    modelSelect.add(opt);
    modelSelect.disabled = true;
    return;
  }

  if(modelsState.status === 'error'){
    const opt = new Option(t('modelLoadError'), '', true, true);
    opt.disabled = true;
    opt.dataset.i18n = 'modelLoadError';
    modelSelect.add(opt);
    modelSelect.disabled = true;
    return;
  }

  if(modelsState.items.length === 0){
    const opt = new Option(t('modelEmpty'), '', true, true);
    opt.disabled = true;
    opt.dataset.i18n = 'modelEmpty';
    modelSelect.add(opt);
    modelSelect.disabled = true;
    return;
  }

  const candidates = modelsState.items.map((item) => item.name);
  const fallback = candidates.includes(selectedModel) ? selectedModel : candidates[0];

  modelsState.items.forEach((item) => {
    const opt = new Option(item.name, item.name, false, false);
    modelSelect.add(opt);
  });

  modelSelect.value = fallback;
  selectedModel = fallback;
  modelSelect.disabled = false;
}

async function loadModels(){
  modelsState = { status: 'loading', items: [] };
  renderModelOptions();

  try{
    const res = await fetch('/api/models');
    const data = await res.json();
    if(!res.ok){
      throw new Error(data.error || res.statusText);
    }
    const items = Array.isArray(data.models) ? data.models.filter((m) => m && m.name) : [];
    modelsState = { status: 'loaded', items };
  }catch(err){
    console.error('Failed to load models', err);
    modelsState = { status: 'error', items: [] };
  }

  renderModelOptions();
  updateMeta();
}

function el(tag, cls, text){
  const node = document.createElement(tag);
  if(cls) node.className = cls;
  if(typeof text === 'string') node.textContent = text;
  return node;
}

function scrollChat(){
  chat.scrollTop = chat.scrollHeight;
}

function updateChatVisualState(){
  if(!chat) return;
  const hasMessages = Boolean(chat.querySelector('.msg'));
  chat.classList.toggle('chat--empty', !hasMessages);
  if(headerLogo){
    if(hasMessages){
      headerLogo.classList.add('header__logo--visible');
      headerLogo.setAttribute('aria-hidden', 'false');
    } else {
      headerLogo.classList.remove('header__logo--visible');
      headerLogo.setAttribute('aria-hidden', 'true');
    }
  }
}

function isEphemeralMode(){
  return sessionMode === SESSION_MODES.ephemeral;
}

function updateSessionChipTexts(){
  if(!sessionChip) return;
  if(sessionChipPrimary){
    sessionChipPrimary.textContent = isEphemeralMode() ? t('sessionModeEphemeral') : t('sessionModePersistent');
  }
  if(sessionChipHint){
    sessionChipHint.textContent = isEphemeralMode() ? t('sessionModeEphemeralHint') : t('sessionModePersistentHint');
  }
  sessionChip.classList.toggle('session-chip--ephemeral', isEphemeralMode());
  if(document.body){
    document.body.classList.toggle('session-ephemeral', isEphemeralMode());
  }
  if(sessionMenuButtons.length){
    sessionMenuButtons.forEach((btn) => {
      const active = btn.dataset.mode === (isEphemeralMode() ? 'ephemeral' : 'stored');
      btn.classList.toggle('session-menu__item--active', active);
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
  }
}

function openSessionMenu(){
  if(!sessionMenu || !sessionChip) return;
  sessionMenu.classList.remove('session-menu--hidden');
  sessionChip.setAttribute('aria-expanded', 'true');
}

function closeSessionMenu(){
  if(!sessionMenu || !sessionChip) return;
  sessionMenu.classList.add('session-menu--hidden');
  sessionChip.setAttribute('aria-expanded', 'false');
}

function toggleSessionMenu(){
  if(!sessionMenu) return;
  const hidden = sessionMenu.classList.contains('session-menu--hidden');
  if(hidden){
    openSessionMenu();
  } else {
    closeSessionMenu();
  }
}

function startEphemeralSession({ skipRender = false } = {}){
  if(isStreaming()){
    stopStreaming();
  }
  sessionMode = SESSION_MODES.ephemeral;
  currentConversationId = EPHEMERAL_ID;
  const timestamp = Date.now();
  if(!ephemeralConversation){
    ephemeralConversation = {
      id: EPHEMERAL_ID,
      title: null,
      createdAt: timestamp,
      updatedAt: timestamp,
      history: [],
    };
  } else {
    ephemeralConversation.history = [];
    ephemeralConversation.updatedAt = timestamp;
  }
  history = [];
  pendingUpload = null;
  resetInputs();
  if(promptInput) promptInput.value = '';
  if(!skipRender){
    renderCurrentConversation();
  }
  closeHistoryPanel();
  updateSessionChipTexts();
}

function setSessionMode(mode){
  const next = mode === SESSION_MODES.ephemeral ? SESSION_MODES.ephemeral : SESSION_MODES.stored;
  if(next === sessionMode){
    if(next === SESSION_MODES.ephemeral){
      startEphemeralSession();
    } else {
      updateSessionChipTexts();
    }
    return;
  }
  sessionMode = next;
  if(next === SESSION_MODES.ephemeral){
    startEphemeralSession();
  } else {
    createNewConversation();
  }
  updateSessionChipTexts();
}

function isLikelyMobile(){
  const width = window.innerWidth || document.documentElement.clientWidth || 0;
  const coarse = typeof window.matchMedia === 'function' && window.matchMedia('(pointer:coarse)').matches;
  const ua = typeof navigator !== 'undefined' ? (navigator.userAgent || '') : '';
  const uaMatch = /Android|webOS|iPhone|iPad|iPod|BlackBerry|BB10|Windows Phone|Mobile/i.test(ua);
  return width <= DEVICE_BREAKPOINT || (coarse && uaMatch);
}

function applyDeviceMode(force = false){
  const mobile = isLikelyMobile();
  if(!force && mobile === isMobileView){
    return;
  }
  isMobileView = mobile;
  if(document.body){
    document.body.classList.toggle('is-mobile', mobile);
    document.body.dataset.device = mobile ? 'mobile' : 'desktop';
  }
  closeSessionMenu();
}

applyDeviceMode(true);

window.addEventListener('resize', () => {
  if(resizeTimer){
    clearTimeout(resizeTimer);
  }
  resizeTimer = setTimeout(() => applyDeviceMode(), 120);
});

window.addEventListener('orientationchange', () => {
  setTimeout(() => applyDeviceMode(true), 120);
});

function renderMarkdown(target, markdown){
  if(!target) return;
  const content = typeof markdown === 'string' ? markdown : '';
  if(content && typeof marked !== 'undefined'){
    try{
      const rawHtml = marked.parse(content);
      const cleanHtml = (typeof DOMPurify !== 'undefined') ? DOMPurify.sanitize(rawHtml, { USE_PROFILES: { html: true } }) : rawHtml;
      target.innerHTML = cleanHtml;
    }catch(err){
      console.warn('Markdown render failed, falling back to textContent', err);
      target.textContent = content;
    }
  } else {
    target.textContent = content;
  }

  upgradeLooseLatex(target);

  if(typeof renderMathInElement === 'function'){
    try{
      renderMathInElement(target, {
        delimiters: [
          { left: '$$', right: '$$', display: true },
          { left: '$', right: '$', display: false },
          { left: '\\[', right: '\\]', display: true },
          { left: '\\(', right: '\\)', display: false },
        ],
        throwOnError: false,
      });
    }catch(err){
      console.warn('Math rendering failed', err);
    }
  }
}

function setBubbleContent(node, text, { allowMarkdown = true } = {}){
  if(!node) return;
  if(allowMarkdown){
    renderMarkdown(node, text || '');
  } else {
    node.textContent = text || '';
  }
}

function isStreaming(){
  return Boolean(activeStream);
}

function setSendButtonState(nextState){
  if(!sendBtn) return;
  const state = nextState === 'streaming' ? 'streaming' : 'idle';
  const label = state === 'streaming' ? t('stopGeneration') : t('send');
  sendBtn.setAttribute('aria-label', label);
  sendBtn.title = label;

  if(state === 'streaming'){
    sendBtn.classList.add('send--streaming');
    if(sendIcon){
      sendIcon.textContent = '…';
    }
  } else {
    sendBtn.classList.remove('send--streaming');
    if(sendIcon){
      sendIcon.textContent = '↑';
    }
  }

  currentSendState = state;
}

function stopStreaming(){
  if(!activeStream || !activeStream.controller) return;
  try{
    activeStream.controller.abort();
  }catch(err){
    console.warn('Abort controller failed', err);
  }
}

const LOOSE_LATEX_TRIGGERS = [
  '\\frac', '\\sqrt', '\\sum', '\\int', '\\prod', '\\lim', '\\alpha', '\\beta', '\\gamma',
  '\\delta', '\\Delta', '\\theta', '\\lambda', '\\mu', '\\sigma', '\\phi', '\\psi', '\\omega',
  '\\pi', '\\leq', '\\geq', '\\neq', '\\approx', '\\rightarrow', '\\left', '\\right', '\\infty',
  '\\partial', '\\nabla', '\\cdot', '\\times', '\\pm'
];

function appendKatexHTML(fragment, html){
  const template = document.createElement('template');
  template.innerHTML = html;
  fragment.appendChild(template.content.cloneNode(true));
}

function upgradeLooseLatex(root){
  if(!root || typeof katex === 'undefined') return;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node){
      if(!node || typeof node.nodeValue !== 'string') return NodeFilter.FILTER_SKIP;
      if(!node.nodeValue.includes('\\')) return NodeFilter.FILTER_SKIP;
      const parent = node.parentElement;
      if(parent && ['CODE', 'PRE', 'KBD', 'SAMP'].includes(parent.tagName)){
        return NodeFilter.FILTER_SKIP;
      }
      return NodeFilter.FILTER_ACCEPT;
    },
  });

  const replacements = [];
  let current;
  while((current = walker.nextNode())){
    const { nodeValue } = current;
    if(!LOOSE_LATEX_TRIGGERS.some((trigger) => nodeValue.includes(trigger))) continue;

    const parts = nodeValue.split(/(\n+)/);
    let mutated = false;
    const fragment = document.createDocumentFragment();

    for(const part of parts){
      if(part === ''){
        continue;
      }
      if(part.startsWith('\n')){
        fragment.appendChild(document.createTextNode(part));
        continue;
      }

      const leadingMatch = part.match(/^\s*/);
      const trailingMatch = part.match(/\s*$/);
      const leading = leadingMatch ? leadingMatch[0] : '';
      const trailing = trailingMatch ? trailingMatch[0] : '';
      const core = part.slice(leading.length, part.length - trailing.length);
      const trimmed = core.trim();

      let rendered = null;
      let display = false;
      let prefixText = '';
      let suffixText = '';

      if(trimmed && !trimmed.includes('$') && LOOSE_LATEX_TRIGGERS.some((trigger) => trimmed.includes(trigger))){
        display = trimmed.includes('=') || trimmed.length > 40 || trimmed.includes('\\begin') || trimmed.includes('\\\\');
        try{
          rendered = katex.renderToString(trimmed, { throwOnError: false, displayMode: display });
        }catch(err){
          rendered = null;
        }

        if(!rendered){
          const slashIndex = trimmed.indexOf('\\');
          if(slashIndex >= 0){
            prefixText = trimmed.slice(0, slashIndex);
            const candidate = trimmed.slice(slashIndex);
            if(LOOSE_LATEX_TRIGGERS.some((trigger) => candidate.includes(trigger))){
              display = candidate.includes('=') || candidate.length > 40 || candidate.includes('\\begin') || candidate.includes('\\\\');
              try{
                rendered = katex.renderToString(candidate, { throwOnError: false, displayMode: display });
                suffixText = '';
              }catch(err){
                rendered = null;
              }
            }
          }
        }
      }

      if(rendered){
        if(leading){
          fragment.appendChild(document.createTextNode(leading));
        }
        if(prefixText){
          fragment.appendChild(document.createTextNode(prefixText));
        }
        appendKatexHTML(fragment, rendered);
        if(suffixText){
          fragment.appendChild(document.createTextNode(suffixText));
        }
        if(trailing){
          fragment.appendChild(document.createTextNode(trailing));
        }
        mutated = true;
      } else {
        fragment.appendChild(document.createTextNode(part));
      }
    }

    if(mutated){
      replacements.push({ node: current, fragment });
    }
  }

  replacements.forEach(({ node, fragment }) => {
    if(node.parentNode){
      node.parentNode.replaceChild(fragment, node);
    }
  });
}

function attachCopyButton(container, text){
  if(!container) return;
  container.innerHTML = '';
  container.style.display = 'none';
  const label = document.createElement('span');
  label.textContent = t('copy');
  const icon = document.createElement('span');
  icon.textContent = '📋';
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'msg__copy';
  btn.setAttribute('aria-label', t('copy'));
  btn.appendChild(icon);
  btn.appendChild(label);

  const revert = () => {
    label.textContent = t('copy');
    btn.setAttribute('aria-label', t('copy'));
  };

  const showCopied = () => {
    label.textContent = t('copied');
    btn.setAttribute('aria-label', t('copied'));
    setTimeout(revert, 1600);
  };

  const doCopy = async () => {
    const value = text || '';
    if(!value){
      showCopied();
      return;
    }
    try{
      if(navigator.clipboard && navigator.clipboard.writeText){
        await navigator.clipboard.writeText(value);
        showCopied();
        return;
      }
    }catch(err){
      console.warn('Clipboard API failed, falling back', err);
    }
    try{
      const textarea = document.createElement('textarea');
      textarea.value = value;
      textarea.setAttribute('readonly', '');
      textarea.style.position = 'absolute';
      textarea.style.left = '-9999px';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      showCopied();
    }catch(err){
      console.error('Copy fallback failed', err);
    }
  };

  btn.addEventListener('click', doCopy);
  container.appendChild(btn);
  container.style.display = 'flex';
}

function populateBotCard(card, answer, thoughts, warning){
  if(!card) return;
  if(card.wrap){
    card.wrap.classList.remove('msg--streaming');
  }
  setBubbleContent(card.bubble, answer || t('ready'));
  attachCopyButton(card.tools, answer || '');
  if(thoughts){
    mountThoughts(card.wrap, thoughts);
  }
  if(warning){
    mountWarning(card.wrap, warning);
  }
}

async function startStreaming(form, prompt, card){
  if(!streamDecoder){
    throw new Error('Streaming not supported');
  }
  const controller = new AbortController();
  activeStream = {
    controller,
    prompt,
    card,
    answer: '',
    meta: null,
    error: null,
    promptAdded: false,
  };
  setSendButtonState('streaming');
  if(card.wrap){
    card.wrap.classList.add('msg--streaming');
  }
  if(card.bubble){
    card.bubble.textContent = '';
  }
  if(card.tools){
    card.tools.innerHTML = '';
    card.tools.style.display = 'none';
  }

  try{
    const response = await fetch(STREAM_ENDPOINT, {
      method: 'POST',
      body: form,
      signal: controller.signal,
    });
    if(!response.ok){
      let message = response.statusText;
      try{
        message = (await response.text()) || message;
      }catch(err){
        console.warn('Failed to read error response', err);
      }
      throw new Error(message || 'Request failed');
    }
    if(!response.body){
      throw new Error('Empty response');
    }
    await consumeStream(response.body, activeStream);
    finalizeStream(activeStream);
  }catch(err){
    if(err.name === 'AbortError' || err.message === 'AbortError'){
      finalizeStream(activeStream, { aborted: true });
    } else {
      finalizeStream(activeStream, { error: err });
    }
  }
}

async function consumeStream(body, state){
  if(!body) return;
  const reader = body.getReader();
  let buffer = '';
  try{
    while(true){
      const { value, done } = await reader.read();
      if(done) break;
      if(!value) continue;
      const chunk = streamDecoder.decode(value, { stream: true });
      buffer += chunk;
      buffer = processStreamBuffer(buffer, state);
      if(state.error){
        break;
      }
    }
  }finally{
    if(streamDecoder){
      const remainder = streamDecoder.decode();
      if(remainder){
        buffer += remainder;
      }
    }
    if(buffer.trim()){
      processStreamBuffer(buffer, state, true);
    }
  }
}

function processStreamBuffer(buffer, state, flush = false){
  if(!buffer){
    return '';
  }
  let working = buffer;
  let newlineIndex = working.indexOf('\n');
  while(newlineIndex !== -1){
    const raw = working.slice(0, newlineIndex);
    working = working.slice(newlineIndex + 1);
    if(raw.trim()){
      handleStreamEvent(state, raw);
      if(state.error){
        return '';
      }
    }
    newlineIndex = working.indexOf('\n');
  }
  if(flush){
    if(working.trim()){
      handleStreamEvent(state, working);
    }
    return '';
  }
  return working;
}

function handleStreamEvent(state, raw){
  let data;
  try{
    data = JSON.parse(raw);
  }catch(err){
    console.warn('Failed to parse stream chunk', err, raw);
    return;
  }
  const type = data.type || 'token';
  if(type === 'meta'){
    state.meta = data;
    return;
  }
  if(type === 'token'){
    const delta = typeof data.delta === 'string' ? data.delta : (typeof data.content === 'string' ? data.content : '');
    if(delta){
      state.answer += delta;
      if(state.card && state.card.bubble){
        state.card.bubble.textContent = state.answer;
      }
      scrollChat();
    }
    return;
  }
  if(type === 'error'){
    state.error = data.error || t('error');
    return;
  }
  if(type === 'done'){
    if(typeof data.content === 'string' && !state.answer){
      state.answer = data.content;
    }
  }
}

function finalizeStream(state, { error = null, aborted = false } = {}){
  if(!state) return;
  const card = state.card;
  if(card && card.wrap){
    card.wrap.classList.remove('msg--streaming');
  }

  const warningCode = state.meta && typeof state.meta.document_warning === 'string' ? state.meta.document_warning : null;
  const hasAnswer = typeof state.answer === 'string' && state.answer.trim().length > 0;
  const effectiveError = error || (state && state.error ? new Error(state.error) : null);

  if(effectiveError){
    const message = state.error || effectiveError.message || t('error');
    if(card && card.bubble){
      setBubbleContent(card.bubble, message, { allowMarkdown: false });
    }
    if(card && card.tools){
      card.tools.innerHTML = '';
      card.tools.style.display = 'none';
    }
  } else {
    if(card && card.bubble){
      const finalText = hasAnswer ? state.answer : '';
      const { answer, thoughts } = splitReply(finalText);
      populateBotCard(card, answer || finalText || t('ready'), thoughts, warningCode);
      if(aborted){
        mountWarning(card.wrap, 'generation_stopped');
      }
    }
  }

  if(activeStream === state){
    activeStream = null;
  }

  setSendButtonState('idle');
  pendingUpload = null;
  resetInputs();

  if(effectiveError){
    return;
  }

  if(!state.promptAdded){
    history.push({ role: 'user', content: state.prompt });
    state.promptAdded = true;
  }

  if(hasAnswer){
    const assistantEntry = { role: 'assistant', content: state.answer };
    if(warningCode){
      assistantEntry.warning = warningCode;
    }
    if(aborted){
      assistantEntry.stopped = true;
    }
    history.push(assistantEntry);
  }

  saveCurrentConversation();
}

function cloneHistoryMessages(source){
  if(!Array.isArray(source)) return [];
  return source.map((item) => ({ ...item }));
}

function generateConversationId(){
  return `c_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

function loadStoredConversations(){
  if(typeof localStorage === 'undefined') return [];
  try{
    const raw = localStorage.getItem(STORAGE_KEYS.conversations);
    if(!raw) return [];
    const parsed = JSON.parse(raw);
    if(!Array.isArray(parsed)) return [];
    const now = Date.now();
    return parsed
      .filter((item) => item && typeof item === 'object')
      .map((item) => {
        const created = Number(item.createdAt) || now;
        const historyData = Array.isArray(item.history) ? item.history : [];
        return {
          id: typeof item.id === 'string' ? item.id : generateConversationId(),
          title: typeof item.title === 'string' && item.title.trim() ? item.title : null,
          createdAt: created,
          updatedAt: Number(item.updatedAt) || created,
          history: historyData,
        };
      });
  }catch(err){
    console.warn('Failed to load conversations', err);
    return [];
  }
}

function persistConversations(){
  if(typeof localStorage === 'undefined') return;
  try{
    localStorage.setItem(STORAGE_KEYS.conversations, JSON.stringify(conversations));
  }catch(err){
    console.warn('Failed to persist conversations', err);
  }
}

function getCurrentConversation(){
  if(isEphemeralMode()){
    return ephemeralConversation;
  }
  if(!currentConversationId) return null;
  return conversations.find((c) => c && c.id === currentConversationId) || null;
}

function saveCurrentConversation({ silent = false, preserveTimestamp = false } = {}){
  if(isEphemeralMode()){
    if(ephemeralConversation){
      ephemeralConversation.history = cloneHistoryMessages(history);
      ephemeralConversation.updatedAt = Date.now();
    }
    return;
  }
  const convo = getCurrentConversation();
  if(!convo) return;
  convo.history = cloneHistoryMessages(history);
  const timestamp = Date.now();
  if(!convo.createdAt){
    convo.createdAt = timestamp;
  }
  if(!preserveTimestamp){
    convo.updatedAt = timestamp;
  }
  persistConversations();
  if(!silent){
    renderHistoryList();
  }
}

function formatTimestamp(ts){
  if(!ts) return '';
  try{
    const locale = localeLangCodes[currentLocale] || currentLocale;
    return new Date(ts).toLocaleString(locale, {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  }catch(err){
    return new Date(ts).toLocaleString();
  }
}

function renderHistoryList(){
  if(!historyList) return;
  historyList.innerHTML = '';
  if(!conversations.length){
    historyList.appendChild(el('div', 'history__empty', t('historyEmpty')));
    return;
  }
  const sorted = [...conversations].sort((a, b) => {
    const upA = a.updatedAt || 0;
    const upB = b.updatedAt || 0;
    return upB - upA;
  });
  sorted.forEach((conversation) => {
    const item = el('div', 'history__item');
    if(conversation.id === currentConversationId){
      item.classList.add('history__item--active');
    }
    const entry = el('button', 'history__entry');
    entry.type = 'button';
    entry.dataset.id = conversation.id;
    const title = el('span', 'history__entry-title', conversation.title || t('historyUntitled'));
    const meta = el('span', 'history__entry-meta', formatTimestamp(conversation.updatedAt || conversation.createdAt));
    entry.appendChild(title);
    entry.appendChild(meta);
    const delBtn = el('button', 'history__delete', '🗑');
    delBtn.type = 'button';
    delBtn.dataset.id = conversation.id;
    delBtn.setAttribute('aria-label', t('historyDelete'));
    delBtn.title = t('historyDelete');
    item.appendChild(entry);
    item.appendChild(delBtn);
    historyList.appendChild(item);
  });
}

function renderCurrentConversation(){
  if(!chat) return;
  chat.innerHTML = '';
  const convo = getCurrentConversation();
  if(!convo){
    scrollChat();
    updateChatVisualState();
    return;
  }
  const messages = Array.isArray(convo.history) ? convo.history : [];
  messages.forEach((msg) => {
    if(!msg || typeof msg !== 'object') return;
    if(msg.role === 'system') return;
    if(msg.role === 'user'){
      addUserCard(msg.content || '', null);
      return;
    }
    if(msg.role === 'assistant'){
      const card = buildBotCard();
      const { answer, thoughts } = splitReply(msg.content || '');
      const stopped = Boolean(msg && msg.stopped);
      const hasStoppedWarning = msg && msg.warning === 'generation_stopped';
      const warningCode = hasStoppedWarning ? null : msg.warning;
      populateBotCard(card, answer || t('ready'), thoughts, warningCode);
      if(stopped || hasStoppedWarning){
        mountWarning(card.wrap, 'generation_stopped');
      }
    }
  });
  scrollChat();
  updateChatVisualState();
}

function createNewConversation({ skipRender = false, silent = false } = {}){
  if(isStreaming()){
    stopStreaming();
  }
  sessionMode = SESSION_MODES.stored;
  updateSessionChipTexts();
  const conversation = {
    id: generateConversationId(),
    title: null,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    history: [],
  };
  conversations.push(conversation);
  currentConversationId = conversation.id;
  history = [];
  pendingUpload = null;
  resetInputs();
  if(promptInput) promptInput.value = '';
  syncSystemPrompt();
  saveCurrentConversation({ silent: true, preserveTimestamp: true });
  if(!skipRender){
    renderHistoryList();
    renderCurrentConversation();
  }
  if(!silent){
    persistConversations();
  }
  return conversation;
}

function switchConversation(id, { closePanel = true } = {}){
  if(!id) return;
  if(isEphemeralMode()){
    sessionMode = SESSION_MODES.stored;
    updateSessionChipTexts();
  }
  if(id === currentConversationId){
    if(closePanel) closeHistoryPanel();
    return;
  }
  const target = conversations.find((c) => c && c.id === id);
  if(!target) return;
  closeSessionMenu();
  currentConversationId = target.id;
  history = cloneHistoryMessages(target.history);
  pendingUpload = null;
  resetInputs();
  if(promptInput) promptInput.value = '';
  syncSystemPrompt();
  saveCurrentConversation({ silent: true, preserveTimestamp: true });
  renderHistoryList();
  renderCurrentConversation();
  if(closePanel) closeHistoryPanel();
}

function deleteConversation(id){
  if(!id) return;
  const idx = conversations.findIndex((c) => c && c.id === id);
  if(idx === -1) return;
  const wasCurrent = conversations[idx].id === currentConversationId;
  conversations.splice(idx, 1);
  persistConversations();
  if(!conversations.length){
    currentConversationId = null;
    history = [];
    createNewConversation();
    return;
  }
  if(wasCurrent){
    const fallback = [...conversations].sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0))[0];
    if(fallback){
      switchConversation(fallback.id, { closePanel: false });
    }
  } else {
    renderHistoryList();
  }
}

function updateConversationTitleFromPrompt(prompt){
  if(isEphemeralMode()){
    return;
  }
  const convo = getCurrentConversation();
  if(!convo) return;
  if(convo.title && convo.title.trim()) return;
  const trimmed = (prompt || '').trim();
  if(!trimmed) return;
  const normalized = trimmed.replace(/\s+/g, ' ');
  convo.title = normalized.length > 60 ? `${normalized.slice(0, 57)}…` : normalized;
  convo.updatedAt = Date.now();
  persistConversations();
  renderHistoryList();
}

function openHistoryPanel(){
  if(historyPanel){
    renderHistoryList();
    historyPanel.classList.remove('history--hidden');
  }
}

function closeHistoryPanel(){
  if(historyPanel){
    historyPanel.classList.add('history--hidden');
  }
}

function openSettingsPanel(){
  if(settingsPanel){
    settingsPanel.classList.remove('settings--hidden');
    renderModelOptions();
    if(settingsBtn){
      settingsBtn.setAttribute('aria-expanded', 'true');
    }
  }
}

function closeSettingsPanel(){
  if(settingsPanel){
    settingsPanel.classList.add('settings--hidden');
  }
  if(settingsBtn){
    settingsBtn.setAttribute('aria-expanded', 'false');
  }
}

function applyThemeChoice(themeName, { persist = true } = {}){
  const theme = THEMES[themeName] || THEMES.default;
  THEME_VARS.forEach((varName) => {
    const value = theme && Object.prototype.hasOwnProperty.call(theme, varName) ? theme[varName] : '';
    if(value){
      document.documentElement.style.setProperty(varName, value);
    } else {
      document.documentElement.style.removeProperty(varName);
    }
  });
  if(themeSelect){
    themeSelect.value = Object.prototype.hasOwnProperty.call(THEMES, themeName) ? themeName : 'default';
  }
  if(persist && typeof localStorage !== 'undefined'){
    try{
      localStorage.setItem(STORAGE_KEYS.theme, themeSelect ? themeSelect.value : themeName);
    }catch(err){
      console.warn('Failed to store theme preference', err);
    }
  }
}

function loadStoredTheme(){
  if(typeof localStorage === 'undefined') return 'default';
  try{
    const stored = localStorage.getItem(STORAGE_KEYS.theme);
    if(stored && Object.prototype.hasOwnProperty.call(THEMES, stored)){
      return stored;
    }
  }catch(err){
    console.warn('Failed to read theme preference', err);
  }
  return 'default';
}

function makeWarning(code){
  const text = translateWarning(code);
  if(!text) return null;
  return el('div', 'msg__warning', text);
}

function addAttachmentChip(container, upload){
  const wrap = el('div', 'msg__files');
  const isImage = upload.kind === 'image';
  const classes = ['thumb'];
  if(upload.kind === 'pdf'){
    classes.push('thumb--pdf');
  } else if(!isImage){
    classes.push('thumb--doc');
  }
  const chip = el('div', classes.join(' '));

  if(isImage && upload.previewUrl){
    const thumb = el('img');
    thumb.src = upload.previewUrl;
    thumb.alt = upload.file.name;
    thumb.addEventListener('load', () => {
      try{ URL.revokeObjectURL(upload.previewUrl); }catch(_err){}
    });
    chip.appendChild(thumb);
  } else {
    chip.appendChild(el('span', null, upload.kind === 'pdf' ? 'PDF' : 'TXT'));
  }

  chip.appendChild(el('span', null, upload.file.name));

  if(upload.kind === 'text' && upload.previewText){
    chip.appendChild(el('span', null, `— ${upload.previewText}`));
  }

  wrap.appendChild(chip);
  container.appendChild(wrap);
}

function addUserCard(promptText, upload){
  const wrap = el('div', 'msg msg--user');
  const bubble = el('div', 'msg__bubble', promptText || '');
  wrap.appendChild(bubble);

  if(upload){
    addAttachmentChip(wrap, upload);
    if(upload.warningCode){
      const warn = makeWarning(upload.warningCode);
      if(warn) wrap.appendChild(warn);
    }
  }

  chat.appendChild(wrap);
  scrollChat();
  updateChatVisualState();
}

function splitReply(raw){
  if(!raw) return { answer: '', thoughts: null };
  const match = raw.match(/think>([\s\S]*?)<\s*\/think>/i);
  if(!match) return { answer: raw.trim(), thoughts: null };
  const thoughts = match[1].trim();
  const answer = (raw.slice(0, match.index) + raw.slice(match.index + match[0].length)).trim();
  return { answer, thoughts };
}

function buildBotCard(){
  const wrap = el('div', 'msg msg--bot');
  const bubble = el('div', 'msg__bubble');
  setBubbleContent(bubble, '…', { allowMarkdown: false });
  wrap.appendChild(bubble);
  const tools = el('div', 'msg__tools');
  tools.style.display = 'none';
  wrap.appendChild(tools);
  chat.appendChild(wrap);
  scrollChat();
  updateChatVisualState();
  return { wrap, bubble, tools };
}

function mountThoughts(parent, thoughts){
  if(!thoughts) return;
  const details = el('details', 'msg__thoughts');
  const summary = el('summary', null, t('thoughtsSummary'));
  const body = el('div', 'msg__thoughts-body');
  setBubbleContent(body, thoughts);
  details.appendChild(summary);
  details.appendChild(body);
  const tools = parent.querySelector('.msg__tools');
  if(tools){
    parent.insertBefore(details, tools);
  } else {
    parent.appendChild(details);
  }
  scrollChat();
}

function mountWarning(parent, code){
  const node = makeWarning(code);
  if(node){
    const tools = parent.querySelector('.msg__tools');
    if(tools){
      parent.insertBefore(node, tools);
    } else {
      parent.appendChild(node);
    }
    scrollChat();
  }
}

function getSelectedModel(){
  if(modelSelect && !modelSelect.disabled && modelSelect.value){
    return modelSelect.value;
  }
  return selectedModel || 'qwen3:4b';
}

function hidePicker(){
  picker.classList.add('picker--hidden');
}

function showPicker(){
  picker.classList.remove('picker--hidden');
}

function openFileInput(input){
  if(!input) return;
  if(typeof input.showPicker === 'function'){
    try{
      input.showPicker();
      return;
    }catch(err){
      console.warn('showPicker failed, falling back to click()', err);
    }
  }
  input.click();
}

function resetInputs(){
  if(imageInput) imageInput.value = '';
  if(textInput) textInput.value = '';
  if(pdfInput) pdfInput.value = '';
}

function prepareImageUpload(file){
  if(!file) return;
  pendingUpload = {
    file,
    kind: 'image',
    previewUrl: URL.createObjectURL(file),
    warningCode: null,
  };
  hidePicker();
}

function prepareTextUpload(file){
  if(!file) return;
  pendingUpload = {
    file,
    kind: 'text',
    previewText: '',
    warningCode: null,
    loading: true,
  };
  const reader = new FileReader();
  reader.onload = () => {
    const text = typeof reader.result === 'string' ? reader.result : '';
    const limit = charLimitForModel(getSelectedModel());
    const warning = text.length > limit ? 'text_truncated' : null;
    if(pendingUpload && pendingUpload.file === file){
      pendingUpload.previewText = text.slice(0, 120).replace(/\s+/g, ' ').trim();
      pendingUpload.warningCode = warning;
      pendingUpload.loading = false;
    }
    hidePicker();
  };
  reader.onerror = () => {
    console.error('Failed to read text file');
    if(pendingUpload && pendingUpload.file === file){
      pendingUpload = null;
    }
    hidePicker();
  };
  reader.readAsText(file);
}

function preparePdfUpload(file){
  if(!file) return;
  const charLimit = charLimitForModel(getSelectedModel());
  const approxChars = file.size;
  const warning = approxChars > charLimit * 2 ? 'pdf_truncated' : (file.size > 4 * 1024 * 1024 ? 'pdf_truncated' : null);
  pendingUpload = {
    file,
    kind: 'pdf',
    warningCode: warning,
  };
  hidePicker();
}

async function send(){
  if(isStreaming()){
    stopStreaming();
    return;
  }

  if(pendingUpload && pendingUpload.loading){
    return;
  }

  const prompt = promptInput.value.trim();
  if(!prompt && !pendingUpload){
    promptInput.focus();
    return;
  }

  const uploadSnapshot = pendingUpload ? { ...pendingUpload } : null;
  addUserCard(prompt, uploadSnapshot);
  updateConversationTitleFromPrompt(prompt);

  const form = new FormData();
  form.append('prompt', prompt);
  form.append('history', JSON.stringify(history));
  form.append('model', getSelectedModel());
  form.append('ephemeral', isEphemeralMode() ? '1' : '0');

  const langCode = localeLangCodes[currentLocale];
  if(langCode){
    form.append('lang', langCode);
  }

  if(pendingUpload){
    form.append('upload_kind', pendingUpload.kind);
    const file = pendingUpload.file;
    const name = file ? file.name : 'upload';
    if(pendingUpload.kind === 'image'){
      if(file){
        form.append('image', file, name);
        form.append('upload', file, name);
      }
    } else if(file){
      form.append('upload', file, name);
    }
  }

  promptInput.value = '';

  const botCard = buildBotCard();

  try{
    await startStreaming(form, prompt, botCard);
  }catch(err){
    console.error('Streaming failed', err);
    setSendButtonState('idle');
    pendingUpload = null;
    resetInputs();
    const message = (err && err.message) ? err.message : t('error');
    setBubbleContent(botCard.bubble, message, { allowMarkdown: false });
    if(botCard.tools){
      botCard.tools.innerHTML = '';
      botCard.tools.style.display = 'none';
    }
  }
}

sendBtn.addEventListener('click', send);
promptInput.addEventListener('keydown', (e) => {
  if(e.key === 'Enter' && !e.shiftKey){
    e.preventDefault();
    send();
  }
});

if(languageSelect){
  languageSelect.addEventListener('change', (e) => {
    applyLocale(e.target.value);
  });
}

if(modelSelect){
  modelSelect.addEventListener('change', () => {
    selectedModel = modelSelect.value;
  });
}

if(addBtn){
  addBtn.addEventListener('click', (e) => {
    e.preventDefault();
    showPicker();
  });
}

if(newChatBtn){
  newChatBtn.addEventListener('click', () => {
    if(isEphemeralMode()){
      startEphemeralSession();
    } else {
      createNewConversation();
    }
  });
}

if(historyBtn){
  historyBtn.addEventListener('click', () => {
    openHistoryPanel();
  });
}

if(settingsBtn){
  settingsBtn.addEventListener('click', () => {
    openSettingsPanel();
  });
}

if(historyClose){
  historyClose.addEventListener('click', () => {
    closeHistoryPanel();
  });
}

if(settingsClose){
  settingsClose.addEventListener('click', () => {
    closeSettingsPanel();
  });
}

if(historyPanel){
  historyPanel.addEventListener('click', (e) => {
    if(e.target === historyPanel){
      closeHistoryPanel();
    }
  });
}

if(settingsPanel){
  settingsPanel.addEventListener('click', (e) => {
    if(e.target === settingsPanel){
      closeSettingsPanel();
    }
  });
}

if(sessionChip){
  sessionChip.addEventListener('click', (e) => {
    e.preventDefault();
    toggleSessionMenu();
  });
}

if(sessionMenuButtons.length){
  sessionMenuButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetMode = btn.dataset.mode === 'ephemeral' ? SESSION_MODES.ephemeral : SESSION_MODES.stored;
      setSessionMode(targetMode);
      closeSessionMenu();
    });
  });
}

if(historyList){
  historyList.addEventListener('click', (e) => {
    const deleteBtn = e.target.closest('.history__delete');
    if(deleteBtn){
      const id = deleteBtn.dataset.id;
      deleteConversation(id);
      e.stopPropagation();
      return;
    }
    const entry = e.target.closest('.history__entry');
    if(entry){
      const id = entry.dataset.id;
      switchConversation(id);
    }
  });
}

if(themeSelect){
  themeSelect.addEventListener('change', (e) => {
    applyThemeChoice(e.target.value);
  });
}

if(pickerClose){
  pickerClose.addEventListener('click', hidePicker);
}

picker.addEventListener('click', (e) => {
  if(e.target === picker){
    hidePicker();
  }
});

document.addEventListener('click', (e) => {
  if(!sessionMenu || sessionMenu.classList.contains('session-menu--hidden')){
    return;
  }
  const clickedChip = sessionChip && sessionChip.contains(e.target);
  const clickedMenu = sessionMenu.contains(e.target);
  if(clickedChip || clickedMenu){
    return;
  }
  closeSessionMenu();
});

document.addEventListener('keydown', (e) => {
  if(e.key === 'Escape'){
    if(!picker.classList.contains('picker--hidden')){
      hidePicker();
    }
    if(historyPanel && !historyPanel.classList.contains('history--hidden')){
      closeHistoryPanel();
    }
    if(settingsPanel && !settingsPanel.classList.contains('settings--hidden')){
      closeSettingsPanel();
    }
    if(sessionMenu && !sessionMenu.classList.contains('session-menu--hidden')){
      closeSessionMenu();
    }
  }
});

fileButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    const type = btn.dataset.upload;
    if(type === 'image'){
      openFileInput(imageInput);
    }
    if(type === 'text'){
      openFileInput(textInput);
    }
    if(type === 'pdf'){
      openFileInput(pdfInput);
    }
  });
});

if(imageInput){
  imageInput.addEventListener('change', () => {
    const file = imageInput.files && imageInput.files[0] ? imageInput.files[0] : null;
    if(file) prepareImageUpload(file);
  });
}

if(textInput){
  textInput.addEventListener('change', () => {
    const file = textInput.files && textInput.files[0] ? textInput.files[0] : null;
    if(file) prepareTextUpload(file);
  });
}

if(pdfInput){
  pdfInput.addEventListener('change', () => {
    const file = pdfInput.files && pdfInput.files[0] ? pdfInput.files[0] : null;
    if(file) preparePdfUpload(file);
  });
}

const storedTheme = loadStoredTheme();
applyThemeChoice(storedTheme, { persist: false });

conversations = loadStoredConversations();
persistConversations();
if(conversations.length){
  const latest = [...conversations].sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0))[0];
  if(latest){
    currentConversationId = latest.id;
    history = cloneHistoryMessages(latest.history);
  }
} else {
  createNewConversation({ skipRender: true, silent: true });
}

updateSessionChipTexts();
applyLocale(currentLocale);
renderHistoryList();
renderCurrentConversation();
saveCurrentConversation({ silent: true, preserveTimestamp: true });
loadModels();
