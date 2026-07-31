const fs = require('fs')
const path = require('path')
const assert = require('assert')

const root = path.join(__dirname, '..')
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8')
const profile = read('pages/profile/profile.uvue')
const settings = read('pagesSub/profileExtra/settings.uvue')
const help = read('pagesSub/profileExtra/help.uvue')
const security = read('pagesSub/profileExtra/security.uvue')
const routes = read('pages.json')
const about = read('mock/about.uts')
const article = read('pagesSub/about/article.uvue')
const helpApi = read('api/help.uts')
const securityApi = read('api/security.uts')
const helpMock = read('mock/help.uts')
const securityMock = read('mock/security.uts')

const checks = [
  ['security loads security center data', security.includes('getSecurityCenterData') && security.includes('loadSecurityCenter')],
  ['security data api is exported', securityApi.includes('SecurityCenterData') && securityApi.includes('getSecurityCenterData') && read('api/index.uts').includes('getSecurityCenterData')],
  ['security mock owns display data', securityMock.includes('mockSecurityCenterData') && securityMock.includes('totalProcessed') && securityMock.includes('fraudArticles') && !securityMock.includes('usageRules') && read('mock/index.uts').includes('mockSecurityCenterData')],
  ['security data is not kept in page arrays', !security.includes('const usageRules = [') && !security.includes('const fraudArticles = [')],
  ['security shows monthly governance total', security.includes('monthLabel') && security.includes('累计处置账号') && security.includes('governance-total-value')],
  ['security shows three governance counters', security.includes('暂时封禁') && security.includes('永久封禁') && security.includes('警告')],
  ['security shows usage norms removed', !security.includes('用户使用规范') && !securityMock.includes('使用真实资料') && security.includes('我的安全设置')],
  ['security shows report and appeal records', security.includes('举报与申诉记录') && security.includes('getMyReports') && security.includes('getMyReportAppeals') && security.includes('toggleRecords')],
  ['security removes hero privacy badge', !security.includes('hero-shield') && !security.includes('隐私守护') && !securityMock.includes('badge')],
  ['security places operation guide before fraud', security.indexOf('我的安全设置') < security.indexOf('需要操作指引') && security.indexOf('需要操作指引') < security.indexOf('反诈宣传')],
  ['security displays fraud articles', security.includes('fraudArticles') && securityMock.includes('识别冒充诈骗') && securityMock.includes('远离投资转账骗局') && security.includes('openArticle(article.type)')],
  ['profile routes help page', profile.includes("url: '/pagesSub/profileExtra/help'")],
  ['profile routes security page', profile.includes("url: '/pagesSub/profileExtra/security'") && profile.includes("item.label == '安全中心' ? onSecurity()")],
  ['registered help route', routes.includes('"path": "help"')],
  ['registered security route', routes.includes('"path": "security"')],
  ['settings routes feedback', settings.includes("/pagesSub/profileExtra/help?open=feedback")],
  ['help api exports FAQ center', helpApi.includes('getHelpCenter') && helpApi.includes('HelpCategory')],
  ['help mock has five FAQ categories', ['常见问题', '完善资料', '嘉宾推荐', '功能使用', '增值服务'].every((label) => helpMock.includes(label))],
  ['help page has large quick cards', help.includes('ai-card') && help.includes('feedback-card') && help.includes('quick-card-main')],
  ['help page has horizontal FAQ tabs', help.includes('category-tabs') && help.includes('category-tabs-inner') && help.includes('category-tab') && help.includes('category-indicator')],
  ['help page has FAQ list and numbering', help.includes('faq-panel') && help.includes('faq-index') && help.includes('activeCategoryId')],
  ['help page has no bottom fixed action bar', !help.includes('class="help-footer"') && !help.includes('class="footer-action"')],
  ['help FAQ opens AI support', help.includes('openFaq') && help.includes('sendDraft()')],
  ['help api retains message and feedback', helpApi.includes('sendAiSupportMessage') && helpApi.includes('submitFeedback')],
  ['help prevents duplicate sending', help.includes('if (aiSending.value) return')],
  ['help prevents duplicate feedback', help.includes('if (feedbackSubmitting.value) return')],
  ['security loads blocked users', security.includes('getBlockedUsers') && security.includes('loadBlockedUsers')],
  ['security retries blocked users', security.includes('点击重试') && security.includes('@tap="loadBlockedUsers"')],
  ['security confirms unblock', security.includes('uni.showModal') && security.includes('解除拉黑')],
  ['security shows success toast', security.includes("title: '已解除拉黑'")],
  ['security links governance article', security.includes("openArticle('governance_notice')")],
  ['security links safety article', securityMock.includes("type: 'fraud_identity_scam'") && securityMock.includes("type: 'fraud_investment_scam'")],
  ['fraud article content exists', about.includes('fraud_identity_scam') && about.includes('fraud_investment_scam')],
  ['article error retries', article.includes('@tap="onRetry"')],
  ['governance article exists', about.includes('governance_notice')],
  ['safety guide article exists', about.includes('dating_safety_guide')],
  ['new pages avoid browser api', !(/window\.|document\.|localStorage|sessionStorage/.test(help + security))]
]

let failed = 0
checks.forEach(([name, passed]) => {
  try {
    assert.strictEqual(passed, true)
    console.log(`✅ ${name}`)
  } catch (e) {
    failed += 1
    console.log(`❌ ${name}`)
  }
})

if (failed > 0) {
  console.log(`客服与安全页面静态校验失败：${failed} 项`)
  process.exit(1)
}
console.log('客服与安全页面静态校验全部通过')
