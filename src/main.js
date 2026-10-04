import './styles.css';
import './motion.css';
import { buildPreview, operationsFromPreview } from './rename-engine.js';
import { invoke } from '@tauri-apps/api/core';
import { getCurrentWebview } from '@tauri-apps/api/webview';
import { open, confirm, message, save } from '@tauri-apps/plugin-dialog';
import { openUrl } from '@tauri-apps/plugin-opener';
import { historyTitle, historyMeta } from './history-i18n.js';
import { dryRunCsv, extensionChoices, filterFiles, folderChoices, instantiatePreset, presetRules } from './workspace-utils.js';

const icons = {
  folder: '<svg viewBox="0 0 24 24"><path d="M3 6.5h6l2 2h10v9.5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M3 8.5v-2a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2"/></svg>',
  files: '<svg viewBox="0 0 24 24"><path d="M7 2h7l4 4v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z"/><path d="M14 2v5h5"/><path d="M9 13h6M9 17h6"/></svg>',
  rules: '<svg viewBox="0 0 24 24"><path d="M4 6h8M16 6h4M4 12h3M11 12h9M4 18h10M18 18h2"/><circle cx="14" cy="6" r="2"/><circle cx="9" cy="12" r="2"/><circle cx="16" cy="18" r="2"/></svg>',
  history: '<svg viewBox="0 0 24 24"><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5M12 7v5l3 2"/></svg>',
  settings: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1a1.7 1.7 0 0 0 1.9.3A1.7 1.7 0 0 0 10 3V2.8h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1z"/></svg>',
  plus: '<svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>',
  trash: '<svg viewBox="0 0 24 24"><path d="M4 7h16M9 7V4h6v3M7 7l1 14h8l1-14M10 11v6M14 11v6"/></svg>',
  grip: '<svg viewBox="0 0 24 24"><circle cx="9" cy="7" r="1"/><circle cx="15" cy="7" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="9" cy="17" r="1"/><circle cx="15" cy="17" r="1"/></svg>',
  undo: '<svg viewBox="0 0 24 24"><path d="M9 7 4 12l5 5"/><path d="M20 17a7 7 0 0 0-7-7H4"/></svg>',
  sun: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
  moon: '<svg viewBox="0 0 24 24"><path d="M20 15.5A8.5 8.5 0 0 1 8.5 4 8.5 8.5 0 1 0 20 15.5z"/></svg>',
  chevron: '<svg viewBox="0 0 24 24"><path d="m7 9 5 5 5-5"/></svg>',
  check: '<svg viewBox="0 0 24 24"><path d="m5 12 4 4 10-10"/></svg>',
  globe: '<svg class="globe-icon" viewBox="0 0 390 390" role="img" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><path d="M195,0C87.305,0,0,87.304,0,195s87.305,195,195,195s195-87.304,195-195S302.695,0,195,0z M119.524,45.678c-3.493,4.838-6.838,10.033-10.007,15.6c-4.841,8.503-9.16,17.656-12.945,27.33c-8.064-2.22-16.089-4.713-24.064-7.483C85.91,66.718,101.813,54.667,119.524,45.678z M52.298,107.694c11.438,4.293,22.976,8.056,34.591,11.293c-4.78,18.934-7.744,39.182-8.745,60.087h-49.72C30.888,153.108,39.305,128.852,52.298,107.694z M52.298,282.306c-12.994-21.159-21.411-45.414-23.874-71.38h49.72c1.002,20.905,3.965,41.153,8.745,60.087C75.274,274.25,63.736,278.013,52.298,282.306z M72.508,308.876c7.975-2.77,16-5.265,24.063-7.483c3.786,9.674,8.105,18.827,12.946,27.33c3.168,5.566,6.514,10.762,10.007,15.6C101.813,335.333,85.91,323.283,72.508,308.876z M179.074,354.07c-20.393-7.648-38.458-29.593-51.05-59.894c16.931-3.125,33.977-5.059,51.05-5.8V354.07z M179.074,256.454c-20.448,0.818-40.862,3.221-61.117,7.191c-4.16-16.355-6.908-34.13-7.915-52.72h69.032V256.454z M179.074,179.074h-69.032c1.007-18.59,3.755-36.365,7.915-52.72c20.254,3.971,40.669,6.373,61.117,7.191V179.074z M179.074,101.623c-17.073-0.741-34.118-2.675-51.05-5.8c12.592-30.301,30.657-52.245,51.05-59.894V101.623z M337.703,107.697c12.993,21.157,21.409,45.412,23.872,71.377h-49.72c-1.001-20.903-3.965-41.151-8.744-60.083C314.727,115.754,326.266,111.992,337.703,107.697z M317.495,81.128c-7.975,2.77-16,5.265-24.065,7.484c-3.786-9.676-8.105-18.831-12.947-27.335c-3.169-5.566-6.514-10.762-10.006-15.6C288.189,54.668,304.092,66.72,317.495,81.128z M210.926,35.93c20.393,7.648,38.459,29.595,51.051,59.898c-16.931,3.124-33.977,5.057-51.051,5.797V35.93z M210.926,133.547c20.45-0.817,40.865-3.219,61.118-7.188c4.16,16.354,6.907,34.128,7.914,52.716h-69.032V133.547z M210.926,210.926h69.032c-1.007,18.588-3.754,36.362-7.914,52.716c-20.253-3.97-40.668-6.371-61.118-7.189V210.926z M210.926,354.07v-65.694c17.075,0.741,34.121,2.673,51.051,5.798C249.385,324.475,231.319,346.422,210.926,354.07z M270.477,344.322c3.493-4.838,6.838-10.033,10.006-15.6c4.842-8.504,9.161-17.659,12.947-27.334c8.064,2.22,16.089,4.714,24.065,7.484C304.092,323.28,288.189,335.332,270.477,344.322z M337.703,282.304c-11.437-4.296-22.976-8.058-34.591-11.296c4.779-18.932,7.742-39.179,8.744-60.082h49.72C359.112,236.891,350.696,261.146,337.703,282.304z"/></svg>',
  coffee: '<svg class="coffee-icon" width="24" height="24" viewBox="0 0 24 24" role="img" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><path d="m20.216 6.415-.132-.666c-.119-.598-.388-1.163-1.001-1.379-.197-.069-.42-.098-.57-.241-.152-.143-.196-.366-.231-.572-.065-.378-.125-.756-.192-1.133-.057-.325-.102-.69-.25-.987-.195-.4-.597-.634-.996-.788a5.723 5.723 0 0 0-.626-.194c-1-.263-2.05-.36-3.077-.416a25.834 25.834 0 0 0-3.7.062c-.915.083-1.88.184-2.75.5-.318.116-.646.256-.888.501-.297.302-.393.77-.177 1.146.154.267.415.456.692.58.36.162.737.284 1.123.366 1.075.238 2.189.331 3.287.37 1.218.05 2.437.01 3.65-.118.299-.033.598-.073.896-.119.352-.054.578-.513.474-.834-.124-.383-.457-.531-.834-.473-.466.074-.96.108-1.382.146-1.177.08-2.358.082-3.536.006a22.228 22.228 0 0 1-1.157-.107c-.086-.01-.18-.025-.258-.036-.243-.036-.484-.08-.724-.13-.111-.027-.111-.185 0-.212h.005c.277-.06.557-.108.838-.147h.002c.131-.009.263-.032.394-.048a25.076 25.076 0 0 1 3.426-.12c.674.019 1.347.067 2.017.144l.228.031c.267.04.533.088.798.145.392.085.895.113 1.07.542.055.137.08.288.111.431l.319 1.484a.237.237 0 0 1-.199.284h-.003c-.037.006-.075.01-.112.015a36.704 36.704 0 0 1-4.743.295 37.059 37.059 0 0 1-4.699-.304c-.14-.017-.293-.042-.417-.06-.326-.048-.649-.108-.973-.161-.393-.065-.768-.032-1.123.161-.29.16-.527.404-.675.701-.154.316-.199.66-.267 1-.069.34-.176.707-.135 1.056.087.753.613 1.365 1.37 1.502a39.69 39.69 0 0 0 11.343.376.483.483 0 0 1 .535.53l-.071.697-1.018 9.907c-.041.41-.047.832-.125 1.237-.122.637-.553 1.028-1.182 1.171-.577.131-1.165.2-1.756.205-.656.004-1.31-.025-1.966-.022-.699.004-1.556-.06-2.095-.58-.475-.458-.54-1.174-.605-1.793l-.731-7.013-.322-3.094c-.037-.351-.286-.695-.678-.678-.336.015-.718.3-.678.679l.228 2.185.949 9.112c.147 1.344 1.174 2.068 2.446 2.272.742.12 1.503.144 2.257.156.966.016 1.942.053 2.892-.122 1.408-.258 2.465-1.198 2.616-2.657.34-3.332.683-6.663 1.024-9.995l.215-2.087a.484.484 0 0 1 .39-.426c.402-.078.787-.212 1.074-.518.455-.488.546-1.124.385-1.766zm-1.478.772c-.145.137-.363.201-.578.233-2.416.359-4.866.54-7.308.46-1.748-.06-3.477-.254-5.207-.498-.17-.024-.353-.055-.47-.18-.22-.236-.111-.71-.054-.995.052-.26.152-.609.463-.646.484-.057 1.046.148 1.526.22.577.088 1.156.159 1.737.212 2.48.226 5.002.19 7.472-.14.45-.06.899-.13 1.345-.21.399-.072.84-.206 1.08.206.166.281.188.657.162.974a.544.544 0 0 1-.169.364zm-6.159 3.9c-.862.37-1.84.788-3.109.788a5.884 5.884 0 0 1-1.569-.217l.877 9.004c.065.78.717 1.38 1.5 1.38 0 0 1.243.065 1.658.065.447 0 1.786-.065 1.786-.065.783 0 1.434-.6 1.499-1.38l.94-9.95a3.996 3.996 0 0 0-1.322-.238c-.826 0-1.491.284-2.26.613z"/></svg>'
};

const builtInPresets = [
  {
    id: 'photos-sequential',
    it: 'Foto sequenziali',
    en: 'Sequential photos',
    rules: [
      { type: 'template', enabled: true, pattern: '{exif}-{counter}.{ext}', start: 1, digits: 3, dateFormat: 'YYYY-MM-DD' }
    ]
  },
  {
    id: 'clean-names',
    it: 'Pulizia nomi',
    en: 'Clean filenames',
    rules: [
      { type: 'replace', enabled: true, find: '[_\\s]+', replace: '-', regex: true, caseSensitive: false },
      { type: 'trim', enabled: true, collapseSpaces: true, replacement: ' ' },
      { type: 'case', enabled: true, mode: 'lower' }
    ]
  },
  {
    id: 'web-assets',
    it: 'Asset web',
    en: 'Web assets',
    rules: [
      { type: 'replace', enabled: true, find: '[^a-zA-Z0-9]+', replace: '-', regex: true, caseSensitive: false },
      { type: 'replace', enabled: true, find: '^-+|-+$', replace: '', regex: true, caseSensitive: true },
      { type: 'case', enabled: true, mode: 'lower' },
      { type: 'trim', enabled: true, collapseSpaces: true, replacement: '-' }
    ]
  }
];

const defaultRules = [
  { id: crypto.randomUUID(), type: 'replace', enabled: true, find: 'IMG_', replace: '', regex: false, caseSensitive: false },
  { id: crypto.randomUUID(), type: 'case', enabled: true, mode: 'lower' },
  { id: crypto.randomUUID(), type: 'prefix', enabled: true, value: 'foto-' },
  { id: crypto.randomUUID(), type: 'sequence', enabled: true, start: 1, step: 1, digits: 3, position: 'suffix', separator: '-' }
];

const state = {
  page: 'rename',
  files: [],
  rules: JSON.parse(localStorage.getItem('davrename-rules') || 'null') || defaultRules,
  history: [],
  platform: navigator.userAgent.includes('Windows') ? 'win32' : (navigator.userAgent.includes('Mac') ? 'darwin' : 'linux'),
  settings: JSON.parse(localStorage.getItem('davrename-settings') || 'null') || {
    theme: 'system', language: 'it', recursiveFolders: true, verifyBeforeRename: true
  },
  busy: false,
  dragOver: false,
  lastResult: null,
  previewPage: 0,
  filters: { extension: 'all', folder: 'all' },
  customPresets: JSON.parse(localStorage.getItem('davrename-presets') || '[]'),
  presetSelection: ''
};

const app = document.querySelector('#app');
let pageTransitionLocked = false;

function t(it, en) { return state.settings.language === 'en' ? en : it; }

function saveState() {
  localStorage.setItem('davrename-rules', JSON.stringify(state.rules));
  localStorage.setItem('davrename-settings', JSON.stringify(state.settings));
  localStorage.setItem('davrename-presets', JSON.stringify(state.customPresets));
}

function applyTheme() {
  const dark = state.settings.theme === 'dark' || (state.settings.theme === 'system' && matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  document.documentElement.lang = state.settings.language;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? '#0b0b0d' : '#fbfbfd');
}

function themeTransitionGeometry(element) {
  if (!element) return null;
  const rect = element.getBoundingClientRect();
  const x = rect.left + rect.width / 2;
  const y = rect.top + rect.height / 2;
  return { x, y, radius: Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y)) };
}

function runUiTransition(kind, update, origin = null) {
  const root = document.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) {
    update();
    return;
  }
  if (kind === 'theme') {
    const geometry = themeTransitionGeometry(origin);
    if (geometry && typeof document.startViewTransition === 'function') {
      root.style.setProperty('--theme-transition-x', `${geometry.x}px`);
      root.style.setProperty('--theme-transition-y', `${geometry.y}px`);
      root.style.setProperty('--theme-transition-radius', `${geometry.radius}px`);
      root.classList.add('theme-transitioning', 'theme-transition-capture');
      const transition = document.startViewTransition(() => update());
      transition.ready.finally(() => root.classList.remove('theme-transition-capture'));
      transition.finished.finally(() => root.classList.remove('theme-transitioning', 'theme-transition-capture'));
      return;
    }
    root.classList.add('theme-transition-fallback');
    update();
    setTimeout(() => root.classList.remove('theme-transition-fallback'), 520);
    return;
  }
  if (typeof document.startViewTransition === 'function') {
    root.dataset.uiTransition = kind;
    const transition = document.startViewTransition(() => update());
    transition.finished.finally(() => {
      if (root.dataset.uiTransition === kind) delete root.dataset.uiTransition;
    });
    return;
  }
  root.dataset.uiTransition = `${kind}-out`;
  setTimeout(() => {
    update();
    root.dataset.uiTransition = `${kind}-in`;
    setTimeout(() => {
      if (root.dataset.uiTransition === `${kind}-in`) delete root.dataset.uiTransition;
    }, 430);
  }, 170);
}

function setVisualSetting(key, value, kind, origin = null) {
  if (state.settings[key] === value) return;
  runUiTransition(kind, () => {
    state.settings[key] = value;
    saveState();
    render();
  }, origin);
}

async function navigatePage(page) {
  if (pageTransitionLocked || page === state.page) return;
  pageTransitionLocked = true;
  try {
    if (page === 'history') await loadHistory(false);
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const main = document.querySelector('.main');
    if (!reduced && main) {
      main.classList.add('is-page-leaving');
      await new Promise((resolve) => setTimeout(resolve, 170));
    }
    state.page = page;
    render({ motion: 'page' });
  } finally {
    pageTransitionLocked = false;
  }
}

function render(options = {}) {
  const motion = options.motion || 'none';
  applyTheme();
  normalizeActiveFilters();
  const visibleFiles = filterFiles(state.files, state.filters);
  const preview = buildPreview(visibleFiles, state.rules, state.platform);
  app.innerHTML = `
    <div class="shell" data-motion-mode="${motion}">
      <aside class="sidebar">
        <div class="brand"><span>_dav</span>RENAME</div>
        <nav aria-label="${t('Navigazione principale','Main navigation')}">
          ${navButton('rename', icons.files, t('Rinomina','Rename'))}
          ${navButton('history', icons.history, t('Attività','Activity'))}
          ${navButton('settings', icons.settings, t('Impostazioni','Settings'))}
        </nav>
        <div class="sidebar-bottom">
          <button class="coffee-button" id="coffee-button" type="button" title="${t('Offrimi Un Caffè','Buy Me A Coffee')}" aria-label="${t('Offrimi Un Caffè','Buy Me A Coffee')}">${icons.coffee}<span>${t('Offrimi Un Caffè','Buy Me A Coffee')}</span></button>
          <button class="icon-button theme-toggle" id="theme-toggle" title="${t('Cambia tema','Change theme')}" aria-label="${t('Cambia tema','Change theme')}"><span class="theme-icon theme-icon-sun">${icons.sun}</span><span class="theme-icon theme-icon-moon">${icons.moon}</span></button>
        </div>
      </aside>
      <main class="main ${motion !== 'none' ? 'motion-main' : ''}">
        ${state.page === 'rename' ? renderRename(preview, visibleFiles) : state.page === 'history' ? renderHistory() : renderSettings()}
      </main>
    </div>
    <div id="toast-region" aria-live="polite" aria-atomic="true"></div>
  `;
  bindEvents(preview);
}

function normalizeActiveFilters() {
  const extensions = extensionChoices(state.files);
  const folders = folderChoices(state.files);
  if (state.filters.extension !== 'all' && !extensions.includes(state.filters.extension)) state.filters.extension = 'all';
  if (state.filters.folder !== 'all' && !folders.includes(state.filters.folder)) state.filters.folder = 'all';
}

function navButton(page, icon, label) {
  return `<button class="nav-item ${state.page === page ? 'active' : ''}" data-page="${page}">${icon}<span>${label}</span></button>`;
}

function renderRename(preview, visibleFiles) {
  const hasFiles = state.files.length > 0;
  return `
    <header class="topbar">
      <div>
        <div class="eyebrow">${t('Strumento locale','Local tool')}</div>
        <h1>${t('Rinomina file','Rename files')}</h1>
      </div>
      <div class="top-actions">
        <button class="button secondary" id="open-folder">${icons.folder}${t('Cartella','Folder')}</button>
        <button class="button secondary" id="open-files">${icons.files}${t('File','Files')}</button>
      </div>
    </header>
    <section class="workspace ${hasFiles ? 'has-files' : ''}">
      ${hasFiles ? renderWorkspace(preview, visibleFiles) : renderEmptyState()}
    </section>
  `;
}

function renderEmptyState() {
  return `<div class="empty-wrap">
    <div class="drop-zone ${state.dragOver ? 'drag-over' : ''}" id="drop-zone">
      <div class="drop-icon">${icons.folder}</div>
      <h2>${t('Trascina qui i tuoi file','Drop your files here')}</h2>
      <p>${t('Oppure scegli file o una cartella. Nulla viene modificato prima della conferma.','Or choose files or a folder. Nothing changes before you confirm.')}</p>
      <div class="drop-actions">
        <button class="button primary" id="empty-open-files">${t('Seleziona file','Choose files')}</button>
        <button class="button secondary" id="empty-open-folder">${t('Seleziona cartella','Choose folder')}</button>
      </div>
    </div>
    <div class="trust-row">
      <div><strong>${t('Anteprima live','Live preview')}</strong><span>${t('Controlla ogni nome prima di applicarlo.','Check every name before applying it.')}</span></div>
      <div><strong>${t('Cronologia Undo','Undo history')}</strong><span>${t('Ripristina in sicurezza più operazioni compatibili.','Safely restore multiple compatible operations.')}</span></div>
      <div><strong>${t('Solo locale','Local only')}</strong><span>${t('I file non lasciano mai il computer.','Your files never leave the computer.')}</span></div>
    </div>
  </div>`;
}

function renderWorkspace(preview, visibleFiles) {
  const errors = preview.invalidCount + preview.ruleErrors.length;
  const extensions = extensionChoices(state.files);
  const folders = folderChoices(state.files);
  const filtered = visibleFiles.length !== state.files.length;
  const preset = state.presetSelection;
  const customSelected = preset.startsWith('custom:');
  return `<div class="workspace-grid">
    <section class="panel rules-panel">
      <div class="panel-head">
        <div><div class="eyebrow">${t('Pipeline','Pipeline')}</div><h2>${t('Regole','Rules')}</h2></div>
        <button class="button compact secondary" id="add-rule">${icons.plus}${t('Aggiungi','Add')}</button>
      </div>
      <div class="preset-box">
        <div class="preset-row">
          <select id="preset-select" aria-label="${t('Preset regole','Rule preset')}">
            <option value="">${t('Scegli preset…','Choose preset…')}</option>
            <optgroup label="${t('DAV integrati','Built-in DAV')}">${builtInPresets.map((item) => `<option value="builtin:${item.id}" ${preset === `builtin:${item.id}` ? 'selected' : ''}>${escapeHtml(t(item.it, item.en))}</option>`).join('')}</optgroup>
            ${state.customPresets.length ? `<optgroup label="${t('I tuoi preset','Your presets')}">${state.customPresets.map((item) => `<option value="custom:${item.id}" ${preset === `custom:${item.id}` ? 'selected' : ''}>${escapeHtml(item.name)}</option>`).join('')}</optgroup>` : ''}
          </select>
          <button class="button compact secondary" id="apply-preset" ${preset ? '' : 'disabled'}>${t('Applica','Apply')}</button>
          <button class="icon-button" id="delete-preset" ${customSelected ? '' : 'disabled'} title="${t('Elimina preset','Delete preset')}">${icons.trash}</button>
        </div>
        <div class="preset-save-row">
          <input id="preset-name" maxlength="48" placeholder="${t('Nome nuovo preset','New preset name')}" aria-label="${t('Nome nuovo preset','New preset name')}">
          <button class="button compact secondary" id="save-preset">${t('Salva regole','Save rules')}</button>
        </div>
      </div>
      <div class="rule-list" id="rule-list">
        ${state.rules.map((rule, index) => renderRule(rule, index)).join('')}
      </div>
      <button class="text-button" id="reset-rules">${t('Ripristina esempio','Reset example')}</button>
    </section>
    <section class="panel preview-panel">
      <div class="panel-head preview-head">
        <div><div class="eyebrow">${t('Anteprima','Preview')}</div><h2>${filtered ? `${visibleFiles.length} / ${state.files.length}` : state.files.length} ${t('file selezionati','files selected')}</h2></div>
        <div class="preview-actions"><button class="text-button danger" id="clear-files">${t('Rimuovi tutti','Clear all')}</button></div>
      </div>
      <div class="filter-bar">
        <label><span>${t('Estensione','Extension')}</span><select id="file-extension-filter"><option value="all">${t('Tutte','All')}</option>${extensions.map((extension) => `<option value="${escapeAttr(extension)}" ${state.filters.extension === extension ? 'selected' : ''}>.${escapeHtml(extension)}</option>`).join('')}</select></label>
        <label><span>${t('Cartella','Folder')}</span><select id="file-folder-filter"><option value="all">${t('Tutte le cartelle','All folders')}</option>${folders.map((folder) => `<option value="${escapeAttr(folder)}" ${state.filters.folder === folder ? 'selected' : ''}>${escapeHtml(folder)}</option>`).join('')}</select></label>
        <button class="button compact secondary" id="clear-filters" ${filtered ? '' : 'disabled'}>${t('Azzera filtri','Clear filters')}</button>
        <button class="button compact secondary" id="export-dry-run" ${preview.rows.length ? '' : 'disabled'}>${t('Esporta dry run','Export dry run')}</button>
      </div>
      ${preview.ruleErrors.length ? `<div class="alert error">${preview.ruleErrors.join('<br>')}</div>` : ''}
      <div class="table-wrap">
        <table>
          <thead><tr><th>${t('Nome originale','Original name')}</th><th>${t('Nuovo nome','New name')}</th><th>${t('Stato','Status')}</th></tr></thead>
          <tbody>${pagedRows(preview.rows).map(renderRow).join('')}</tbody>
        </table>
      </div>
      ${renderPager(preview.rows.length)}
      <div class="actionbar">
        <div class="summary">
          <span><strong>${preview.changedCount}</strong> ${t('modifiche','changes')}</span>
          <span class="${errors ? 'bad' : ''}"><strong>${errors}</strong> ${t('problemi','issues')}</span>
        </div>
        <button class="button primary" id="rename-button" ${state.busy || preview.changedCount === 0 || errors ? 'disabled' : ''}>
          ${state.busy ? `<span class="spinner"></span>${t('Rinomina in corso…','Renaming…')}` : t(`Rinomina ${preview.changedCount} file`,`Rename ${preview.changedCount} files`)}
        </button>
      </div>
    </section>
  </div>`;
}

function pagedRows(rows) {
  const pageSize = 250;
  const pages = Math.max(1, Math.ceil(rows.length / pageSize));
  state.previewPage = Math.min(state.previewPage, pages - 1);
  const start = state.previewPage * pageSize;
  return rows.slice(start, start + pageSize);
}

function renderPager(total) {
  if (total <= 250) return '';
  const pages = Math.ceil(total / 250);
  const from = state.previewPage * 250 + 1;
  const to = Math.min(total, (state.previewPage + 1) * 250);
  return `<div class="pager"><span>${from.toLocaleString()}–${to.toLocaleString()} / ${total.toLocaleString()}</span><div><button class="icon-button" id="page-prev" ${state.previewPage === 0 ? 'disabled' : ''} aria-label="${t('Pagina precedente','Previous page')}">←</button><span>${state.previewPage + 1} / ${pages}</span><button class="icon-button" id="page-next" ${state.previewPage >= pages - 1 ? 'disabled' : ''} aria-label="${t('Pagina successiva','Next page')}">→</button></div></div>`;
}

function renderRow(row) {
  const status = row.collision ? t('Conflitto','Conflict') : row.errors.length ? t('Non valido','Invalid') : row.changed ? t('Pronto','Ready') : t('Invariato','Unchanged');
  const klass = row.collision || row.errors.length ? 'error' : row.changed ? 'ready' : 'muted';
  return `<tr title="${escapeHtml(row.path)}"><td><span class="file-name">${escapeHtml(row.name)}</span><span class="file-path">${escapeHtml(row.parent || '')}</span></td><td><span class="new-name ${klass === 'error' ? 'bad' : ''}">${escapeHtml(row.newName)}</span></td><td><span class="status ${klass}">${status}</span></td></tr>`;
}

function renderRule(rule, index) {
  const title = ruleTitle(rule.type);
  return `<article class="rule-card" data-rule-id="${rule.id}" style="--reveal-delay:${Math.min(index, 4) * 36}ms">
    <div class="rule-titlebar">
      <span class="grip">${icons.grip}</span>
      <label class="switch"><input type="checkbox" data-field="enabled" ${rule.enabled !== false ? 'checked' : ''}><span></span></label>
      <strong>${index + 1}. ${title}</strong>
      <div class="rule-actions"><button class="icon-button rule-up" title="${t('Sposta su','Move up')}" ${index === 0 ? 'disabled' : ''}>↑</button><button class="icon-button rule-down" title="${t('Sposta giù','Move down')}" ${index === state.rules.length - 1 ? 'disabled' : ''}>↓</button><button class="icon-button rule-delete" title="${t('Elimina regola','Delete rule')}">${icons.trash}</button></div>
    </div>
    <div class="rule-body">${ruleFields(rule)}</div>
  </article>`;
}

function ruleTitle(type) {
  const labels = {
    replace: t('Trova e sostituisci','Find & replace'), prefix: t('Prefisso','Prefix'), suffix: t('Suffisso','Suffix'),
    sequence: t('Numerazione','Numbering'), case: t('Maiuscole / minuscole','Letter case'), remove: t('Rimuovi caratteri','Remove characters'),
    trim: t('Spazi','Whitespace'), date: t('Data','Date'), extension: t('Estensione','Extension'), template: t('Pattern personalizzato','Custom pattern')
  };
  return labels[type] || type;
}

function input(field, value, placeholder = '', type = 'text', attrs = '') {
  return `<input type="${type}" data-field="${field}" value="${escapeAttr(value ?? '')}" placeholder="${escapeAttr(placeholder)}" ${attrs}>`;
}
function select(field, value, options) {
  return `<select data-field="${field}">${options.map(([v,l]) => `<option value="${v}" ${String(value) === String(v) ? 'selected' : ''}>${l}</option>`).join('')}</select>`;
}

function ruleFields(rule) {
  switch (rule.type) {
    case 'replace': return `<div class="field-grid two"><label>${t('Trova','Find')}${input('find', rule.find, 'IMG_')}</label><label>${t('Sostituisci con','Replace with')}${input('replace', rule.replace, '')}</label></div><div class="checks"><label><input type="checkbox" data-field="regex" ${rule.regex ? 'checked' : ''}> Regex</label><label><input type="checkbox" data-field="caseSensitive" ${rule.caseSensitive ? 'checked' : ''}> ${t('Maiuscole/minuscole esatte','Case sensitive')}</label></div>`;
    case 'prefix': return `<label>${t('Testo da aggiungere','Text to add')}${input('value', rule.value, 'roma-')}</label>`;
    case 'suffix': return `<label>${t('Testo da aggiungere','Text to add')}${input('value', rule.value, '-finale')}</label>`;
    case 'sequence': return `<div class="field-grid three"><label>${t('Inizio','Start')}${input('start', rule.start, '', 'number')}</label><label>${t('Cifre','Digits')}${input('digits', rule.digits, '', 'number', 'min="1" max="12"')}</label><label>${t('Passo','Step')}${input('step', rule.step, '', 'number')}</label></div><div class="field-grid two"><label>${t('Posizione','Position')}${select('position', rule.position, [['prefix',t('Prima','Before')],['suffix',t('Dopo','After')],['replace',t('Sostituisci nome','Replace name')]])}</label><label>${t('Separatore','Separator')}${input('separator', rule.separator, '-')}</label></div>${rule.position === 'replace' ? `<label>${t('Nome base','Base name')}${input('base',rule.base,'file')}</label>` : ''}`;
    case 'case': return `<label>${t('Trasformazione','Transformation')}${select('mode', rule.mode, [['lower',t('minuscolo','lowercase')],['upper',t('MAIUSCOLO','UPPERCASE')],['title',t('Titolo','Title Case')]])}</label>`;
    case 'remove': return `<div class="field-grid two"><label>${t('Da carattere','From character')}${input('from', rule.from ?? 0, '', 'number', 'min="0"')}</label><label>${t('Quanti','Count')}${input('count', rule.count ?? 1, '', 'number', 'min="0"')}</label></div>`;
    case 'trim': return `<div class="checks"><label><input type="checkbox" data-field="collapseSpaces" ${rule.collapseSpaces ? 'checked' : ''}> ${t('Riduci spazi multipli','Collapse repeated spaces')}</label></div><label>${t('Sostituisci spazi multipli con','Replace repeated spaces with')}${input('replacement',rule.replacement ?? ' ',' ')}</label>`;
    case 'date': return `<div class="field-grid two"><label>${t('Origine data','Date source')}${select('source',rule.source || 'modified',[['modified',t('Ultima modifica','Modified')],['created',t('Creazione file','Created')],['exif','EXIF DateTimeOriginal']])}</label><label>${t('Formato','Format')}${input('format',rule.format || 'YYYY-MM-DD','YYYY-MM-DD')}</label></div><div class="field-grid two"><label>${t('Posizione','Position')}${select('position',rule.position || 'prefix',[['prefix',t('Prima','Before')],['suffix',t('Dopo','After')]])}</label><label>${t('Separatore','Separator')}${input('separator',rule.separator ?? '-','-')}</label></div>`;
    case 'extension': return `<label>${t('Nuova estensione','New extension')}${input('value',rule.value,'jpg')}</label><p class="hint">${t('Cambia solo il nome dell’estensione: non converte il contenuto del file.','This only changes the extension text; it does not convert file contents.')}</p>`;
    case 'template': return `<label>${t('Pattern','Pattern')}${input('pattern',rule.pattern || '{date}-{name}-{counter}.{ext}','{date}-{name}-{counter}.{ext}')}</label><div class="field-grid three"><label>${t('Inizio','Start')}${input('start',rule.start ?? 1,'','number')}</label><label>${t('Cifre','Digits')}${input('digits',rule.digits ?? 3,'','number')}</label><label>${t('Data','Date')}${input('dateFormat',rule.dateFormat || 'YYYY-MM-DD','YYYY-MM-DD')}</label></div><p class="hint">{name} · {ext} · {counter} · {date} · {created} · {modified} · {exif}</p>`;
    default: return '';
  }
}

function renderHistory() {
  return `<header class="topbar"><div><div class="eyebrow">${t('Registro locale','Local log')}</div><h1>${t('Attività','Activity')}</h1></div><button class="button secondary" id="refresh-history">${t('Aggiorna','Refresh')}</button></header>
  <section class="history-page panel">
    ${state.history.length ? state.history.map((h) => { const count = h.operations.length; return `<div class="history-item"><div><strong>${escapeHtml(historyTitle(state.settings.language, count))}</strong><span>${escapeHtml(historyMeta(state.settings.language, h.timestamp, count))}</span></div>${h.undone ? `<span class="status muted">${t('Annullata','Undone')}</span>` : `<button class="button secondary compact" data-undo-id="${escapeAttr(h.id)}">${icons.undo}${t('Annulla','Undo')}</button>`}</div>`; }).join('') : `<div class="empty-mini"><h2>${t('Nessuna attività','No activity yet')}</h2><p>${t('Le operazioni completate appariranno qui e resteranno sul tuo computer.','Completed operations will appear here and stay on your computer.')}</p></div>`}
  </section>`;
}

function renderSettings() {
  return `<header class="topbar"><div><div class="eyebrow">_davRENAME</div><h1>${t('Impostazioni','Settings')}</h1></div></header>
  <section class="settings-grid">
    <div class="panel settings-card"><h2>${t('Generali','General')}</h2>
      <label class="setting-row"><span><strong>${t('Verifica prima di rinominare','Confirm before renaming')}</strong><small>${t('Mostra una conferma nativa prima della modifica.','Show a native confirmation before changing files.')}</small></span><input type="checkbox" id="setting-confirm" ${state.settings.verifyBeforeRename ? 'checked' : ''}></label>
      <label class="setting-row"><span><strong>${t('Cartelle ricorsive','Recursive folders')}</strong><small>${t('Include automaticamente i file nelle sottocartelle.','Automatically include files in subfolders.')}</small></span><input type="checkbox" id="setting-recursive" ${state.settings.recursiveFolders ? 'checked' : ''}></label>
    </div>
    <div class="panel settings-card"><h2>${t('Aspetto','Appearance')}</h2>
      <div class="setting-control"><span class="setting-control-label">${t('Tema','Theme')}</span>${settingSelect('setting-theme',state.settings.theme,[['system',t('Sistema','System')],['light',t('Chiaro','Light')],['dark',t('Scuro','Dark')]])}</div>
      <div class="setting-control"><span class="setting-control-label">${t('Lingua','Language')}</span>${settingSelect('setting-language',state.settings.language,[['it','Italiano'],['en','English']])}</div>
    </div>
    <div class="panel about-card"><div class="brand big"><span>_dav</span>RENAME</div><p>${t('Rinomina batch locale, sicura e reversibile. Nessun account, nessun upload, nessuna telemetria di default.','Local, safe and reversible batch renaming. No account, no uploads, no telemetry by default.')}</p><div class="about-links"><button class="website-button" data-action="website">${icons.globe}<span>davstudios.it</span></button><button class="coffee-button wide" data-action="coffee">${icons.coffee}<span>${t('Offrimi Un Caffè','Buy Me A Coffee')}</span></button></div><div class="about-meta">MIT · Open source</div></div>
  </section>`;
}

function settingSelect(id, value, options) {
  const selected = options.find(([optionValue]) => optionValue === value) || options[0];
  const menuId = `${id}-menu`;
  return `<div class="dav-select" data-select-id="${id}">
    <button type="button" class="dav-select-trigger" id="${id}" aria-haspopup="listbox" aria-controls="${menuId}" aria-expanded="false">
      <span class="dav-select-value">${escapeHtml(selected[1])}</span>
      <span class="dav-select-chevron">${icons.chevron}</span>
    </button>
    <div class="dav-select-menu" id="${menuId}" role="listbox" aria-labelledby="${id}" aria-hidden="true">
      ${options.map(([optionValue, label]) => `<button type="button" class="dav-select-option ${optionValue === value ? 'is-selected' : ''}" role="option" aria-selected="${optionValue === value}" data-value="${escapeAttr(optionValue)}"><span>${escapeHtml(label)}</span><span class="dav-select-check">${icons.check}</span></button>`).join('')}
    </div>
  </div>`;
}

function closeSettingSelect(select, restoreFocus = false) {
  if (!select) return;
  select.classList.remove('is-open');
  const trigger = select.querySelector('.dav-select-trigger');
  const menu = select.querySelector('.dav-select-menu');
  trigger?.setAttribute('aria-expanded', 'false');
  menu?.setAttribute('aria-hidden', 'true');
  if (restoreFocus) trigger?.focus();
}

function closeAllSettingSelects(except = null) {
  document.querySelectorAll('.dav-select.is-open').forEach((select) => {
    if (select !== except) closeSettingSelect(select);
  });
}

function openSettingSelect(select, edge = 'selected') {
  closeAllSettingSelects(select);
  select.classList.add('is-open');
  const trigger = select.querySelector('.dav-select-trigger');
  const menu = select.querySelector('.dav-select-menu');
  trigger?.setAttribute('aria-expanded', 'true');
  menu?.setAttribute('aria-hidden', 'false');
  requestAnimationFrame(() => {
    const options = [...select.querySelectorAll('.dav-select-option')];
    const target = edge === 'last' ? options.at(-1) : select.querySelector('.dav-select-option.is-selected') || options[0];
    target?.focus();
  });
}

function bindSettingSelects() {
  document.querySelectorAll('.dav-select').forEach((select) => {
    const trigger = select.querySelector('.dav-select-trigger');
    const options = [...select.querySelectorAll('.dav-select-option')];
    trigger?.addEventListener('click', () => {
      if (select.classList.contains('is-open')) closeSettingSelect(select);
      else openSettingSelect(select);
    });
    trigger?.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        openSettingSelect(select, event.key === 'ArrowUp' ? 'last' : 'selected');
      }
    });
    options.forEach((option, index) => {
      option.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
          event.preventDefault();
          closeSettingSelect(select, true);
          return;
        }
        if (event.key === 'ArrowDown' || event.key === 'ArrowUp' || event.key === 'Home' || event.key === 'End') {
          event.preventDefault();
          let next = index;
          if (event.key === 'ArrowDown') next = (index + 1) % options.length;
          if (event.key === 'ArrowUp') next = (index - 1 + options.length) % options.length;
          if (event.key === 'Home') next = 0;
          if (event.key === 'End') next = options.length - 1;
          options[next]?.focus();
        }
      });
      option.addEventListener('click', () => {
        const id = select.dataset.selectId;
        const value = option.dataset.value;
        closeSettingSelect(select);
        const delay = matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 180;
        setTimeout(() => {
          if (id === 'setting-theme') setVisualSetting('theme', value, 'theme', select.querySelector('.dav-select-trigger'));
          if (id === 'setting-language') setVisualSetting('language', value, 'language');
        }, delay);
      });
    });
  });
}

function bindEvents(preview) {
  document.querySelectorAll('[data-page]').forEach((el) => el.addEventListener('click', () => navigatePage(el.dataset.page)));
  document.querySelector('#theme-toggle')?.addEventListener('click', (event) => {
    const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    setVisualSetting('theme', next, 'theme', event.currentTarget);
  });
  document.querySelectorAll('[data-action="coffee"], #coffee-button').forEach((node) => node.addEventListener('click', async () => {
    const url = 'https://buymeacoffee.com/davstudios';
    if ('__TAURI_INTERNALS__' in window) await openUrl(url);
    else window.open(url, '_blank', 'noopener,noreferrer');
  }));
  document.querySelectorAll('[data-action="website"]').forEach((node) => node.addEventListener('click', async () => {
    const url = state.settings.language === 'en' ? 'https://www.davstudios.it/en' : 'https://www.davstudios.it';
    if ('__TAURI_INTERNALS__' in window) await openUrl(url);
    else window.open(url, '_blank', 'noopener,noreferrer');
  }));
  for (const id of ['open-files','empty-open-files']) document.querySelector(`#${id}`)?.addEventListener('click', pickFiles);
  for (const id of ['open-folder','empty-open-folder']) document.querySelector(`#${id}`)?.addEventListener('click', pickFolder);
  document.querySelector('#clear-files')?.addEventListener('click', () => { state.files=[]; state.filters={ extension:'all', folder:'all' }; state.previewPage=0; render({ motion: 'content' }); });
  document.querySelector('#add-rule')?.addEventListener('click', showRuleMenu);
  document.querySelector('#reset-rules')?.addEventListener('click', () => { state.rules = structuredClone(defaultRules).map(r => ({...r,id:crypto.randomUUID()})); state.presetSelection=''; saveState(); render({ motion: 'rules' }); });
  document.querySelector('#preset-select')?.addEventListener('change', (event) => { state.presetSelection=event.target.value; render({ motion: 'content' }); });
  document.querySelector('#apply-preset')?.addEventListener('click', applySelectedPreset);
  document.querySelector('#save-preset')?.addEventListener('click', saveCurrentPreset);
  document.querySelector('#delete-preset')?.addEventListener('click', deleteSelectedPreset);
  document.querySelector('#file-extension-filter')?.addEventListener('change', (event) => { state.filters.extension=event.target.value; state.previewPage=0; render({ motion: 'content' }); });
  document.querySelector('#file-folder-filter')?.addEventListener('change', (event) => { state.filters.folder=event.target.value; state.previewPage=0; render({ motion: 'content' }); });
  document.querySelector('#clear-filters')?.addEventListener('click', () => { state.filters={ extension:'all', folder:'all' }; state.previewPage=0; render({ motion: 'content' }); });
  document.querySelector('#export-dry-run')?.addEventListener('click', () => exportDryRun(preview));
  document.querySelector('#rename-button')?.addEventListener('click', () => executeRename(preview));
  document.querySelector('#refresh-history')?.addEventListener('click', loadHistory);
  document.querySelectorAll('[data-undo-id]').forEach((button) => button.addEventListener('click', () => undoHistoryEntry(button.dataset.undoId)));
  document.querySelector('#page-prev')?.addEventListener('click', () => { state.previewPage = Math.max(0, state.previewPage - 1); render(); });
  document.querySelector('#page-next')?.addEventListener('click', () => { const pages = Math.max(1, Math.ceil(preview.rows.length / 250)); state.previewPage = Math.min(pages - 1, state.previewPage + 1); render(); });

  document.querySelectorAll('.rule-card').forEach((card) => {
    const id = card.dataset.ruleId;
    card.querySelector('.rule-delete')?.addEventListener('click', () => { state.rules = state.rules.filter(r => r.id !== id); saveState(); render({ motion: 'rules' }); });
    card.querySelector('.rule-up')?.addEventListener('click', () => moveRule(id, -1));
    card.querySelector('.rule-down')?.addEventListener('click', () => moveRule(id, 1));
    card.querySelectorAll('[data-field]').forEach((control) => control.addEventListener('change', () => updateRule(id, control)));
  });

  document.querySelector('#setting-confirm')?.addEventListener('change', e => { state.settings.verifyBeforeRename=e.target.checked; saveState(); });
  document.querySelector('#setting-recursive')?.addEventListener('change', e => { state.settings.recursiveFolders=e.target.checked; saveState(); });
  bindSettingSelects();
}

function applySelectedPreset() {
  const key = state.presetSelection;
  if (!key) return;
  const [kind, id] = key.split(':');
  const source = kind === 'builtin' ? builtInPresets.find((item) => item.id === id)?.rules : state.customPresets.find((item) => item.id === id)?.rules;
  if (!source) return;
  state.rules = instantiatePreset(source, () => crypto.randomUUID());
  state.previewPage = 0;
  saveState();
  render({ motion: 'rules' });
  toast(t('Preset applicato.','Preset applied.'), 'success');
}

function saveCurrentPreset() {
  const input = document.querySelector('#preset-name');
  const name = String(input?.value || '').trim();
  if (!name) {
    toast(t('Inserisci un nome per il preset.','Enter a name for the preset.'), 'warning');
    input?.focus();
    return;
  }
  if (state.customPresets.some((item) => item.name.toLocaleLowerCase() === name.toLocaleLowerCase())) {
    toast(t('Esiste già un preset con questo nome.','A preset with this name already exists.'), 'warning');
    return;
  }
  const item = { id: crypto.randomUUID(), name, rules: presetRules(state.rules) };
  state.customPresets.push(item);
  state.presetSelection = `custom:${item.id}`;
  saveState();
  render({ motion: 'content' });
  toast(t('Preset salvato.','Preset saved.'), 'success');
}

async function deleteSelectedPreset() {
  if (!state.presetSelection.startsWith('custom:')) return;
  const id = state.presetSelection.slice(7);
  const item = state.customPresets.find((preset) => preset.id === id);
  if (!item) return;
  const ok = await confirm(t(`Eliminare il preset “${item.name}”?`,`Delete the preset “${item.name}”?`), { title: '_davRENAME', kind: 'warning', okLabel: t('Elimina','Delete'), cancelLabel: t('Annulla','Cancel') });
  if (!ok) return;
  state.customPresets = state.customPresets.filter((preset) => preset.id !== id);
  state.presetSelection = '';
  saveState();
  render({ motion: 'content' });
}

async function exportDryRun(preview) {
  if (!preview.rows.length) return;
  const target = await save({ title: '_davRENAME — ' + t('Esporta dry run','Export dry run'), defaultPath: '_davRENAME-dry-run.csv', filters: [{ name: 'CSV', extensions: ['csv'] }] });
  if (!target) return;
  try {
    await invoke('write_text_file', { path: target, content: dryRunCsv(preview.rows) });
    toast(t('Dry run esportato.','Dry run exported.'), 'success');
  } catch (error) {
    await message(String(error), { title: '_davRENAME', kind: 'error' });
  }
}

function moveRule(id, delta) {
  const from = state.rules.findIndex(r => r.id === id);
  const to = from + delta;
  if (from < 0 || to < 0 || to >= state.rules.length) return;
  const [moved] = state.rules.splice(from, 1);
  state.rules.splice(to, 0, moved);
  state.previewPage = 0;
  saveState();
  render({ motion: 'rules' });
}

function updateRule(id, control) {
  const rule = state.rules.find(r => r.id === id); if (!rule) return;
  let value = control.type === 'checkbox' ? control.checked : control.value;
  if (control.type === 'number') value = Number(value);
  rule[control.dataset.field] = value;
  state.previewPage = 0;
  saveState(); render({ motion: 'rules' });
}

function showRuleMenu(event) {
  document.querySelector('.rule-picker')?.remove();
  const picker = document.createElement('div');
  picker.className = 'rule-picker';
  const types = ['replace','prefix','suffix','sequence','case','remove','trim','date','extension','template'];
  picker.innerHTML = types.map(type => `<button data-type="${type}">${ruleTitle(type)}</button>`).join('');
  document.body.appendChild(picker);
  const rect = event.currentTarget.getBoundingClientRect();
  picker.style.top = `${Math.min(innerHeight - picker.offsetHeight - 16, rect.bottom + 8)}px`;
  picker.style.left = `${Math.max(16, rect.right - picker.offsetWidth)}px`;
  picker.querySelectorAll('button').forEach(btn => btn.addEventListener('click', () => { addRule(btn.dataset.type); picker.remove(); }));
  setTimeout(() => document.addEventListener('click', function close(e){ if(!picker.contains(e.target) && e.target !== event.currentTarget){ picker.remove(); document.removeEventListener('click', close); } }), 0);
}

function addRule(type) {
  const base = { id: crypto.randomUUID(), type, enabled: true };
  const defaults = {
    replace:{find:'',replace:'',regex:false,caseSensitive:false}, prefix:{value:''}, suffix:{value:''},
    sequence:{start:1,step:1,digits:3,position:'suffix',separator:'-'}, case:{mode:'lower'}, remove:{from:0,count:1},
    trim:{collapseSpaces:true,replacement:' '}, date:{source:'modified',format:'YYYY-MM-DD',position:'prefix',separator:'-'},
    extension:{value:''}, template:{pattern:'{date}-{name}-{counter}.{ext}',start:1,digits:3,dateFormat:'YYYY-MM-DD'}
  };
  state.rules.push({...base,...defaults[type]}); saveState(); render({ motion: 'rules' });
}

async function pickFiles() {
  const selected = await open({ multiple: true, directory: false, title: '_davRENAME — ' + t('Seleziona file','Choose files') });
  if (!selected) return;
  await addPaths(Array.isArray(selected) ? selected : [selected]);
}
async function pickFolder() {
  const selected = await open({ multiple: false, directory: true, title: '_davRENAME — ' + t('Seleziona cartella','Choose folder') });
  if (!selected) return;
  await addPaths([selected]);
}
async function addPaths(paths) {
  try {
    const files = await invoke('scan_paths', { paths, recursive: state.settings.recursiveFolders });
    const merged = new Map(state.files.map(f => [normalizeForKey(f.path), f]));
    files.forEach(f => merged.set(normalizeForKey(f.path), f));
    state.files = [...merged.values()]; state.previewPage = 0; render({ motion: 'content' });
    if (!files.length) toast(t('Nessun file trovato.','No files found.'), 'warning');
  } catch (error) { await message(String(error), { title: '_davRENAME', kind: 'error' }); }
}

async function executeRename(preview) {
  const operations = operationsFromPreview(preview);
  if (!operations.length) return;
  if (state.settings.verifyBeforeRename) {
    const ok = await confirm(t(`Stai per rinominare ${operations.length} file. Gli originali non verranno eliminati: cambierà soltanto il loro nome.`,`You are about to rename ${operations.length} files. Files will not be deleted; only their names will change.`), { title: '_davRENAME', kind: 'warning', okLabel: t('Rinomina','Rename'), cancelLabel: t('Annulla','Cancel') });
    if (!ok) return;
  }
  state.busy = true; render();
  try {
    const result = await invoke('execute_rename', { operations });
    state.lastResult = result;
    try {
      const renamedSources = new Set(result.operations.map((op) => normalizeForKey(op.oldPath)));
      const unaffected = state.files.filter((file) => !renamedSources.has(normalizeForKey(file.path)));
      const renamed = await invoke('scan_paths', { paths: result.operations.map(op => op.newPath), recursive: false });
      state.files = [...unaffected, ...renamed].sort((a, b) => String(a.name).localeCompare(String(b.name), undefined, { numeric: true, sensitivity: 'base' }));
    } catch {
      state.files = [];
    }
    await loadHistory(false);
    toast(t(`${result.operations.length} file rinominati con successo.`,`Successfully renamed ${result.operations.length} files.`), 'success');
    if (result.warning) toast(result.warning, 'warning');
  } catch (error) {
    await message(String(error), { title: '_davRENAME', kind: 'error' });
  } finally { state.busy=false; render({ motion: 'content' }); }
}

async function loadHistory(shouldRender = true) {
  try { state.history = await invoke('get_history'); } catch { state.history = []; }
  if (shouldRender) { state.page = 'history'; render({ motion: 'page' }); }
}

async function undoHistoryEntry(id) {
  if (!id) return;
  const ok = await confirm(t('Ripristinare i nomi precedenti di questa operazione? Se file successivi dipendono da questi nomi, l’operazione verrà bloccata in sicurezza.','Restore the previous names from this operation? If later files depend on these names, the operation will be safely blocked.'), { title: '_davRENAME', kind: 'warning', okLabel: t('Annulla operazione','Undo operation'), cancelLabel: t('Chiudi','Close') });
  if (!ok) return;
  try {
    const result = await invoke('undo_history_entry', { id });
    try {
      const restoredSources = new Set(result.operations.map((op) => normalizeForKey(op.oldPath)));
      const unaffected = state.files.filter((file) => !restoredSources.has(normalizeForKey(file.path)));
      const restored = await invoke('scan_paths', { paths: result.operations.map((op) => op.newPath), recursive: false });
      state.files = [...unaffected, ...restored].sort((a, b) => String(a.name).localeCompare(String(b.name), undefined, { numeric: true, sensitivity: 'base' }));
    } catch {}
    await loadHistory(false);
    toast(t(`${result.operations.length} file ripristinati.`,`Restored ${result.operations.length} files.`), 'success');
    render({ motion: 'page' });
  } catch(error) { await message(String(error), { title: '_davRENAME', kind: 'error' }); }
}

async function initDragDrop() {
  await getCurrentWebview().onDragDropEvent(async (event) => {
    if (event.payload.type === 'over') { state.dragOver=true; document.querySelector('#drop-zone')?.classList.add('drag-over'); }
    else if (event.payload.type === 'leave') { state.dragOver=false; document.querySelector('#drop-zone')?.classList.remove('drag-over'); }
    else if (event.payload.type === 'drop') { state.dragOver=false; await addPaths(event.payload.paths); }
  });
}

function toast(text, kind='info') {
  let region = document.querySelector('#toast-region'); if(!region){ region=document.createElement('div'); region.id='toast-region'; document.body.appendChild(region); }
  const el=document.createElement('div'); el.className=`toast ${kind}`; el.textContent=text; region.appendChild(el); setTimeout(()=>{ el.classList.add('is-leaving'); setTimeout(()=>el.remove(),420); },4080);
}
function normalizeForKey(path){ return state.platform==='win32' ? String(path).toLocaleLowerCase() : String(path); }
function escapeHtml(value){ return String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function escapeAttr(value){ return escapeHtml(value).replace(/`/g,'&#96;'); }

document.addEventListener('pointerdown', (event) => {
  if (!event.target.closest('.dav-select')) closeAllSettingSelects();
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    const openSelect = document.querySelector('.dav-select.is-open');
    if (openSelect) {
      event.preventDefault();
      closeSettingSelect(openSelect, true);
    }
  }
});
matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
  if (state.settings.theme === 'system') runUiTransition('theme', () => render());
});
async function initializeApp() {
  applyTheme();
  render({ motion: 'startup' });
  await initDragDrop();
}

initializeApp();

