const fs = require('fs')
const path = require('path')

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

console.log('Matchmaker contact authorization checks')

const api = read('api/matchmaker.uts')
const apiIndex = read('api/index.uts')
expectAbsent(api, 'getMockMatchmakerContact', 'local contact API removed')
expectAbsent(apiIndex, 'getMockMatchmakerContact', 'local contact API export removed')

const custom = read('pagesSub/matchmaker/custom.uvue')
expect(custom, '提交服务申请后，平台会在授权流程内安排联系', 'custom page explains authorization path')
expectAbsent(custom, 'contactPanelVisible', 'custom page has no local contact panel')
expectAbsent(custom, 'uni.makePhoneCall', 'custom page cannot call local contact')

const detail = read('pagesSub/matchmaker/detail.uvue')
expect(detail, 'applyForService', 'detail page routes to service application')
expect(detail, "url: '/pagesSub/matchmaker/custom'", 'detail page service route')
expectAbsent(detail, "from '@/mock'", 'detail page has no local contact import')
expectAbsent(detail, 'wechatPanelVisible', 'detail page has no contact QR panel')
expectAbsent(detail, 'uni.makePhoneCall', 'detail page has no direct calling')

console.log('Matchmaker contact authorization checks passed')
