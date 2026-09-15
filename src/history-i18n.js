export function historyTitle(language, count) {
  if (language === 'en') return count === 1 ? 'Renamed 1 file' : `Renamed ${count} files`;
  return `Rinomina di ${count} file`;
}

export function historyMeta(language, timestamp, count) {
  const locale = language === 'en' ? 'en-US' : 'it-IT';
  const date = new Date(timestamp);
  const formattedDate = Number.isNaN(date.getTime()) ? timestamp : date.toLocaleString(locale);
  const fileLabel = language === 'en' ? (count === 1 ? 'file' : 'files') : 'file';
  return `${formattedDate} · ${count} ${fileLabel}`;
}
