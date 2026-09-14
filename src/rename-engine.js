const illegalWindowsChars = /[<>:"/\\|?*\u0000-\u001F]/g;
const windowsReserved = /^(con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i;

export function splitName(filename) {
  if (filename === '.' || filename === '..') return { stem: filename, extension: '' };
  const lastDot = filename.lastIndexOf('.');
  if (lastDot <= 0) return { stem: filename, extension: '' };
  return { stem: filename.slice(0, lastDot), extension: filename.slice(lastDot + 1) };
}

export function joinName(stem, extension) {
  const ext = String(extension ?? '').replace(/^\.+/, '');
  return ext ? `${stem}.${ext}` : stem;
}

export function titleCase(value) {
  return String(value)
    .toLocaleLowerCase()
    .replace(/(^|[\s_\-.()[\]{}]+)(\p{L})/gu, (match, sep, letter) => `${sep}${letter.toLocaleUpperCase()}`);
}

function formatDate(input, format = 'YYYY-MM-DD') {
  if (!input) return '';
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return '';
  const p = (n) => String(n).padStart(2, '0');
  const map = {
    YYYY: String(date.getFullYear()),
    YY: String(date.getFullYear()).slice(-2),
    MM: p(date.getMonth() + 1),
    DD: p(date.getDate()),
    HH: p(date.getHours()),
    mm: p(date.getMinutes()),
    ss: p(date.getSeconds())
  };
  return format.replace(/YYYY|YY|MM|DD|HH|mm|ss/g, (token) => map[token]);
}

function applyTemplate(pattern, context) {
  return String(pattern || '{name}')
    .replaceAll('{name}', context.stem)
    .replaceAll('{ext}', context.extension)
    .replaceAll('{counter}', context.counter)
    .replaceAll('{date}', context.date)
    .replaceAll('{created}', context.created)
    .replaceAll('{modified}', context.modified)
    .replaceAll('{exif}', context.exif);
}

export function applyRules(file, rules, index) {
  let { stem, extension } = splitName(file.name);
  const original = { stem, extension };

  for (const rule of rules) {
    if (rule.enabled === false) continue;
    switch (rule.type) {
      case 'replace': {
        const find = String(rule.find ?? '');
        if (!find) break;
        if (rule.regex) {
          try {
            const flags = rule.caseSensitive ? 'g' : 'gi';
            stem = stem.replace(new RegExp(find, flags), String(rule.replace ?? ''));
          } catch {}
        } else if (rule.caseSensitive) {
          stem = stem.split(find).join(String(rule.replace ?? ''));
        } else {
          stem = stem.replace(new RegExp(escapeRegExp(find), 'gi'), String(rule.replace ?? ''));
        }
        break;
      }
      case 'prefix':
        stem = `${rule.value ?? ''}${stem}`;
        break;
      case 'suffix':
        stem = `${stem}${rule.value ?? ''}`;
        break;
      case 'sequence': {
        const start = Number.isFinite(Number(rule.start)) ? Number(rule.start) : 1;
        const step = Number.isFinite(Number(rule.step)) ? Number(rule.step) : 1;
        const digits = Math.min(12, Math.max(1, Number(rule.digits) || 3));
        const value = String(start + index * step).padStart(digits, '0');
        const separator = rule.separator ?? '-';
        if (rule.position === 'prefix') stem = `${value}${separator}${stem}`;
        else if (rule.position === 'replace') stem = `${rule.base || 'file'}${separator}${value}`;
        else stem = `${stem}${separator}${value}`;
        break;
      }
      case 'case':
        if (rule.mode === 'upper') stem = stem.toLocaleUpperCase();
        else if (rule.mode === 'lower') stem = stem.toLocaleLowerCase();
        else if (rule.mode === 'title') stem = titleCase(stem);
        break;
      case 'remove': {
        const from = Math.max(0, Number(rule.from) || 0);
        const count = Math.max(0, Number(rule.count) || 0);
        if (count > 0) stem = stem.slice(0, from) + stem.slice(from + count);
        break;
      }
      case 'trim':
        stem = stem.trim();
        if (rule.collapseSpaces) stem = stem.replace(/\s+/g, rule.replacement ?? ' ');
        break;
      case 'date': {
        let input = file.modified;
        if (rule.source === 'created') input = file.created || file.modified;
        if (rule.source === 'exif') input = file.exifDate || file.created || file.modified;
        const value = formatDate(input, rule.format || 'YYYY-MM-DD');
        if (!value) break;
        const separator = rule.separator ?? '-';
        stem = rule.position === 'suffix' ? `${stem}${separator}${value}` : `${value}${separator}${stem}`;
        break;
      }
      case 'extension':
        extension = String(rule.value ?? '').replace(/^\.+/, '');
        break;
      case 'template': {
        const counter = String((Number(rule.start) || 1) + index).padStart(Math.max(1, Number(rule.digits) || 3), '0');
        const dateFormat = rule.dateFormat || 'YYYY-MM-DD';
        const context = {
          stem,
          extension,
          counter,
          date: formatDate(file.modified, dateFormat),
          created: formatDate(file.created || file.modified, dateFormat),
          modified: formatDate(file.modified, dateFormat),
          exif: formatDate(file.exifDate || file.created || file.modified, dateFormat)
        };
        const rendered = applyTemplate(rule.pattern || '{name}', context);
        const parsed = splitName(rendered);
        stem = parsed.stem;
        if (parsed.extension) extension = parsed.extension;
        break;
      }
      default:
        break;
    }
  }

  return joinName(stem, extension || original.extension);
}

export function validateRules(rules) {
  const errors = [];
  rules.forEach((rule, index) => {
    if (rule.enabled === false) return;
    if (rule.type === 'replace' && rule.regex && rule.find) {
      try { new RegExp(rule.find); } catch (error) { errors.push(`Regola ${index + 1}: regex non valida (${error.message}).`); }
    }
    if (rule.type === 'sequence' && Number(rule.digits) < 1) errors.push(`Regola ${index + 1}: le cifre devono essere almeno 1.`);
    if (rule.type === 'template' && !String(rule.pattern || '').trim()) errors.push(`Regola ${index + 1}: il pattern non può essere vuoto.`);
  });
  return errors;
}

export function validateFilename(filename, platform = 'win32') {
  const reasons = [];
  if (!filename || !filename.trim()) reasons.push('Nome vuoto');
  if (filename === '.' || filename === '..') reasons.push('Nome riservato');
  if (platform === 'win32') {
    if (illegalWindowsChars.test(filename)) reasons.push('Caratteri non consentiti su Windows');
    illegalWindowsChars.lastIndex = 0;
    if (windowsReserved.test(filename)) reasons.push('Nome riservato su Windows');
    if (/[ .]$/.test(filename)) reasons.push('Windows non consente punto o spazio finale');
  } else if (filename.includes('/')) {
    reasons.push('Il nome non può contenere /');
  }
  return reasons;
}

export function buildPreview(files, rules, platform = 'win32') {
  const ruleErrors = validateRules(rules);
  const rows = files.map((file, index) => {
    const newName = applyRules(file, rules, index);
    const errors = validateFilename(newName, platform);
    return {
      ...file,
      newName,
      changed: newName !== file.name,
      errors,
      collision: false
    };
  });

  const byDestination = new Map();
  for (const row of rows) {
    const dir = normalizePath(row.parent || parentPath(row.path), platform);
    const keyName = isCaseInsensitivePlatform(platform) ? row.newName.toLocaleLowerCase() : row.newName;
    const key = `${dir}\u0000${keyName}`;
    const list = byDestination.get(key) || [];
    list.push(row);
    byDestination.set(key, list);
  }
  for (const group of byDestination.values()) {
    if (group.length > 1) group.forEach((row) => { row.collision = true; });
  }

  return {
    rows,
    ruleErrors,
    invalidCount: rows.filter((row) => row.errors.length || row.collision).length,
    changedCount: rows.filter((row) => row.changed).length
  };
}

export function parentPath(path) {
  const clean = String(path || '').replace(/[\\/]+$/, '');
  const idx = Math.max(clean.lastIndexOf('/'), clean.lastIndexOf('\\'));
  return idx < 0 ? '' : clean.slice(0, idx);
}

export function destinationPath(file, newName) {
  const parent = file.parent || parentPath(file.path);
  const sep = String(file.path).includes('\\') ? '\\' : '/';
  return `${parent}${parent.endsWith('/') || parent.endsWith('\\') ? '' : sep}${newName}`;
}

export function operationsFromPreview(preview) {
  return preview.rows
    .filter((row) => row.changed && !row.collision && row.errors.length === 0)
    .map((row) => ({ oldPath: row.path, newPath: destinationPath(row, row.newName) }));
}

function normalizePath(value, platform) {
  let v = String(value || '').replace(/\\/g, '/').replace(/\/+$/, '');
  if (isCaseInsensitivePlatform(platform)) v = v.toLocaleLowerCase();
  return v;
}

function isCaseInsensitivePlatform(platform) {
  return platform === 'win32' || platform === 'darwin';
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
