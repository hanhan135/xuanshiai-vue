const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')

const artifactRoot = path.resolve(__dirname, '..', 'unpackage', 'dist', 'dev', 'mp-weixin')
const expectedAssets = [
  path.join('pagesSub', 'matchmaker', 'static', 'cases', 'shenzhen-zhang-liu.webp'),
  path.join('pagesSub', 'matchmaker', 'static', 'cases', 'wuhan-zhou-zheng.webp'),
  path.join('static', 'portraits', 'custom-matchmaker-hero.webp')
]

for (const asset of expectedAssets) {
  assert.ok(fs.existsSync(path.join(artifactRoot, asset)), `missing generated matchmaker asset: ${asset}`)
}
assert.ok(!fs.existsSync(path.join(artifactRoot, 'pagesSub', 'matchmaker', 'assets')), 'matchmaker assets must not be copied into an untracked subpackage directory')

console.log('PASS mp-weixin subpackage assets')
