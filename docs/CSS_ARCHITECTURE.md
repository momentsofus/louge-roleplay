# 样式架构说明

楼阁样式采用“源码入口 + 构建产物”的方式维护：

```text
public/styles/site-pages.src.css
  -> npm run build:css
  -> public/styles/site-pages.css
```

运行时模板只加载 `public/styles/site-pages.css`。请不要直接手改生成后的 `site-pages.css`；应修改 `site-pages.src.css` 引入的模块文件，再运行 `npm run build:css`。

## 目录结构

```text
public/styles/
├── README.md
├── shared-feedback.css              # 登录/错误/消息反馈等独立反馈页
├── site-pages.src.css               # 源码入口：维护 @import 顺序
├── site-pages.css                   # 构建产物：扁平 CSS bundle，运行时加载
└── site-pages/
    ├── 00-core.css                  # 变量、基础元素、导航、通用组件
    ├── 01-typography.css            # 字体与基础排版
    ├── 10-home.css / 11-home-polish.css
    ├── 12-public-characters.css
    ├── 20-admin.css                 # 后台样式聚合入口
    ├── admin/                       # 后台列表、表单、配置、审计、用户权限等
    ├── 25-notifications.css         # 通知样式聚合入口
    ├── notifications/               # 通知弹窗、toast/banner、后台通知、客服、站内信、Markdown
    ├── 26-admin-import.css
    ├── 27-tags.css
    ├── 30-character-editor.css / 31-character-polish.css
    ├── 40-dashboard.css / 41-dashboard-polish.css / 42-dashboard-sections.css / 43-dashboard-responsive.css
    ├── 50-chat.css / 51-chat-polish.css / 52-rich-content.css / 53-mobile-chat.css
    ├── chat-polish/                 # 聊天视觉增强拆分模块
    ├── 60-auth.css / 61-register.css
    ├── 70-shared-utilities.css
    ├── 80-chat-polish.css
    ├── 90-profile.css / 91-profile-polish.css
    ├── 95-polish.css
    └── 96-warm-deepspace-ui.css     # 楼阁 Quiet Luxury 全站主题覆盖层
```

## import 顺序

`site-pages.src.css` 的顺序就是最终层叠顺序：

1. core / typography。
2. 页面基础模块。
3. 页面 polish / responsive。
4. 富文本和工具类。
5. profile / polish。
6. `96-warm-deepspace-ui.css` 全站主题收口。

如果出现样式冲突，先检查 import 顺序和是否有旧 polish 覆盖，不要一上来堆高选择器权重。

## 新增样式放哪里

| 场景 | 推荐位置 |
|---|---|
| 全局变量、基础 reset、通用卡片/按钮 | `00-core.css` |
| 首页 | `10-home.css` / `11-home-polish.css` |
| 公共角色大厅/详情 | `12-public-characters.css` |
| 后台页面 | `20-admin.css` 或 `site-pages/admin/` |
| Tavern 导入后台 | `26-admin-import.css` |
| 标签 chip / 标签输入 | `27-tags.css` |
| 角色创建/编辑 | `30-character-editor.css` / `31-character-polish.css` |
| 控制台 | `40-dashboard*` |
| 聊天基础布局 | `50-chat.css` |
| 聊天富文本 | `52-rich-content.css` |
| 移动端聊天 | `53-mobile-chat.css` |
| 通知/客服/站内信 | `25-notifications.css` 或 `site-pages/notifications/` |
| 极少量跨页面工具类 | `70-shared-utilities.css` |
| 全站主题覆盖 | `96-warm-deepspace-ui.css`，谨慎追加 |

## 维护原则

- 改源码模块，不直接改构建产物。
- 不轻易改模板类名；如需改，先 grep 全局调用。
- 新增聚合入口时，确保 `scripts/build-css.js` 能递归展开。
- 大块功能优先拆目录，不继续堆到单文件。
- 视觉重构和结构拆分尽量分开提交。

## 验证

```bash
npm run build:css
git diff --check
npm run smoke:test
```

涉及关键页面时人工检查：

- 首页。
- 公共角色大厅/详情。
- 聊天页和富文本消息。
- 控制台。
- 后台列表/表单。
- 通知弹窗、toast、banner 和客服入口。
