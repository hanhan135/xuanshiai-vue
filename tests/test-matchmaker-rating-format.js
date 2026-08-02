const fs = require('fs')
const path = require('path')

const root = path.join(__dirname, '..')

function read(file) {
  return fs.readFileSync(path.join(root, file), 'utf8')
}

function expectAbsent(content, fragment, label) {
	if (content.includes(fragment)) {
		throw new Error(`${label}: found ${fragment}`)
	}
	console.log(`PASS ${label}`)
}

console.log('Matchmaker rating removal checks')

const card = read('components/MatchmakerCard.uvue')
expectAbsent(card, 'rating', 'service card has no rating UI')

const ranking = read('components/MatchmakerRank.uvue')
expectAbsent(ranking, 'rating', 'ranking has no rating UI')

const detail = read('pages/matchmaker/detail.uvue')
expectAbsent(detail, 'rating', 'detail has no rating UI')
expectAbsent(detail, '好评率', 'detail has no favorable-rate UI')

console.log('Matchmaker rating removal checks passed')
