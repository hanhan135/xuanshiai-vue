const assert = require('assert')
const fs = require('fs')
const path = require('path')

const root = path.resolve(__dirname, '..')
const page = fs.readFileSync(
  path.join(root, 'pagesSub/profileExtra/my-portrait-master.uvue'),
  'utf8'
)

assert.match(
  page,
  /buildPromptShown/,
  'build confirmation must be deduplicated per portrait subject'
)
assert.match(
  page,
  /maybePromptBuild\(subject:\s*ProfileSubject(?:,\s*inviteId:\s*string\s*=\s*['"]['"])?\)/,
  'master page must expose a subject-scoped build confirmation helper'
)
assert.match(
  page,
  /uni\.showModal\(/,
  'reaching the build gate must ask the user before opening a preview'
)
assert.match(
  page,
  /confirmText:\s*['"]现在构建['"]/
)

assert.doesNotMatch(
  page,
  /onPublishReady:|gateBySubject\(|hardGateMet/,
  'only a durable build_invite may open the formal build prompt'
)

const inviteStart = page.indexOf('onBuildInvite:')
const inviteEnd = page.indexOf('onBuildInviteResolved:', inviteStart)
assert.ok(inviteStart >= 0 && inviteEnd > inviteStart, 'build invite callback not found')
const inviteCallback = page.slice(inviteStart, inviteEnd)
assert.match(
  inviteCallback,
  /maybePromptBuild\(invite\.subject,\s*String\(invite\.invite_id/,
  'threshold invite must trigger the same explicit build prompt'
)
assert.match(
  page,
  /ws\.acceptBuildInvite\(subject,\s*inviteId\)/,
  'confirming a journey invite must accept it before opening a draft'
)
assert.match(
  inviteCallback,
  /bucket\.journeyStage\s*=\s*invite\.journey_stage/,
  'invite delivery must sync the authoritative building stage for the fallback card'
)
assert.match(
  page,
  /journeyStage == 'building' && inviteId != ''[\s\S]{0,220}maybePromptBuild\(subject, inviteId\)/,
  'a restored pending invite must prompt after the journey socket is ready'
)
assert.match(
  page,
  /onSubjectChanged:[\s\S]{0,900}summary\.journeyStage == 'building' && inviteId != ''[\s\S]{0,180}maybePromptBuild\(subject, inviteId\)/,
  'a background subject invite must prompt when the user switches back to it'
)

const promptStart = page.indexOf('function maybePromptBuild')
const promptEnd = page.indexOf('\n}\n', promptStart) + 3
assert.ok(promptStart >= 0 && promptEnd > promptStart, 'build prompt helper not found')
const prompt = page.slice(promptStart, promptEnd)
assert.match(prompt, /res\.confirm[\s\S]{0,400}ws\.acceptBuildInvite\(subject, inviteId\)/)
assert.doesNotMatch(prompt, /goPortrait\(\)/)
assert.doesNotMatch(prompt, /publishProfileDraft|confirmPortraitNarrative/)

console.log('PASS moxiang build confirmation contract')
