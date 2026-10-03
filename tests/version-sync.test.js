import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const packageVersion = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8')).version;
const packageLock = JSON.parse(readFileSync(resolve(root, 'package-lock.json'), 'utf8'));
const tauriVersion = JSON.parse(readFileSync(resolve(root, 'src-tauri/tauri.conf.json'), 'utf8')).version;
const cargoText = readFileSync(resolve(root, 'src-tauri/Cargo.toml'), 'utf8');
const cargoVersion = cargoText.match(/^version\s*=\s*"([^"]+)"/m)?.[1];
const cargoLockText = readFileSync(resolve(root, 'src-tauri/Cargo.lock'), 'utf8');
const mainSource = readFileSync(resolve(root, 'src/main.js'), 'utf8');

function cargoLockVersion(text) {
  return text.match(/\[\[package\]\]\r?\nname = "davrename"\r?\nversion = "([^"]+)"/)?.[1];
}

test('release versions stay aligned', () => {
  assert.equal(packageVersion, '26.10.2');
  assert.equal(packageLock.version, packageVersion);
  assert.equal(packageLock.packages?.['']?.version, packageVersion);
  assert.equal(tauriVersion, packageVersion);
  assert.equal(cargoVersion, packageVersion);
  assert.equal(cargoLockVersion(cargoLockText), packageVersion);
});

test('Cargo.lock version parser supports Windows CRLF checkouts', () => {
  const crlf = cargoLockText.replace(/\r?\n/g, '\r\n');
  assert.equal(cargoLockVersion(crlf), packageVersion);
});

test('UI reads the app version from Tauri instead of hardcoding it', () => {
  assert.match(mainSource, /getVersion/);
  assert.doesNotMatch(mainSource, /v\d+\.\d+\.\d+/);
});

