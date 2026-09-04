const fs = require('fs')
const path = require('path')
const { hasRegisteredPage } = require('./page-route-helper.cjs')

const root = path.join(__dirname, '..')
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8')
const expect = (content, fragment, label) => {
  if (!content.includes(fragment)) throw new Error(`${label}: missing ${fragment}`)
  console.log(`PASS ${label}`)
}
const expectAbsent = (content, fragment, label) => {
  if (content.includes(fragment)) throw new Error(`${label}: must not contain ${fragment}`)
  console.log(`PASS ${label}`)
}

console.log('Role application real-service flow checks')

const api = read('api/matchmaker.uts')
expect(api, "url: '/matchmaker/applications'", 'backend application endpoint')
for (const type of ['service_matchmaker', 'partner', 'promoter']) {
  expect(api, `submitRoleApplication('${type}', data)`, `${type} application routing`)
}
for (const field of ['wechat:', 'specialties:', 'expected_price:', 'success_cases:']) {
  expect(api, field, `${field} request mapping`)
}
for (const legacy of ['ROLE_APPLICATION_USE_MOCK', 'createMockRoleApplication', 'ROLE_APPLICATION_MOCK_STORAGE_KEY']) {
  expectAbsent(api, legacy, `${legacy} removed`)
}

for (const page of [
  'pagesSub/matchmaker/become-matchmaker.uvue',
  'pagesSub/matchmaker/become-partner.uvue',
  'pagesSub/matchmaker/become-promoter.uvue'
]) {
  const content = read(page)
  expect(content, 'uni.redirectTo({', `${page} success navigation`)
  expect(content, '/pagesSub/matchmaker/application-success?type=', `${page} success route`)
  expectAbsent(content, '&mock=', `${page} does not pass Mock state`)
}

const successPage = read('pagesSub/matchmaker/application-success.uvue')
expect(successPage, '资料已送达审核队列', 'real submission notice')
expectAbsent(successPage, 'isMock', 'success page has no Mock branch')
expect(successPage, "uni.switchTab({ url: '/pages/matchmaker/matchmaker' })", 'stable return target')

if (!hasRegisteredPage(root, 'pagesSub/matchmaker/application-success')) {
  throw new Error('success route registration: missing pagesSub/matchmaker/application-success')
}
console.log('PASS success route registration')
console.log('Role application real-service flow checks passed')
