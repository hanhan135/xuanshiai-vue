const assert = require('assert')
const fs = require('fs')
const path = require('path')

const root = path.resolve(__dirname, '..')
const messagesPage = fs.readFileSync(path.join(root, 'pagesSub/community/paper-plane-messages.uvue'), 'utf8')
const chatPage = fs.readFileSync(path.join(root, 'pagesSub/chat/detail.uvue'), 'utf8')
const dedicatedChatPage = fs.readFileSync(path.join(root, 'pagesSub/community/paper-plane-chat.uvue'), 'utf8')
const communityApi = fs.readFileSync(path.join(root, 'api/community.uts'), 'utf8')

function includes(source, value, label) {
  assert.ok(source.includes(value), `${label} should include ${value}`)
}

includes(messagesPage, '/pagesSub/community/paper-plane-chat?conversationId=', 'paper-plane conversation navigation')
includes(messagesPage, '@click.stop="openPeerProfile(item)"', 'paper-plane peer profile avatar action')
includes(messagesPage, 'const openPeerProfile = (item: any)', 'paper-plane peer profile handler')
includes(messagesPage, "url: '/pagesSub/userExtra/user/detail?userId=' + item.userId", 'paper-plane peer profile navigation')
assert.ok(
  !messagesPage.includes("url: '/pagesSub/chat/detail?paperPlaneConversationId=' + item.id"),
  'paper-plane conversation should not navigate through ordinary chat detail'
)
assert.ok(!chatPage.includes('paperPlaneConversationId'), 'ordinary chat must not contain paper-plane mode')
assert.ok(!chatPage.includes('getPaperPlaneMessages'), 'ordinary chat must not load paper-plane messages')
assert.ok(!chatPage.includes('sendPaperPlaneMessage'), 'ordinary chat must not send paper-plane messages')
assert.ok(!chatPage.includes('readPaperPlaneConversation'), 'ordinary chat must not mark paper-plane conversations read')
includes(dedicatedChatPage, 'sendPaperPlaneMessage', 'dedicated paper-plane message sender')
includes(dedicatedChatPage, 'getPaperPlaneMessages', 'dedicated paper-plane message loader')
includes(dedicatedChatPage, 'readPaperPlaneConversation', 'dedicated paper-plane read marker')
includes(dedicatedChatPage, 'uploadCommunityMedia', 'paper-plane photo upload API')
includes(dedicatedChatPage, 'sendPaperPlaneMediaMessage', 'paper-plane photo message API')
assert.ok(
  !dedicatedChatPage.includes("uni.showToast({ title: '图片发送暂未开通'"),
  'paper-plane photo action must no longer report unavailable sending'
)
includes(dedicatedChatPage, 'createPaperPlaneContactExchange', 'paper-plane contact exchange create API')
includes(dedicatedChatPage, 'respondPaperPlaneContactExchange', 'paper-plane contact exchange response API')
assert.ok(
  !dedicatedChatPage.includes('暂未开通交换申请'),
  'paper-plane contact exchange must expose the dedicated request flow'
)
includes(communityApi, 'row.mine', 'paper-plane mine flag mapping')

console.log('纸飞机会话链路测试通过')
