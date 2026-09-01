const fs = require('fs')
const path = require('path')

const root = path.join(__dirname, '..')

function read(file) {
  return fs.readFileSync(path.join(root, file), 'utf8')
}

function expect(content, fragment, label) {
  if (!content.includes(fragment)) {
    throw new Error(`${label}: missing ${fragment}`)
  }
  console.log(`PASS ${label}`)
}

function expectPattern(content, pattern, label) {
  if (!pattern.test(content)) {
    throw new Error(`${label}: missing ${pattern}`)
  }
  console.log(`PASS ${label}`)
}

console.log('Matchmaker management center flow checks')

const document = read('docs/服务红娘管理中心框架开发文档.md')
expect(document, '服务红娘管理中心框架开发文档', 'development document')
expect(document, '账号状态为 `active`', 'payment and role gate documented')
expect(document, '门店数据简报', 'reference-image layout documented')
expect(document, '不展示 Mock 用户', 'no mock data documented')
expect(document, '服务端 RBAC', 'server RBAC documented')

const dashboardDocument = read('docs/红娘管理中心-数据看板开发文档.md')
expect(dashboardDocument, '红娘管理中心数据简报框架说明', 'dashboard development document')
expect(dashboardDocument, '所有指标值统一显示 `--`', 'empty metrics documented')
expect(dashboardDocument, '不创建 Mock 明细页', 'no mock detail documented')

const config = read('api/config.uts')
expect(config, 'MATCHMAKER_MANAGEMENT_CENTER_USE_MOCK', 'explicit management center mock switch')

const api = read('api/matchmaker.uts')
expect(api, 'getMatchmakerManagementCenterAccess', 'access API')
expect(api, "url: '/matchmaker/management-center/access'", 'access endpoint')
expect(api, 'getMatchmakerManagementCenterSnapshot', 'dashboard API')
expect(api, "url: '/matchmaker/management-center/dashboard'", 'dashboard endpoint')
expect(api, "roleStatus == 'active' && paymentStatus == 'paid'", 'client-side defensive gate')

const apiIndex = read('api/index.uts')
expect(apiIndex, 'getMatchmakerManagementCenterAccess', 'access API exported')
expect(apiIndex, 'getMatchmakerManagementCenterSnapshot', 'dashboard API exported')

const mock = read('mock/matchmaker.uts')
expect(mock, 'mockMatchmakerManagementCenterAccess', 'management center access mock')
expect(mock, "paymentStatus: 'paid'", 'paid mock state')
expect(mock, "roleStatus: 'active'", 'active role mock state')
expect(mock, 'mockMatchmakerManagementCenterSnapshot', 'management center snapshot mock')
expect(mock, 'storeMetrics:', 'empty management center metric skeleton')
expect(mock, "value: '--'", 'empty management center metric value')

const page = read('pagesSub/matchmaker/become-matchmaker.uvue')
expect(page, '红娘管理中心', 'management center entry label')
expect(page, 'getMatchmakerManagementCenterAccess', 'entry loads access state')
expect(page, 'canEnterManagementCenter', 'entry access gate')
expect(page, 'getMatchmakerManagementCenterSnapshot', 'entry loads dashboard snapshot')
expect(page, '<MatchmakerManagementCenter', 'management center component mounted')
expect(page, '完成服务开通付款后，即可进入管理中心。', 'unpaid state copy')
expect(page, 'onShow(() => {', 'returns from payment refresh access state')

const component = read('components/MatchmakerManagementCenter.uvue')
expect(component, '门店数据简报', 'management center summary panel')
expect(component, '录入线索', 'quick lead entry')
expect(component, '录入会员', 'quick member entry')
expect(component, '添加牵线', 'quick matching entry')
expect(component, '安排约见', 'quick meeting entry')
expect(component, '活动报名', 'quick activity entry')
expect(component, '专属推广工具', 'promotion framework')
expect(component, "emit('identity')", 'service matchmaker identity entry')
for (const label of ['客源线索', '全部会员', '我服务的', '牵线记录', '约见申请', '约会管理', '视频管理', '分成明细', '财务明细', '我的账号']) {
  expect(component, label, `management center function ${label}`)
}
expect(component, "value: '--'", 'component empty metric fallback')
if (component.includes('演示数据') || component.includes('Mock 明细操作') || component.includes('pendingReviewProfiles')) {
  throw new Error('management center component must not render mock data or mock detail pages')
}
console.log('PASS no mock data UI')

expect(page, '@identity="openMatchmakerIdentity"', 'identity event connected')
expect(page, "url: '/pagesSub/profileExtra/certification'", 'identity information route')
expect(page, '<MatchmakerPendingReview', 'pending review framework mounted')
expect(page, "if (name == '资料待审')", 'pending review entry route')

const pendingReview = read('components/MatchmakerPendingReview.uvue')
expectPattern(pendingReview, /const\s+tabs\s*=\s*\[\s*'全部'\s*,\s*'待审'\s*,\s*'我的'\s*,\s*'弃海'\s*,\s*'线上VIP'\s*,\s*'线下VIP'\s*\]/, 'pending review filter tabs')
expect(pendingReview, '请输入昵称/编号/姓名/手机号', 'pending review search framework')
expect(pendingReview, '编号：{{member.id}}', 'pending review card identity binding')
expect(pendingReview, '登记：{{member.registeredAt}}', 'pending review registration binding')
expect(pendingReview, '录入', 'pending review floating entry')
expect(pendingReview, '筛选', 'pending review floating filter')
expect(pendingReview, '牵线({{moreMember.introductions.length}})', 'pending review more menu count binding')
expect(pendingReview, '匹配', 'pending review more menu matching action')
expect(pendingReview, '红娘说', 'pending review more menu matchmaker note action')
expect(pendingReview, '修改红娘', 'pending review more menu change matchmaker action')
expect(pendingReview, '放入弃海', 'pending review more menu archive action')
expect(pendingReview, 'openMore(member)', 'pending review per-card more-list trigger')
expect(pendingReview, 'class="more-menu"', 'pending review more actions use a compact menu')
expect(pendingReview, 'closePanel', 'pending review overlay has a close action')
expect(pendingReview, 'align-items:flex-end', 'pending review bottom-sheet positioning')
expect(pendingReview, '会员 {{selectedMember.name}} 的牵线记录', 'introduction record framework')
expect(pendingReview, '主动牵线', 'active introduction tab')
expect(pendingReview, '被动牵线', 'passive introduction tab')
expect(pendingReview, '根据该会员择偶要求', 'matching scope hint')
expect(pendingReview, '本信息公开显示', 'public matchmaker note hint')
expect(pendingReview, '修改红娘', 'change assigned matchmaker workflow')
expect(pendingReview, '资料审核不通过', 'archive review rejection meaning')
expect(pendingReview, 'getMatchmakerReviewMembers', 'pending review reads through the API boundary')
expect(pendingReview, 'updateMatchmakerReviewMember', 'pending review writes through the API boundary')
if (pendingReview.includes("from '@/mock") || pendingReview.includes('mockMatchmakerReviewMembers')) {
  throw new Error('pending review component must not import Mock records directly')
}
console.log('PASS pending review API-bound local workflow')

console.log('Matchmaker management center flow checks passed')
