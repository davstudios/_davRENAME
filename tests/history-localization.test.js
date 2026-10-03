import test from 'node:test';
import assert from 'node:assert/strict';
import { historyTitle, historyMeta } from '../src/history-i18n.js';

test('history title follows current language', () => {
  assert.equal(historyTitle('it', 52), 'Rinomina di 52 file');
  assert.equal(historyTitle('en', 52), 'Renamed 52 files');
  assert.equal(historyTitle('en', 1), 'Renamed 1 file');
});

test('history metadata follows current language', () => {
  const timestamp = '2026-09-14T07:55:48.000Z';
  const italian = historyMeta('it', timestamp, 52);
  const english = historyMeta('en', timestamp, 52);
  assert.match(italian, /52 file$/);
  assert.match(english, /52 files$/);
  assert.notEqual(italian, english);
});

