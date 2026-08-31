const fs = require('fs')
const path = require('path')
const assert = require('assert')

const root = path.join(__dirname, '..')
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8')

const ws = read('api/voice-master-ws.uts')

// ===== 建构模式回调:progress / confirm_card / publish_ready =====
assert.match(ws, /onProgress\?:/, 'MasterWSCallbacks must expose onProgress')
assert.match(ws, /onConfirmCard\?:/, 'MasterWSCallbacks must expose onConfirmCard')
assert.match(ws, /onPublishReady\?:/, 'MasterWSCallbacks must expose onPublishReady')
assert.match(ws, /export interface MasterProgress/, 'MasterProgress payload type must be exported')
assert.match(ws, /export interface ConfirmCardItem/, 'ConfirmCardItem type must be exported')
assert.match(ws, /export interface ConfirmCardPayload/, 'ConfirmCardPayload type must be exported')

// ===== 服务端消息分发:三种新推送必须进入消息分发 =====
assert.match(ws, /case 'progress':/, 'dispatch must handle progress pushes')
assert.match(ws, /case 'confirm_card':/, 'dispatch must handle confirm_card pushes')
assert.match(ws, /case 'publish_ready':/, 'dispatch must handle publish_ready pushes')

// ===== 字段映射:snake_case(后端契约) → camelCase(前端类型) =====
assert.match(ws, /hard_done/, 'progress must read hard_done from the backend payload')
assert.match(ws, /hardDone/, 'progress must surface hardDone')
assert.match(ws, /hard_total/, 'progress must read hard_total from the backend payload')
assert.match(ws, /hardTotal/, 'progress must surface hardTotal')
assert.match(ws, /entry_score/, 'progress must read entry_score from the backend payload')
assert.match(ws, /entryScore/, 'progress must surface entryScore')
assert.match(ws, /gate_met/, 'progress must read gate_met from the backend payload')
assert.match(ws, /gateMet/, 'progress must surface gateMet')
assert.match(ws, /card_id/, 'confirm_card must read card_id from the backend payload')
assert.match(ws, /cardId/, 'confirm_card must surface cardId')
assert.match(ws, /draft_id/, 'confirm_card must read draft_id from the backend payload')
assert.match(ws, /draftId/, 'confirm_card must surface draftId')
assert.match(ws, /expected_revision/, 'confirm_card must read expected_revision from the backend payload')
assert.match(ws, /expectedRevision/, 'confirm_card must surface expectedRevision')
assert.match(ws, /field_key/, 'confirm_card items must read field_key from the backend payload')
assert.match(ws, /fieldKey/, 'confirm_card items must surface fieldKey')
assert.match(ws, /display_value/, 'confirm_card items must read display_value from the backend payload')
assert.match(ws, /displayValue/, 'confirm_card items must surface displayValue')

// ===== session_start 建构模式:mode/subject/consentVersion =====
assert.match(ws, /profile_build/, 'session_start must carry mode=profile_build for build sessions')
assert.match(ws, /consentVersion/, 'session_start must carry consentVersion')
assert.match(
  ws,
  /startBuildMode\(subject: string, consentVersion: string\)/,
  'startBuildMode(subject, consentVersion) must exist'
)
assert.match(ws, /sendSessionStart/, 'session_start sending must be centralized so reconnects replay it')
assert.match(
  ws,
  /this\.sendSessionStart\(\)/,
  'onOpen must route session_start through sendSessionStart'
)

// ===== 纯聊兼容:无建构参数时 session_start 不带 mode(后端兼容分支不动) =====
assert.match(
  ws,
  /this\.send\(\{ type: 'session_start' \}\)/,
  'pure-chat session_start must stay unchanged (no mode field)'
)

// ===== text_message 带随机 clientTurnId =====
assert.match(ws, /clientTurnId/, 'text messages must carry a clientTurnId')
const textSend = ws.slice(ws.indexOf('sendTextMessage'), ws.indexOf('sendAudioStart'))
assert.ok(textSend.length > 0, 'sendTextMessage block not found')
assert.match(textSend, /text_message/, 'sendTextMessage must send type text_message')
assert.match(textSend, /Date\.now\(\)/, 'clientTurnId must be derived from Date.now()')
assert.match(textSend, /Math\.random\(\)/, 'clientTurnId must mix in Math.random()')

// ===== Task 9: 墨相师页建构 UI + 退出修复 =====
const page = read('pagesSub/profileExtra/my-portrait-master.uvue')

// 建构模式接入:onLoad 建连即进入建构模式(session_start 携带 mode=profile_build)
assert.match(
  page,
  /startBuildMode\('personal',\s*'profile-text-v1'\)/,
  'page must enter build mode with personal subject and profile-text-v1 consent'
)
assert.match(page, /buildMode/, 'page must track buildMode state')
assert.match(
  page,
  /v-if="buildMode"/,
  'build UI must render only in build mode (pure chat stays unchanged)'
)

// 进度条:硬字段 n/3 + percent
assert.match(page, /mm-progress/, 'page must render build progress bar')
assert.match(page, /mm-progress-fill/, 'progress bar must render a fill track')
assert.match(page, /onProgress/, 'page must consume onProgress callback')
assert.match(page, /hardDone/, 'progress text must surface hardDone')
assert.match(page, /hardTotal/, 'progress text must surface hardTotal')

// 确认卡片:进流渲染 + REST 确认动作
assert.match(page, /mm-card/, 'page must render confirm card')
assert.match(page, /onConfirmCard/, 'page must consume onConfirmCard callback')
assert.match(page, /draftState/, 'card payload must be kept for draft actions')
assert.match(page, /patchProfileDraft/, 'card actions must call REST confirm via patchProfileDraft')
assert.match(page, /fieldAction\(/, 'card actions must be built with fieldAction')
assert.match(page, /fieldAction\([^)]*'replace'/, 'edit action must submit via fieldAction replace')
assert.match(page, /fieldAction\([^)]*'delete'/, 'delete action must submit via fieldAction delete')
assert.match(page, /getProfileDraft/, 'expectedRevision must refresh via getProfileDraft after actions')
assert.match(page, /expectedRevision/, 'card actions must carry expectedRevision')

// 发布引导
assert.match(page, /onPublishReady/, 'page must consume onPublishReady callback')
assert.match(page, /gateMet/, 'publish entry must be gated by gateMet')
assert.match(page, /goPortrait/, 'publish entry must navigate via goPortrait')
assert.match(
  page,
  /pagesSub\/profileExtra\/my-portrait'/,
  'goPortrait must navigate to the portrait page'
)

// 退出修复:页面栈兜底 + ✕ 图标 + 44px 热区
assert.match(page, /getCurrentPages/, 'navBack must guard empty page stack')
assert.match(page, /reLaunch/, 'navBack must fall back to reLaunch when page stack is empty')
assert.match(page, /pages\/index\/index/, 'reLaunch fallback must target the home page')
assert.match(page, /✕/, 'nav back icon must be ✕')
assert.doesNotMatch(page, />‹<\/text>/, 'nav back icon must not remain ‹')
assert.match(
  page,
  /mm-nav-back\s*\{[^}]*width:\s*44px/,
  'nav back hot zone must be at least 44px wide'
)
assert.match(
  page,
  /mm-nav-back\s*\{[^}]*height:\s*44px/,
  'nav back hot zone must be at least 44px tall'
)

// ===== Task 10: 我的页新增墨相师入口,画像页删除墨相师入口卡片 =====
const my = read('pages/profile/profile.uvue')
assert.match(
  my,
  /my-portrait-master/,
  'my page must link to moxiang master page (Task 10 entry unification)'
)
const portrait = read('pagesSub/profileExtra/my-portrait.uvue')
assert.doesNotMatch(
  portrait,
  /墨相师页面打开失败/,
  'old master-entry toast must be removed from portrait page (Task 10)'
)

console.log('moxiang master ws + build ui contract passed')
