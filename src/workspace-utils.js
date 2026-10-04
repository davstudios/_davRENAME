export function fileExtension(name) {
  const value = String(name || '');
  const index = value.lastIndexOf('.');
  if (index <= 0 || index === value.length - 1) return '';
  return value.slice(index + 1).toLowerCase();
}

export function filterFiles(files, filters = {}) {
  const extension = String(filters.extension || 'all').toLowerCase();
  const folder = String(filters.folder || 'all');
  return files.filter((file) => {
    if (extension !== 'all' && fileExtension(file.name) !== extension) return false;
    if (folder !== 'all' && String(file.parent || '') !== folder) return false;
    return true;
  });
}

export function extensionChoices(files) {
  return [...new Set(files.map((file) => fileExtension(file.name)).filter(Boolean))].sort((a, b) => a.localeCompare(b));
}

export function folderChoices(files) {
  return [...new Set(files.map((file) => String(file.parent || '')).filter(Boolean))].sort((a, b) => a.localeCompare(b));
}

export function presetRules(rules) {
  return rules.map(({ id, ...rule }) => structuredClone(rule));
}

export function instantiatePreset(rules, makeId) {
  return rules.map((rule) => ({ ...structuredClone(rule), id: makeId() }));
}

function csvCell(value) {
  const text = String(value ?? '');
  return `"${text.replaceAll('"', '""')}"`;
}

export function dryRunCsv(rows) {
  const header = ['original_path', 'original_name', 'new_name', 'changed', 'status'];
  const body = rows.map((row) => {
    const status = row.collision ? 'conflict' : row.errors?.length ? 'invalid' : row.changed ? 'ready' : 'unchanged';
    return [row.path, row.name, row.newName, row.changed ? 'true' : 'false', status].map(csvCell).join(',');
  });
  return [header.map(csvCell).join(','), ...body].join('\n');
}


