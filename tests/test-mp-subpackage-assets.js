const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')

const artifactRoot = path.resolve(__dirname, '..', 'unpackage', 'dist', 'dev', 'mp-weixin')
const expectedAssets = [
  path.join('pagesSub', 'matchmaker', 'static', 'cases', 'shenzhen-zhang-liu.webp'),
  path.join('pagesSub', 'matchmaker', 'static', 'cases', 'wuhan-zhou-zheng.webp'),
  path.join('static', 'portraits', 'custom-matchmaker-hero.webp')
]
const expectedProfileExtraAssets = [
  path.join('pagesSub', 'profileExtra', 'static', 'moxiang-master-idle.webp'),
  path.join('pagesSub', 'profileExtra', 'static', 'moxiang-master-listening.webp'),
  path.join('pagesSub', 'profileExtra', 'static', 'moxiang-master-speaking.webp'),
  path.join('pagesSub', 'profileExtra', 'static', 'moxiang-master-thinking.webp'),
  path.join('pagesSub', 'profileExtra', 'static', 'poster-templates', 'ehi3K.webp'),
  path.join('pagesSub', 'profileExtra', 'static', 'poster-templates', 'X7hDIt.webp'),
  path.join('pagesSub', 'profileExtra', 'static', 'poster-templates', 'gabCv.webp'),
  path.join('pagesSub', 'profileExtra', 'static', 'poster-templates', 'v4EFK.webp')
]

for (const asset of expectedAssets) {
  assert.ok(fs.existsSync(path.join(artifactRoot, asset)), `missing generated matchmaker asset: ${asset}`)
}
for (const asset of expectedProfileExtraAssets) {
  assert.ok(fs.existsSync(path.join(artifactRoot, asset)), `missing generated profile-extra asset: ${asset}`)
}
assert.ok(!fs.existsSync(path.join(artifactRoot, 'pagesSub', 'matchmaker', 'assets')), 'matchmaker assets must not be copied into an untracked subpackage directory')
assert.ok(!fs.existsSync(path.join(artifactRoot, 'assets')), 'profile-extra assets must remain in their subpackage instead of being emitted into the main package')

console.log('PASS mp-weixin subpackage assets')
