import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('workflow GitHub pubblica release stabile con description bilingue', () => {
  const text = fs.readFileSync('.github/workflows/release.yml', 'utf8');
  assert.match(text, /Verify release versions/);
  assert.match(text, /package-lock\.json/);
  assert.match(text, /Cargo\.lock/);
  assert.match(text, /Read release description from tagged commit/);
  assert.match(text, /git log -1 --pretty=%b/);
  assert.match(text, /releaseBody:\s*\$\{\{ steps\.release_description\.outputs\.body \}\}/);
  assert.match(text, /prerelease:\s*false/);
  assert.doesNotMatch(text, /Stable release of _davRENAME|generateReleaseNotes:\s*true/);
});

test('metadata pacchetto _davstudios presenti', () => {
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const tauri = JSON.parse(fs.readFileSync('src-tauri/tauri.conf.json', 'utf8'));
  const cargo = fs.readFileSync('src-tauri/Cargo.toml', 'utf8');
  assert.equal(pkg.author, '_davstudios');
  assert.equal(pkg.license, 'MIT');
  assert.equal(pkg.homepage, 'https://davstudios.it');
  assert.equal(tauri.identifier, 'studio.dav.rename');
  assert.equal(tauri.bundle.publisher, '_davstudios');
  assert.equal(tauri.bundle.homepage, 'https://davstudios.it');
  assert.equal(tauri.bundle.license, 'MIT');
  assert.equal(tauri.bundle.licenseFile, '../LICENSE');
  assert.equal(tauri.bundle.linux.deb.section, 'utils');
  assert.equal(tauri.bundle.linux.deb.priority, 'optional');
  assert.match(cargo, /license = "MIT"/);
  assert.match(cargo, /homepage = "https:\/\/davstudios\.it"/);
});

test('identifier storico resta invariato', () => {
  const tauri = JSON.parse(fs.readFileSync('src-tauri/tauri.conf.json', 'utf8'));
  assert.equal(tauri.identifier, 'studio.dav.rename');
});

test('set icone Tauri completo', () => {
  for (const file of ['32x32.png', '128x128.png', '128x128@2x.png', 'app-icon.png', 'icon.ico', 'icon.icns']) {
    assert.equal(fs.existsSync(`src-tauri/icons/${file}`), true, `${file} mancante`);
  }
});



test('motion system matches the _davstudios website v52 language', () => {
  const motion = fs.readFileSync('src/motion.css', 'utf8');
  assert.match(motion, /--motion-duration-base:720ms/);
  assert.match(motion, /--motion-duration-slow:940ms/);
  assert.match(motion, /--motion-step:72ms/);
  assert.match(motion, /--motion-page-out:170ms/);
  assert.match(motion, /--motion-page-in:430ms/);
  assert.match(motion, /cubic-bezier\(\.16,1,\.3,1\)/);
  assert.match(motion, /blur\(3px\)/);
  assert.match(motion, /dav-theme-reveal 680ms/);
  assert.match(motion, /prefers-reduced-motion:reduce/);
});

test('Windows release uses the GUI subsystem without console window', () => {
  const main = fs.readFileSync('src-tauri/src/main.rs', 'utf8');
  assert.match(main, /cfg_attr\(not\(debug_assertions\), windows_subsystem = "windows"\)/);
  const rust = fs.readdirSync('src-tauri/src').filter((name) => name.endsWith('.rs')).map((name) => fs.readFileSync(`src-tauri/src/${name}`, 'utf8')).join('\n');
  assert.doesNotMatch(rust, /(?:std::process::)?Command::new/);
});
