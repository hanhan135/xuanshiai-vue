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

console.log('Matchmaker workspace real-service checks')

const api = read('api/matchmaker.uts')
for (const endpoint of [
  '/matchmaker/management-center/access',
  '/matchmaker/management-center/dashboard',
  '/matchmaker/workbench/members',
  '/matchmaker/partner-center',
  '/matchmaker/promoter-center'
]) expect(api, endpoint, `workspace endpoint ${endpoint}`)
for (const legacy of [
  'MATCHMAKER_MANAGEMENT_CENTER_USE_MOCK',
  'PARTNER_CENTER_USE_MOCK',
  'PROMOTER_CENTER_USE_MOCK',
  'mockMatchmakerManagementCenter',
  'mockPartnerCenterSnapshot',
  'mockPromoterCenterSnapshot'
]) expectAbsent(api, legacy, `${legacy} removed`)

const accessPage = read('pagesSub/matchmaker/become-matchmaker.uvue')
expect(accessPage, 'getMatchmakerManagementCenterAccess', 'entry loads access state')
expect(accessPage, 'getMatchmakerManagementCenterSnapshot', 'entry loads dashboard snapshot')
expect(accessPage, '<MatchmakerPendingReview', 'pending review workbench mounted')
expectAbsent(accessPage, '完成服务开通付款', 'payment is not an entry gate')

const review = read('components/MatchmakerPendingReview.uvue')
for (const apiName of [
  'getMatchmakerReviewMembers',
  'updateMatchmakerReviewMember',
  'getMatchmakerMemberFollowUps',
  'getMatchmakerMemberContact',
  'getMatchmakerMemberMatchCandidates',
  'getMatchmakerMemberMatchHistory'
]) expect(review, apiName, `pending review uses ${apiName}`)
expect(review, '不会修改实名认证或学历认证', 'review boundary copy')
expectAbsent(review, 'pendingReviewProfiles', 'no local review fixture')

const partner = read('pagesSub/matchmaker/partner-center.uvue')
expect(partner, 'getPartnerCenterSnapshot', 'partner page loads server snapshot')
expect(partner, 'createPartnerTeamInvite', 'partner page creates server invite')
const promoter = read('pagesSub/matchmaker/promoter-center.uvue')
expect(promoter, 'getPromoterCenterSnapshot', 'promoter page loads server snapshot')
expect(promoter, 'addPromoterLead', 'promoter page creates server lead')
expect(promoter, 'createPromoterPromotionCode', 'promoter page creates server promotion code')

console.log('Matchmaker workspace real-service checks passed')
