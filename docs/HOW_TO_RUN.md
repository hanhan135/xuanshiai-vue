# 运行与关键流程验证

> 更新日期：2026-09-01。请在 `xuanshiai-vue` 项目根目录运行命令。

## 环境

- Node.js 与 npm：安装依赖、执行结构检查。
- HBuilderX：`.uvue` 和 `.uts` 的首选编译入口。
- 微信开发者工具：小程序端关键路径验收入口。

安装依赖：

```bash
npm install
```

不要升级依赖大版本，也不要为命令行构建改写 `manifest.json` 或 `pages.json`。

## 当前演示配置

- `api/config.uts` 默认 `USE_MOCK = false`；普通用户业务保持真实接口策略。
- 父母端由 `api/parent.uts` 的 `PARENT_USE_MOCK = true` 独立驱动。
- 演示登录只创建本地演示会话，不会提交真实 token、账号或子女关系数据。
- 父母端 Mock 仅用于前端流程核验，不代表真实认证、父母/子女授权、照片隐私或消息服务已完成后端联调。

## HBuilderX 与微信小程序

1. 在 HBuilderX 中打开本项目根目录。
2. 选择“运行到小程序模拟器 → 微信开发者工具”。
3. 编译后在微信开发者工具导入 `unpackage/dist/dev/mp-weixin`。
4. 每次修改 `.uvue` 或 `.uts` 后，重新编译并刷新模拟器。

H5 只用于快速预览和冒烟检查，不能替代微信小程序验收。当前根目录式工程的 npm CLI 不能作为端侧编译结论。

## 父母端关键流程

1. 在登录页勾选协议后，选择“演示登录，选择身份”。
2. 在身份引导中选择父母身份，进入 `/pages/parent/parent`。
3. 首页确认只展示一名已授权子女、资料摘要、推荐资料和私有喜欢列表。
4. 牵线页确认可查看红娘与私人定制顾问，但没有支付入口。
5. 消息页确认复用统一消息中心，聊天只能在双方同意后开放。
6. 候选详情确认清晰照片只在子女允许时显示，且没有联系方式交换入口。

父母实名、子女授权、聊天双向同意和照片隐私是安全边界，不得用演示配置绕过。

## 本地结构检查

```bash
node tests/test-mock-system.js
node tests/test-parent-slice.js
node tests/test-parent-chat-subject.js
git diff --check
```

完成 HBuilderX 编译后，可运行 `npm run verify:mp:dev` 检查小程序产物的页面声明、包体与懒加载配置。该检查脚本为项目自包含实现；只有在产物来自本次编译时，其结论才有意义。

## 常见问题

- `npm run build:mp-weixin` 提示找不到 `uni`：先执行 `npm install` 以安装项目依赖；仍不能编译时，改用 HBuilderX。
- 页面空白：先读取 HBuilderX 或微信开发者工具中的第一条错误。
- Mock 数据未出现：确认页面通过 `@/api` 调用，并检查全局与模块级 Mock 开关。
- 父母端被拦截：从登录页建立演示会话，并检查父母身份和子女授权状态；不要直接清空本地授权状态后跳转页面。
