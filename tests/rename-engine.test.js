import test from 'node:test';
import assert from 'node:assert/strict';
import { applyRules, buildPreview, destinationPath, splitName } from '../src/rename-engine.js';

const file = (name, path=`C:\\Photos\\${name}`) => ({ name, path, parent:'C:\\Photos', modified: Date.UTC(2026,8,12,12,30), created: Date.UTC(2026,8,10,9,0), exifDate: Date.UTC(2026,7,1,8,0) });

test('splitName keeps dotfiles intact', () => {
  assert.deepEqual(splitName('.gitignore'), { stem: '.gitignore', extension: '' });
  assert.deepEqual(splitName('photo.final.jpg'), { stem: 'photo.final', extension: 'jpg' });
});

test('pipeline applies replace, case, prefix and sequence in order', () => {
  const rules = [
    {type:'replace',find:'IMG_',replace:'',regex:false,caseSensitive:false},
    {type:'case',mode:'lower'},
    {type:'prefix',value:'roma-'},
    {type:'sequence',start:1,step:1,digits:3,position:'suffix',separator:'-'}
  ];
  assert.equal(applyRules(file('IMG_Sunset.JPG'), rules, 0), 'roma-sunset-001.JPG');
});

test('custom template supports dates, counters and extension', () => {
  const rules = [{type:'template',pattern:'{exif}-{name}-{counter}.{ext}',start:7,digits:3,dateFormat:'YYYY-MM-DD'}];
  assert.equal(applyRules(file('Trip.JPG'), rules, 0), '2026-08-01-Trip-007.JPG');
});

test('preview detects Windows case-insensitive collisions', () => {
  const files = [file('A.txt','C:\\Photos\\A.txt'), file('B.txt','C:\\Photos\\B.txt')];
  const rules = [{type:'template',pattern:'same.txt'}];
  const preview = buildPreview(files, rules, 'win32');
  assert.equal(preview.invalidCount, 2);
  assert.equal(preview.rows.every(r => r.collision), true);
});

test('destination path stays in original directory', () => {
  assert.equal(destinationPath(file('A.txt'), 'B.txt'), 'C:\\Photos\\B.txt');
});

test('invalid regex is reported without breaking preview', () => {
  const preview = buildPreview([file('A.txt')], [{type:'replace',find:'[',replace:'x',regex:true}], 'win32');
  assert.equal(preview.ruleErrors.length, 1);
  assert.equal(preview.rows[0].newName, 'A.txt');
});

test('Windows reserved names are rejected', () => {
  const preview = buildPreview([file('A.txt')], [{type:'template',pattern:'CON.txt'}], 'win32');
  assert.equal(preview.invalidCount, 1);
  assert.match(preview.rows[0].errors.join(' '), /riservato/i);
});

test('date rule can use EXIF date', () => {
  const rules = [{type:'date',source:'exif',format:'YYYYMMDD',position:'prefix',separator:'_'}];
  assert.equal(applyRules(file('Trip.JPG'), rules, 0), '20260801_Trip.JPG');
});


test('macOS preview conservatively catches case-only collisions', () => {
  const files = [
    { name:'A.txt', path:'/Users/test/A.txt', parent:'/Users/test', modified:0, created:0, exifDate:0 },
    { name:'B.txt', path:'/Users/test/B.txt', parent:'/Users/test', modified:0, created:0, exifDate:0 }
  ];
  const rules = [{type:'template',pattern:'File.txt'}, {type:'case',mode:'lower'}];
  const preview = buildPreview(files, rules, 'darwin');
  assert.equal(preview.invalidCount, 2);
});

test('Linux keeps filename case distinct', () => {
  const files = [
    { name:'A.txt', path:'/home/test/A.txt', parent:'/home/test', modified:0, created:0, exifDate:0 },
    { name:'B.txt', path:'/home/test/B.txt', parent:'/home/test', modified:0, created:0, exifDate:0 }
  ];
  const preview = buildPreview(files, [{type:'template',pattern:'File{counter}.txt', start:1, digits:1}], 'linux');
  assert.equal(preview.invalidCount, 0);
});

test('backslash is allowed by Unix preview validation', () => {
  const unix = [{ name:'A.txt', path:'/home/test/A.txt', parent:'/home/test', modified:0, created:0, exifDate:0 }];
  const preview = buildPreview(unix, [{type:'template',pattern:'hello\\world.txt'}], 'linux');
  assert.equal(preview.invalidCount, 0);
});

