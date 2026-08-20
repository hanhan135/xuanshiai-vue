const fs = require('fs')
const path = require('path')
const assert = require('assert')

const root = path.join(__dirname, '..')
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8')

const api = read('api/ai-profile.uts')
const mock = read('mock/ai-profile.uts')
const page = read('pagesSub/profileExtra/my-portrait.uvue')
const recorder = read('components/VoiceRecorder.uvue')
const fieldCard = read('components/XsaPortraitField.uvue')
const apiIndex = read('api/index.uts')

// ===== api/ai-profile.uts:双路径、幂等、任务轮询、错误码 =====
assert.match(api, /if \(USE_MOCK\) return mock/, 'ai-profile api must route through mock when USE_MOCK is on')
assert.match(api, /Idempotency-Key/, 'ai-profile writes must carry idempotency keys')
assert.match(api, /genIdempotencyKey/, 'ai-profile must generate idempotency keys')
assert.match(api, /status == 'succeeded'/, 'task polling must handle the succeeded state')
assert.match(api, /status == 'failed'/, 'task polling must handle the failed state')
assert.match(api, /AI 处理超时/, 'task polling must surface a timeout message')
assert.match(api, /AI_FEATURE_DISABLED/, 'error mapping must cover feature-disabled')
assert.match(api, /AI_CONSENT_REQUIRED/, 'error mapping must cover consent-required')
assert.match(api, /DRAFT_VERSION_CONFLICT/, 'error mapping must cover draft version conflicts')
assert.match(api, /transcribeAudio/, 'voice transcription entry must exist')
assert.match(api, /mockTranscribe/, 'voice transcription keeps mock-backed path for USE_MOCK')
assert.match(api, /transcribeAudioReal/, 'voice transcription must provide a real ASR path')
assert.match(api, /\/voice\/transcribe/, 'real ASR path must POST to /voice/transcribe')
assert.match(api, /uploadAudioForTranscribe/, 'real ASR path must upload audio via uni.uploadFile')
assert.match(api, /result_payload/, 'real ASR polling must read transcript from result_payload')
assert.match(api, /synthesizeSpeech/, 'TTS synthesis entry must exist')
assert.match(api, /\/voice\/synthesize/, 'TTS synthesis must POST to /voice/synthesize')
assert.match(api, /resolveMediaUrl/, 'TTS synthesis must resolve the audio URL for playback')

// ===== mock/ai-profile.uts:导出、冲突与发布门槛 =====
assert.match(mock, /export function mockCreateProfileSession/, 'mock must provide session creation')
assert.match(mock, /export function mockSubmitProfileTurn/, 'mock must provide turn submission')
assert.match(mock, /export function mockPatchProfileDraft/, 'mock must provide draft patching')
assert.match(mock, /export function mockPublishProfileDraft/, 'mock must provide draft publishing')
assert.match(mock, /export function mockRestoreProfileRevision/, 'mock must provide revision restore')
assert.match(mock, /DRAFT_VERSION_CONFLICT/, 'mock must reject stale draft revisions')
assert.match(mock, /至少确认一个字段后才能发布/, 'mock must refuse publishing without a confirmed field')

// ===== 字段 key 三方对齐 =====
const labelKeys = new Set([...api.matchAll(/FIELD_KEY_LABELS\.set\('(\w+)'/g)].map(m => m[1]))
const questionKeys = new Set([...mock.matchAll(/QUESTION_BANK\.set\('(\w+)'/g)].map(m => m[1]))
const orderBlock = mock.match(/FIELD_ORDER:\s*string\[\]\s*=\s*\[([\s\S]*?)\]/)
assert.ok(orderBlock != null, 'mock must declare FIELD_ORDER as an array')
const orderKeys = new Set([...orderBlock[1].matchAll(/'(\w+)'/g)].map(m => m[1]))
const expected = ['age', 'city_code', 'marriage_status', 'education_level', 'height_cm',
  'income_band', 'occupation_group', 'interest_tags', 'lifestyle_tags', 'relationship_goal']
for (const key of expected) {
  assert.ok(labelKeys.has(key), `FIELD_KEY_LABELS must include ${key}`)
  assert.ok(questionKeys.has(key), `QUESTION_BANK must include ${key}`)
  assert.ok(orderKeys.has(key), `FIELD_ORDER must include ${key}`)
}
assert.strictEqual(labelKeys.size, expected.length, 'FIELD_KEY_LABELS must not carry extra keys')
assert.strictEqual(questionKeys.size, expected.length, 'QUESTION_BANK must not carry extra keys')
assert.strictEqual(orderKeys.size, expected.length, 'FIELD_ORDER must not carry extra keys')

// ===== my-portrait.uvue:组件导入、发布门槛、判空、双模式 =====
assert.match(page, /import XsaPortraitField from '@\/components\/XsaPortraitField\.uvue'/, 'portrait page must import the field card it renders')
assert.match(page, /import VoiceRecorder from '@\/components\/VoiceRecorder\.uvue'/, 'portrait page must import the voice recorder')
assert.doesNotMatch(page, /deleteAiProfile\s*,|deleteAiProfileField\s*,/, 'portrait page must not keep dead delete imports')
assert.match(page, /至少确认一个字段后才能发布/, 'portrait page must block publishing without confirmed fields')
assert.match(page, /if \(session\.value != null\)/, 'revision restore must guard against a missing session')
const restoreBlock = page.slice(page.indexOf('restoreProfileRevision(revisionId)'))
assert.ok(
  restoreBlock.indexOf('if (session.value != null)') < restoreBlock.indexOf('getProfileSession(String(session.value.session_id))'),
  'the null guard must wrap the session refresh after restore'
)
assert.match(page, /switchToText/, 'portrait page must support switching to text mode')
assert.match(page, /switchToVoice/, 'portrait page must support switching to voice mode')
assert.match(page, /restoreProfileRevision/, 'portrait page must support restoring a history revision')

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

// ===== XsaPortraitField.uvue:四操作、置信度、无装饰色条 =====
for (const action of ['confirm', 'edit', 'reject', 'delete']) {
  assert.match(fieldCard, new RegExp(`emit\\('${action}'`), `field card must emit ${action}`)
}
assert.match(fieldCard, /c >= 0\.85/, 'field card must grade high confidence')
assert.match(fieldCard, /c >= 0\.65/, 'field card must grade medium confidence')
assert.doesNotMatch(fieldCard, /border-left/, 'field card must not decorate with a colored border-left')

// ===== api/index.uts:画像模块整体导出 =====
assert.match(apiIndex, /from '\.\/ai-profile\.uts'/, 'api barrel must re-export the ai-profile module')

console.log('ai profile page contract passed')
