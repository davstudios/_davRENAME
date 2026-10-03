import test from 'node:test';
import assert from 'node:assert/strict';
import { dryRunCsv, extensionChoices, fileExtension, filterFiles, instantiatePreset, presetRules } from '../src/workspace-utils.js';

const files = [
  { name: 'A.JPG', parent: 'C:\\Photos', path: 'C:\\Photos\\A.JPG' },
  { name: 'B.png', parent: 'C:\\Photos', path: 'C:\\Photos\\B.png' },
  { name: 'notes.txt', parent: 'C:\\Docs', path: 'C:\\Docs\\notes.txt' }
];

test('extracts normalized file extensions', () => {
  assert.equal(fileExtension('Photo.JPG'), 'jpg');
  assert.equal(fileExtension('.gitignore'), '');
});

test('filters by extension and folder', () => {
  assert.deepEqual(filterFiles(files, { extension: 'jpg', folder: 'all' }).map((file) => file.name), ['A.JPG']);
  assert.deepEqual(filterFiles(files, { extension: 'all', folder: 'C:\\Photos' }).map((file) => file.name), ['A.JPG', 'B.png']);
});

test('returns sorted extension choices', () => {
  assert.deepEqual(extensionChoices(files), ['jpg', 'png', 'txt']);
});

test('serializes and restores preset rules without ids', () => {
  const source = [{ id: 'old', type: 'prefix', enabled: true, value: 'x-' }];
  const stored = presetRules(source);
  assert.equal('id' in stored[0], false);
  const restored = instantiatePreset(stored, () => 'new');
  assert.equal(restored[0].id, 'new');
  assert.equal(restored[0].value, 'x-');
});

test('exports a quoted dry run CSV', () => {
  const csv = dryRunCsv([{ path: 'C:\\Photos\\A.JPG', name: 'A.JPG', newName: 'rome,01.jpg', changed: true, collision: false, errors: [] }]);
  assert.match(csv, /"rome,01.jpg"/);
  assert.match(csv, /"ready"/);
});

