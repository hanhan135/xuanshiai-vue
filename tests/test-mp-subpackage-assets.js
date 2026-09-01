const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')

const artifactRoot = path.resolve(__dirname, '..', 'unpackage', 'dist', 'dev', 'mp-weixin')
const expectedAssets = [
  path.join('static', 'cases', 'shenzhen-zhang-liu.jpg'),
  path.join('static', 'cases', 'wuhan-zhou-zheng.jpg'),
  path.join('static', 'portraits', 'custom-matchmaker-hero.jpg')
]
const expectedProfileExtraAssets = [
  path.join('pagesSub', 'profileExtra', 'static', 'moxiang', 'moxiang-master-idle.jpg'),
  path.join('pagesSub', 'profileExtra', 'static', 'moxiang', 'moxiang-master-listening.jpg'),
  path.join('pagesSub', 'profileExtra', 'static', 'moxiang', 'moxiang-master-speaking.jpg'),
  path.join('pagesSub', 'profileExtra', 'static', 'moxiang', 'moxiang-master-thinking.jpg'),
  path.join('pagesSub', 'profileExtra', 'static', 'poster-templates', 'ehi3K.png'),
  path.join('pagesSub', 'profileExtra', 'static', 'poster-templates', 'X7hDIt.png'),
  path.join('pagesSub', 'profileExtra', 'static', 'poster-templates', 'gabCv.png'),
  path.join('pagesSub', 'profileExtra', 'static', 'poster-templates', 'v4EFK.png')
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
