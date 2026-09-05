const fs = require('fs')
const path = require('path')

const root = path.resolve(__dirname, '..')
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8')

const aiMoxiang = read('api/ai-moxiang.uts')
const communityApi = read('api/community.uts')
const login = read('pages/auth/login.uvue')
const dynamicCard = read('components/XsaDynamicCard.uvue')
const notifications = read('pagesSub/community/notifications.uvue')

const startBlock = aiMoxiang.slice(aiMoxiang.indexOf('export function startIdealPartnerJourney'), aiMoxiang.indexOf('export async function sendMoxiangTurn'))
if (!/headers\s*:\s*\{[\s\S]*Idempotency-Key/.test(startBlock)) {
  throw new Error('墨相师启动请求必须使用 request 支持的 headers 字段传递幂等键')
}
if (/\bheader\s*:\s*\{[\s\S]*Idempotency-Key/.test(startBlock)) {
  throw new Error('墨相师启动请求仍使用 request 不识别的单数 header 字段')
}

if (!/export async function collectDynamic\s*\(/.test(communityApi)) {
  throw new Error('社区 API 必须保留动态收藏写路径')
}
if (!/collectCount\s*:/.test(communityApi) || !/collected\s*:/.test(communityApi)) {
  throw new Error('社区动态映射必须同时提供收藏计数和当前用户收藏状态')
}
if (!/emit\('collect'/.test(dynamicCard) || !/handleCollect/.test(dynamicCard)) {
  throw new Error('动态卡片必须暴露收藏交互事件')
}

if (!/loginByExistingAccount/.test(login)) {
  throw new Error('真实后端模式下调试登录必须换取后端签发的访问令牌')
}
if (/debug_access_token_xsa/.test(login)) {
  throw new Error('调试登录不能写入后端无法识别的固定访问令牌')
}

if (!/targetType\s*==\s*['"]comment['"]/.test(notifications)) {
  throw new Error('通知路由必须按 targetType=comment 处理评论目标')
}

console.log('consistency regression checks passed')
