# 当前工程状态与已知差异

> 更新日期：2026-08-27
> 用途：防止文档把占位实现、Mock 或历史配置描述成已完成生产能力。

## 服务红娘管理中心（2026-08-30，首页框架已重做）

- **范围：** 在“我要做红娘”页面保留总店红娘工作台入口及已付款、账号已激活的访问门禁。本期只实现参考图中的首页结构：欢迎区、8 项门店数据简报、5 个快捷入口、推广工具、10 个功能入口和退出登录。
- **当前实现：** `MatchmakerManagementCenter` 仅提供字段骨架。所有未接入指标统一显示 `--`，不渲染 Mock 用户、会员、审核记录、金额、数量或明细页；接口契约见 [`服务红娘管理中心框架开发文档.md`](./服务红娘管理中心框架开发文档.md)。
- **未完成：** 测试服尚未实现管理中心访问与首页接口。审核、资料编辑、联系方式、弃海、牵线约见、分成结算、推广生成和各入口业务页均未接入，不能视为生产可用。

## 当前验收记录（2026-07-30）

- **微信 AppID：** `wxb5f4e639f4eb2591`，已写入 `manifest.json`、`project.config.json` 和最新 `mp-weixin` 产物。
- **HBuilderX：** `5.15.2026070915` 已成功编译 `mp-weixin`；产物目录为 `unpackage/dist/dev/mp-weixin`，微信开发者工具已打开该目录。
- **微信端冷启动：** 清理模拟器缓存后，欢迎页协议、调试登录、首页到社区均通过；短信发送 `202`、手机号登录 `200`。
- **社区真实接口：** 本地 FastAPI（当时 `http://127.0.0.1:8000`，现仓库默认已切到测试服务器 `https://xhztest.xyz`）的动态、筛选、话题、活动、Banner、通知、纸飞机、配额、详情/评论矩阵通过；数据来自后端 `seed_community_demo.py`，没有新增前端虚拟数据。
- **社区子页面：** 话题列表、活动列表、纸飞机、社区通知均已在 DevTools 打开并有真实数据；通知种子已绑定当前调试账号 `17870810285`。
- **控制台：** 未发现新的 `error`、`exception` 或 `failed`；仅有微信基础库 `wx.getSystemInfoSync` 弃用警告。
- **包体门禁：** `npm run verify:mp` 通过；主包 `1,980,849` bytes，6 个分包均低于 2 MiB，媒体超限 `0`，`lazyCodeLoading=requiredComponents`。
- **边界：** 这是本地 DevTools 模拟器验证，不等于正式发布、真机验收或生产 HTTPS 合法域名验收。

## 近期合入（2026-07-26 ~ 2026-07-27）

- **PR #3（tongouo）：** 纸飞机页面精调 — 纸飞机工作台 UI、底部 dock、消息列表页、聊天 80 积分解锁、脱单纸飞机页面
- **PR #4（tongouo）：** 纸飞机轮播卡片、纸飞机身份（头像/昵称）、获取纸飞机次数（50 积分）
- **PR #5（lilizh514）：** 消息和聊天页面增强 — 引用消息、多选删除、单条删除、撤回、复制、联系方式交换、消息页布局优化、会话工具（utils/conversation.uts）

## 后端对接状态（2026-07-27）

- **USE_MOCK = false**，已连接后端 FastAPI（当前 `API_BASE_URL` 指向测试服务器 `https://xhztest.xyz`）
- 纸飞机核心接口（发送、获取、回复、会话列表、消息、已读）均已对接后端
- 纸飞机获取次数（`purchasePaperPlaneChance`）后端暂未实现，仍使用本地 Mock（`PAPER_PLANE_CHANCE_USE_MOCK = true`）

## 媒体与互动扩展（2026-07-26）

- 已补：评论点赞、纸飞机语音上传播放、纸飞机回复转匿名会话（页内面板）。
- 真实私信仍仅申请同意后开启；消息 Tab 的 /chat/sessions 联调不在本次。

## M04 AI 画像（2026-08-20，前端已实现）

- **范围：** 对话式建构「关于我 / 关于对方」画像。新增 `api/ai-profile.uts`（会话 / 草稿 / 发布 / 历史 / 任务轮询 / 语音转写，含幂等键与错误码映射）、`mock/ai-profile.uts`（字段抽取、版本冲突、任务轮询模拟）、页面 `pagesSub/profileExtra/my-portrait.uvue`、组件 `XsaPortraitField` / `VoiceRecorder` / `VoiceWaveform`；`pages/profile/profile.uvue` 画像入口已从占位 Toast 改为 `navigateTo`。
- **验证：** `node tests/test-ai-profile-page.js`、`node tests/test-mock-system.js`、`node tests/test-activity-detail-page.js`、`node tests/test-community-test-filters.js` 均 exit 0；`git diff --check` 通过。`npm run verify:mp` 因技能脚本 `debug-wechat-build-artifacts` 在本机缺失无法运行（环境问题，非本次改动），手工等价检查现有产物：`lazyCodeLoading=requiredComponents`、主包 ~416KB、`pagesSub` ~1.5MB、`my-portrait` 页面文件与 `app.json` 声明交叉验证通过。HBuilderX 重编译 + 微信开发者工具回归尚未执行（HBuilderX 安装未定位）。
- **后置：** 真实 ASR 接入、后端 `/ai/*` 接口联调、67% 提前建构、暂停 / 恢复 / 重新开始、画像更新触发用心度与搜索重算。
- **API_BASE_URL：** 仓库当前 `api/config.uts` 为测试服务器 `https://xhztest.xyz`（`USE_MOCK = false`）。本机 FastAPI `http://127.0.0.1:8000` 仅作可选本地联调，不作为仓库默认。

## 1. 当前可确认的工程事实

- 技术栈：UniApp / Vue 3，页面和组件以 `.uvue` 为主，逻辑以 `.uts` 为主。
- 主目标端：微信小程序；H5 用于快速调试。
- `pages.json` 当前登记主包 7 页 + 分包 50 页，共 57 个页面；五个 Tab 为 **首页 / 牵线 / 社区 / 消息 / 我的**（`XsaTabBar` 文案与定版一致；`pages.json` tabBar 第二项文本仍为「红娘服务」，属受保护配置，未擅自改名）。
- 社区闭环子路由（`pages.json` 已登记）：话题列表/详情、动态详情、活动列表/详情/我的活动、纸飞机、社区通知、发布。
- 社区主 Tab：**关注 / 同城 / 发现**；二级筛选随主 Tab 切换：
  - 关注：`全部 / 关注 / 喜欢`（喜欢 = 用户级喜欢关系，不是帖子点赞）
  - 同城：`全部 / 热门 / 最新`
  - 发现：`全部 / MBTI / 校友 / 同乡`（TOPIC 面板仅在「发现·全部」）
- 已有 `Xsa*` 组件含 `XsaDynamicCard`、`XsaApplySheet`、`XsaReportSheet` 等；实名门槛见 `utils/realNameGate.uts`（`passed|missing|reviewing|rejected`，兼容 pending/failed）。
- 认证门槛：常规社区互动、申请认识、参与话题 / 带话题发布均仅要求实名通过；双重认证仅作展示加分。
- 已有 `api/` 与 `mock/` 分层；**社区 API 已支持 Mock / FastAPI 双路径**（`config.uts` + `request.uts` HTTP Bearer + `community.uts` map*）。当前社区 1.0 验收配置为 `USE_MOCK = false`；需要纯结构预览时才临时切回 `true`。
- 申请认识：`applyToMeet` Mock 幂等（重复申请 `success:false`）；**真路径** `POST /discovery/applications/{id}` + 刷新 quotas；409 → failRes。喜欢用户：`likeUser` 真路径 `PUT|DELETE /users/{id}/like`，likes 列表 `page_size≤50` 分页预检。
- 社区 API 另导出：删帖/删评/取关/我的纸飞机；关注 Tab「全部」真路径 **`mode=following_and_liked`**（关注∪用户级喜欢，BE 分页；原客户端假并集已撤）。
- **联调总账：** [`COMMUNITY_HTTP_CHANGELOG.md`](./COMMUNITY_HTTP_CHANGELOG.md)。
- 2026-07-24：社区动态卡字段密度、发布页话题/声明/视频/表情、通知三栏已按设计实现（Mock + 页面渐进增强）；真机视频上传与 COS 仍属二期。
- 用户肖像资源位于 `static/portraits/`。
- 历史 HTML 参考已冻结，不再作为实现主线。

## 2. 运行与构建状态

- 2026-07-24 结构验证：`node tests/test-mock-system.js` 与 `node tests/test-community-flow.js` 均 exit 0；`git diff --check` 无错误（仅有 CRLF 提示）。工作区根目录 graphify 见 `../graphify-out/`（本项目目录内无独立 `graphify-out/`）。
- **HBuilderX 端侧编译：** 2026-07-25 关 Mock 后以 CLI `launch mp-weixin --compile true` 重新生成 `unpackage/dist/dev/mp-weixin`（产物 HTTP-only）；微信开发者工具已打开该目录。H5 冒烟预览端口为本机 `http://localhost:8080`（`:5173` 不是本工程 UI）。
- **社区列表曾报“网络异常”：** 根因不是真实网络失败，而是 UTS 编译对象属性简写时丢掉局部变量（`normalizeListQuery` 返回 `{ tab }` 被编成裸 `tab` → ReferenceError → 页面 catch 文案）。源码已改为 `resolveTabValue` + 显式 `tab: tabName` 等属性名；产物中可见 `tab: tabName_1`。同类对象简写在 `.uts` 中应避免。
- npm CLI 当前未通过：默认会读取不存在的 `src/manifest.json`；手动指定项目根目录后，又会在解析 `App.uvue` 时失败。`npm run build:mp-weixin` / `dev:mp-weixin` 不能作为端侧验收结论。
- 因此当前应以 HBuilderX 作为端侧编译入口，并分别在浏览器和微信开发者工具验证；旧 `unpackage` 不能代替本次重新编译。
- 不得通过移动受保护配置、复制双份 `manifest.json` / `pages.json` 或批量改写 `.uvue` 来隐藏该架构差异。
- **微信 AppID 历史记录：** 2026-07-27 以前曾使用 `touristappid`/空 AppID；该状态已由当前授权 AppID `wxb5f4e639f4eb2591` 替换，验收以最新 HBuilderX 产物为准。
- **社区门槛（实现覆盖）：** 浏览无需认证；互动与申请认识仅 `realNameStatus === 'passed'`；学历只展示不拦截；举报/拉黑无门槛。

## 3. 页面成熟度说明

路由存在不等于功能已经生产就绪。当前登录、注册、发布、编辑资料、认证、会员、设置等页面仍可能包含静态展示或占位交互；验收时必须以实际代码和定版 PRD 为准。

聊天详情页已经存在，但产品规则仍是“先申请认识、双方同意后再建立沟通”。不得把现有页面理解为允许陌生人直接私信。

## 4. 当前后端 / 联调状态

- `api/request.uts`：`USE_MOCK=true` 走 mock；`false` 走 FastAPI HTTP（Bearer）。不再按 `useHttp` 回退 uniCloud。
- 仓库默认 `API_BASE_URL=https://xhztest.xyz`（测试服务器；本地联调可临时改为 `http://127.0.0.1:8000` 或局域网 IP）；token 存 `xsa_access_token`。
- 社区模块主链路与旁路（like/apply）**适配器 + 审查 P0 缺陷已修**。
- **2026-07-25 本地 HTTP 冒烟（A1–A4/B1 核心）已过：** quotas 200、like 可取消、`page_size` 50/100 契约、互喜欢无 `chat_session`、apply remain−1 + 409、accept 才建会话；记录见 changelog「实际测试」。环境：MySQL + Docker Redis + `SMS_PROVIDER=mock`。
- **关 Mock 端侧联调（本地模拟器已验证）：** 本地使用 `USE_MOCK=false`、`API_BASE_URL=http://127.0.0.1:8000`（现已切到测试服务器 `https://xhztest.xyz`）；登录页调试登录使用 `17870810285`/`123456`；HBuilderX 5.15 编译成功，微信开发者工具已打开并完成社区路径回归。物理手机、正式登录、正式 HTTPS 合法域名仍不在本次范围。
- 实测顺带修：BE `discovery._viewer_context` 缺 `user_auth` JOIN（R-T1）；社区 feed `up.school` → `ua.school`（R-T2）。
- 物理手机扫码预览、正式发布配置和阶段 C 仍开放；本地 DevTools 通过不能替代生产验收。
- BE：`set_like` 不再互喜欢建会话（对齐先申请再聊）；quotas VIP 用 `end_at`；额度 Redis 键 UTC 统一。
- **同城城市（2026-07-25 续）：** 独立偏好 `community_city_*`（**不写** residence）；一周限改 429；`mode=city` **只按** 帖子 `p.location`；锚点请求→偏好→现居回落；未设城 FE CTA「选择城市」。Live：`tests/live/test_community_city_http.py`。详见 changelog「同城偏好独立 + location-only + 一周限改」。
- Mock 应按模块逐步退役，不删除作为契约样例的有效数据；当前社区联调保持 `USE_MOCK = false`，其它尚未接入真实后端的模块仍按模块保留 Mock。
- 仍后置：消息页 applications 真路径、聊天 sessions FE、纸飞机 reply 幂等、区级筛选/完整 regions 选择器、自动化 E2E 入库；见 changelog deferred。

## 5. 配置与产品边界差异

以下是现有配置中的历史或预留项，不代表已批准产品能力：

- `manifest.json` 包含定位、麦克风等 App 权限描述。
- 权限文案提到“附近推荐”“语音聊天和视频通话”，与当前认真婚恋、申请认识优先的产品边界并不完全一致。
- `manifest.json` 引用 `static/logo.png`；该文件目前存在于仓库，不代表已完成正式品牌定稿。

这些内容属于受保护配置，本文只记录差异；修改前需明确授权并同步产品、设计与隐私说明。

## 6. 设计实现差异

- `DESIGN.md` 现役圆角等级含 4 / 6 / 8 / 9 / 12 / 16 / 999px。
- `uni.scss` 可能仍残留旧工具类；新页面遵循 `DESIGN.md`，不要继续复制未评审色值或旧圆角。
- 全局 Token 的统一修改需要设计评审。
- `pages.json` 只能使用平台支持的静态色值，不能直接引用 CSS 变量；其中颜色应视为平台配置映射，而非新增设计 Token。
- **Token 运行时（2026-07-22 方案 A）**：语义名不变；色值为 hex/rgba。全局注入在 `App.uvue` 的 `page { --token }`（进入微信 `app.wxss`），并与 `uni.scss` 对齐。业务继续用 `var(--token)`，禁止 `oklch()` 与页面散落字面色。
- 历史产物 `unpackage/dist/dev/mp-weixin` 在未重新编译前可能仍是旧样式；验收以 HBuilderX 重新运行到微信开发者工具后的结果为准。

## 7. 当前需求依据

定版产品定义以工作区根 `../PRODUCT.md` 为唯一权威；本目录 `PRODUCT.md` 仅为受控实现镜像。裁决优先级：

1. **用户本次明确授权**
2. **`../PRODUCT.md`：** 产品定位、原则、边界与当前基线
3. **`AGENTS.md` 硬约束**
4. **`../DESIGN.md`**（视觉权威）与当前代码 / Mock 状态；本地 `DESIGN.md` 仅为实现镜像

注意：

- 最终版页面/大纲正文可能仍含导图残留（VIP 锁定、爆灯存疑、会员开通等），**不得按残留旧句实现**。
- 根目录过渡文档、`ref-*`、历史 XMind 源文件与已废弃路径（`xmind-*`、`design-demos`）不作为生产需求源。
- 当前代码中的会员开通页、认证项列表等可能与决策层不一致；验收以决策层 + 实际代码对照为准，并逐步收敛。





