const assert = require('assert')
const fs = require('fs')
const path = require('path')

const source = fs.readFileSync(path.join(__dirname, '..', 'pagesSub/profileExtra/my-tasks.uvue'), 'utf8')
const checks = [
  ['uses the daily draw heading', source.includes('每日抽签')],
  ['renders the selected blessing card', source.includes('daily-draw-card') && source.includes('DAILY BLESSING')],
  ['shows the completed blessing state', source.includes('今日祝福已收下 · 积分 +10')],
  ['draw updates the daily reward', source.includes('const drawCheckIn') && source.includes("title: '抽签成功，积分 +10'")],
  ['removes prototype switching and calendar UI', !source.includes('drawPrototype') && !source.includes('calendar-row')],
  ['uses native mini-program top-right chrome', !source.includes('top-actions') && !source.includes('top-dot')],
  ['gives the blessing card more height', source.includes('min-height: 260rpx')]
]

let failed = 0
checks.forEach(([name, passed]) => {
  try {
    assert.strictEqual(passed, true)
    console.log(`✅ ${name}`)
  } catch (error) {
    failed += 1
    console.log(`❌ ${name}`)
  }
})

if (failed > 0) process.exit(1)
console.log('每日抽签静态校验全部通过')
