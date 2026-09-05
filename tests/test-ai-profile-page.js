const fs = require('fs')
const path = require('path')
const assert = require('assert')

const root = path.join(__dirname, '..')
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8')

const api = read('api/ai-profile.uts')
const moxiangApi = read('api/ai-moxiang.uts')
const apiIndex = read('api/index.uts')
const page = read('pagesSub/profileExtra/my-portrait.uvue')
const recorder = read('components/VoiceRecorder.uvue')
const ingredient = read('components/PersonaIngredient.uvue')
const batchSheet = read('components/PersonaBatchSheet.uvue')

// ===== api/ai-profile.uts:纯真实 API、幂等、任务轮询、错误码 =====
assert.doesNotMatch(api, /USE_MOCK|mock\w+\(/, 'ai-profile api must not keep any mock branch')
assert.match(api, /Idempotency-Key/, 'ai-profile writes must carry idempotency keys')
assert.match(api, /genIdempotencyKey/, 'ai-profile must generate idempotency keys')
assert.match(api, /status == 'succeeded'/, 'task polling must handle the succeeded state')
assert.match(api, /status == 'failed'/, 'task polling must handle the failed state')
assert.match(api, /AI 处理超时/, 'task polling must surface a timeout message')
assert.match(api, /AI_FEATURE_DISABLED/, 'error mapping must cover feature-disabled')
assert.match(api, /AI_CONSENT_REQUIRED/, 'error mapping must cover consent-required')
assert.match(api, /DRAFT_VERSION_CONFLICT/, 'error mapping must cover draft version conflicts')
assert.match(api, /RESULT_STALE/, 'error mapping must cover published/dead draft staleness')
assert.match(api, /transcribeAudio/, 'voice transcription entry must exist')
assert.match(api, /\/voice\/transcribe/, 'real ASR path must POST to /voice/transcribe')
assert.match(api, /uploadAudioForTranscribe/, 'real ASR path must upload audio via uni.uploadFile')
assert.match(api, /result_payload/, 'real ASR polling must read transcript from result_payload')
assert.match(api, /synthesizeSpeech/, 'TTS synthesis entry must exist')
assert.match(api, /\/voice\/synthesize/, 'TTS synthesis must POST to /voice/synthesize')
assert.match(api, /resolveMediaUrl/, 'TTS synthesis must resolve the audio URL for playback')

// ===== publish 契约:expected_revision 必须走 query 参数(后端 2026-08 契约) =====
assert.match(
  api,
  /\/publish\?expected_revision=' \+/,
  'publish must pass expected_revision as a query parameter, not a body field'
)
const publishBlock = api.slice(api.indexOf('async function publishProfileDraft'), api.indexOf('/**', api.indexOf('async function publishProfileDraft')))
assert.ok(publishBlock.length > 0, 'publish function block not found')
assert.doesNotMatch(
  publishBlock,
  /data:\s*\{\s*expected_revision/,
  'publish must not send expected_revision in the request body'
)

// ===== 任务终态轮询:八种状态全覆盖 =====
assert.match(api, /pollTaskUntilTerminal/, 'terminal-state poll helper must exist')
for (const st of ['cancelled', 'superseded']) {
  assert.ok(api.includes(`status == '${st}'`), `polling must handle the ${st} terminal state`)
}

// ===== 授权接入:GET/PUT/DELETE /ai/consents 真实链路 =====
assert.match(api, /getAiConsents/, 'consent list entry must exist')
assert.match(api, /grantProfileTextConsent/, 'consent grant entry must exist')
assert.match(api, /revokeProfileTextConsent/, 'consent revoke entry must exist')
assert.match(api, /X-Expected-Privacy-Revision/, 'consent writes must carry the privacy revision header')
assert.match(api, /profile-text-v1/, 'grant must submit the server-frozen consent version')

// ===== 字段 key 对齐(后端 allowlist 十字段) =====
const labelKeys = new Set([...api.matchAll(/FIELD_KEY_LABELS\.set\('(\w+)'/g)].map(m => m[1]))
const expected = ['age', 'city_code', 'marriage_status', 'education_level', 'height_cm',
  'income_band', 'occupation_group', 'interest_tags', 'lifestyle_tags', 'relationship_goal']
for (const key of expected) {
  assert.ok(labelKeys.has(key), `FIELD_KEY_LABELS must include ${key}`)
}
assert.strictEqual(labelKeys.size, expected.length, 'FIELD_KEY_LABELS must not carry extra keys')

// ===== api/index.uts:画像模块整体导出 =====
assert.match(apiIndex, /from '\.\/ai-profile\.uts'/, 'api barrel must re-export the ai-profile module')
assert.match(apiIndex, /grantProfileTextConsent/, 'api barrel must re-export consent functions')
assert.match(apiIndex, /ai-moxiang\.uts/, 'api barrel must expose the unified moxiang journey module')
assert.match(apiIndex, /getMoxiangState/, 'api barrel must expose moxiang state/history services')

// ===== my-portrait.uvue(备用落笔页):组件导入、发布门槛、判空、双模式 =====
assert.match(page, /import PersonaIngredient from '@\/components\/PersonaIngredient\.uvue'/, 'atelier page must import the ingredient card it renders')
assert.match(page, /import VoiceRecorder from '@\/components\/VoiceRecorder\.uvue'/, 'atelier page must import the voice recorder')
// 2026-09-02 冗余下线:墨案货架/成稿副本/实时对话沉浸层只保留结果页与墨相师一份实现
assert.doesNotMatch(page, /PersonaBottle|VoiceConversation/, 'atelier page must not keep the retired shelf or realtime-conversation components')
assert.doesNotMatch(page, /viewMode|subjectPane|at-shelf|at-letter|conversationMode/, 'atelier page must not keep shelf/letter-pane/conversation-layer state')
assert.match(page, /import PortraitBatchSheetComponent from '@\/components\/PersonaBatchSheet\.uvue'/, 'atelier page must import the batch sheet')
assert.match(page, /已确认字段不足半数[\s\S]{0,20}暂不能写下成稿/, 'atelier page must block publishing without confirmed fields')
assert.match(page, /墨相/, 'page must name the module 墨相')
assert.match(page, /我的墨相/, 'page must name the personal subject 我的墨相')
assert.match(page, /愿遇之相/, 'page must name the ideal subject 愿遇之相')
assert.match(page, /写下成稿/, 'page must use 写下成稿 as the publish action')
assert.match(api, /skipProfileQuestion/, 'ai-profile api must expose skipProfileQuestion')
assert.match(api, /\/skip-question/, 'skip path must POST to /profile-sessions/{id}/skip-question')
assert.match(page, /不想答/, 'atelier question bubble must offer 不想答')
assert.match(page, /skipCurrentQuestion/, 'atelier page must skip the current interview question')
assert.match(
	api,
	/publishProfileDraft\(draftId: string, expectedRevision: number, previewId: string = ''\)/,
	'publish client must accept the preview id used to approve the exact preview'
)
assert.match(
	api,
	/data:\s*previewId\s*!=\s*''\s*\?\s*\{\s*preview_id:\s*previewId\s*\}\s*:\s*\{\}/,
	'publish client must send preview_id in the request body when present'
)
assert.match(api, /confirmPortraitNarrative/, 'ai-profile api must expose narrative confirmation')
assert.match(api, /\/profiles\/.*\/narrative\/confirm/, 'narrative confirmation must call the backend confirm endpoint')
assert.match(page, /删除画像/, 'danger path must use literal 删除画像')
assert.match(page, /if \(session\.value != null\)/, 'revision restore must guard against a missing session')
const restoreBlock = page.slice(page.indexOf('restoreProfileRevision(revisionId)'))
assert.ok(
  restoreBlock.indexOf('if (session.value != null)') < restoreBlock.indexOf('getProfileSession(String(session.value.session_id))'),
  'the null guard must wrap the session refresh after restore'
)
assert.match(page, /switchToText/, 'atelier page must support switching to text mode')
assert.match(page, /switchToVoice/, 'atelier page must support switching to voice mode')
assert.match(page, /restoreProfileRevision/, 'atelier page must support restoring a history revision')

// ===== 墨相师 REST 响应适配：request 返回 { success, data }，后端 turn 使用 answer_text =====
assert.match(moxiangApi, /function unwrapMoxiangResponse\(/, 'moxiang REST adapter must unwrap request success/data envelope')
assert.match(moxiangApi, /answer_text[^\n]*content|content[^\n]*answer_text/, 'moxiang turn adapter must map backend answer_text to frontend content')

// ===== 自定义导航:必须避开微信胶囊,不能被 statusBar padding 压进 44px 盒高 =====
assert.match(page, /getMenuButtonBoundingClientRect/, 'atelier custom nav must read the WeChat capsule rect')
assert.match(page, /menuButtonSpacing/, 'atelier custom nav must reserve right padding for the capsule')
assert.match(page, /navPadTop/, 'atelier custom nav must align with the capsule top')
assert.doesNotMatch(
	page,
	/\.at-nav \{[^}]*height:\s*44px/,
	'atelier nav must not use a 44px box height that collapses under border-box + statusBar padding'
)
assert.match(
	page,
	/\.at-nav \{[\s\S]*?box-sizing:\s*content-box/,
	'atelier nav must use content-box so capsule padding does not eat the bar height'
)
assert.match(
	page,
	/\.at-nav-title[\s\S]*?position:\s*absolute/,
	'atelier nav title must be absolutely centered so it does not collide with the capsule'
)
assert.doesNotMatch(
	page,
	/v-if="viewMode == 'subject'" class="at-nav-action" @tap="openBatch"/,
	'atelier subject nav must not put 批次 next to the WeChat capsule'
)
assert.match(
	page,
	/class="at-nav-action"[\s\S]{0,40}manageVisible = true/,
	'atelier subject nav may keep a compact ⋯ control that opens the manage sheet'
)

// ===== 发布流程:轮询真实任务,成稿展示统一交给结果页 =====
assert.match(page, /pollTaskUntilTerminal/, 'publish must poll the real publish task to a terminal state')
assert.doesNotMatch(page, /性格倾向.*情感需求/, 'publish transition must not fake narrative generation steps')
assert.match(page, /my-portrait-result\?subject=/, 'publish success must hand the finished draft to the canonical result page')
assert.match(page, /if \(!legacyFallback && masterHandoffSubject != sub\)/, 'the atelier page must stay a fallback: empty portraits route to 墨相师')

// ===== 删除/授权:真实入口与清理反馈 =====
assert.match(page, /deleteAiProfile/, 'atelier page must expose real subject-profile deletion')
assert.match(page, /revokeProfileTextConsent/, 'atelier page must expose real consent revocation')
assert.match(page, /已删除,正在清理/, 'deletion must surface cleanup feedback instead of stale data')

// ===== 版本冲突:409 后重新拉草稿 =====
const patchBlock = page.slice(page.indexOf('const patchField'))
assert.match(patchBlock, /DRAFT_VERSION_CONFLICT/, 'field patch must handle draft version conflicts')
assert.match(patchBlock, /getProfileDraft/, 'conflict recovery must refetch the draft')

// ===== VoiceRecorder.uvue:五态、60 秒上限、拖拽取消 =====
for (const state of ['speaking', 'idle', 'listening', 'transcribing', 'reviewing']) {
  assert.match(recorder, new RegExp(`recorderState == '${state}'`), `recorder must handle the ${state} state`)
}
assert.match(recorder, /recordDuration >= 60/, 'recorder must cap a single take at 60 seconds')
assert.match(recorder, /deltaY > 40/, 'recorder must support drag-to-cancel')
assert.match(recorder, /transcribeAudio/, 'recorder must route through the transcription adapter')
assert.match(recorder, /uni\.getRecorderManager/, 'recorder must use the platform recorder manager')
assert.match(recorder, /synthesizeSpeech/, 'recorder must call TTS synthesis for AI speaking')
assert.match(recorder, /uni\.createInnerAudioContext/, 'recorder must play TTS audio via InnerAudioContext')
assert.match(recorder, /onUnmounted/, 'recorder must clean up audio context on unmount')
assert.match(recorder, /destroyAudioContext/, 'recorder must destroy audio context to avoid leaks')

// ===== PersonaIngredient.uvue:四操作、置信度、引用原文 =====
for (const action of ['confirm', 'reject', 'delete']) {
  assert.match(ingredient, new RegExp(`emit\\('${action}'`), `ingredient card must emit ${action}`)
}
assert.match(ingredient, /emit\('replace'/, 'ingredient card must emit replace')
assert.match(ingredient, /c >= 0\.85/, 'ingredient card must grade high confidence')
assert.match(ingredient, /c >= 0\.65/, 'ingredient card must grade medium confidence')
assert.match(ingredient, /source_quote/, 'ingredient card must show the AI source quote')
assert.match(ingredient, /确认这一笔/, 'ingredient card must confirm with 确认这一笔')
assert.match(ingredient, /把握/, 'ingredient card must label confidence as 把握, not 纯度')
assert.doesNotMatch(ingredient, /border-left/, 'ingredient card must not decorate with a colored border-left')

// ===== PersonaBatchSheet.uvue:诚实的历史版本展示 =====
assert.match(batchSheet, /不保留该稿的完整字段明细/, 'batch sheet must disclose that per-revision field details do not exist')
assert.match(batchSheet, /从这稿再写一版/, 'batch sheet must expose the restore action')
assert.match(batchSheet, /往稿/, 'batch sheet title must be 往稿')

// ===== 禁止调香室旧词回归(用户可见源码) =====
const copySurfaces = [
  ['my-portrait', page],
  ['PersonaIngredient', ingredient],
  ['PersonaBatchSheet', batchSheet]
]
const forbidden = ['调香室', '定香', '封瓶', '香笺', '配方', '熟成', '香料', '纯度', '调香师', '香评', '香氛', '那瓶香']
for (const [name, source] of copySurfaces) {
  for (const word of forbidden) {
    assert.doesNotMatch(source, new RegExp(word), `${name} must not keep forbidden copy ${word}`)
  }
}

// ===== 枚举契约:选项提交后端冻结值(single/integer),不是中文标签 =====
assert.match(api, /value:\s*'single'/, 'ENUM_OPTIONS marriage_status must use backend enum value single, not Chinese label')
assert.match(api, /value:\s*4/, 'ENUM_OPTIONS education_level must use integer value, not Chinese label')
assert.match(api, /value:\s*0/, 'ENUM_OPTIONS income_band must use integer value starting at 0')
assert.match(api, /interface EnumOption/, 'ENUM_OPTIONS must use typed EnumOption with label+value')
assert.match(page, /fieldAction\(fieldKey, 'replace', matchedValue/, 'enum fast-patch must submit the contract value (matchedValue), not the label')
assert.match(page, /subject\.value == 'personal' && fieldKey != '' && ENUM_FIELDS/, 'enum fast-patch must be gated to the personal subject (ideal_partner shapes differ)')

// ===== ensureSession STALE 重试必须有限(防 toast 轰炸与请求风暴) =====
assert.match(page, /MAX_STALE_RETRIES/, 'ensureSession STALE retry must have a bounded counter')
assert.match(page, /staleRetryCount > MAX_STALE_RETRIES/, 'ensureSession must stop retrying after exceeding MAX_STALE_RETRIES')

// ===== 轮询感知页面卸载:shouldContinue 回调使页面退出后立即停止循环 =====
assert.match(api, /shouldContinue/, 'poll functions must accept shouldContinue callback for abort-on-unmount')
assert.match(page, /\(\) => alive\)/, 'polling call sites must pass alive callback')

// ===== 叙事层按需拉取:进页不再预取,打开往稿时才读 =====
const initBlock = page.slice(page.indexOf('const init = async'), page.indexOf('onLoad((options: any)'))
assert.doesNotMatch(initBlock, /loadNarrative/, 'init must not pre-fetch narratives for the retired shelf')
const batchBlock = page.slice(page.indexOf('const openBatch'))
assert.match(batchBlock, /loadNarrative\(subject\.value\)/, '往稿 must load the narrative on demand')

	assert.doesNotMatch(page, /const pendingCount = computed/, 'unused pendingCount must stay deleted')

	console.log('ai profile ink-portrait contract passed')
