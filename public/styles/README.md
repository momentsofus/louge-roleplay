# site-pages.css 样式拆分说明

楼阁样式当前采用源码入口 + 构建产物模式：

```text
public/styles/site-pages.src.css
  -> npm run build:css
  -> public/styles/site-pages.css
```

运行时模板只引用：

```html
<link rel="stylesheet" href="/public/styles/site-pages.css" />
```

维护时请修改 `site-pages.src.css` 引入的模块文件，然后运行 `npm run build:css`。不要直接手改生成后的 `site-pages.css`。

## 主要目录

```text
public/styles/
├── site-pages.src.css          # 源码入口，维护 @import 顺序
├── site-pages.css              # 生成后的扁平 bundle，运行时加载
├── shared-feedback.css         # 登录/错误/消息反馈页独立样式
└── site-pages/
    ├── 00-core.css             # 变量、基础元素、导航、通用卡片、按钮
    ├── 01-typography.css       # 字体与基础排版
    ├── 10-home.css             # 首页基础
    ├── 11-home-polish.css      # 首页视觉增强
    ├── 12-public-characters.css# 公共角色大厅/详情
    ├── 20-admin.css            # 后台样式聚合入口
    ├── admin/                  # 后台细分样式
    ├── 25-notifications.css    # 通知/客服/站内信聚合入口
    ├── notifications/          # 通知弹窗、toast/banner、后台通知、客服、站内信、Markdown
    ├── 26-admin-import.css     # 酒馆卡导入后台
    ├── 27-tags.css             # 标签 chip / 标签输入
    ├── 30-character-editor.css # 角色创建/编辑
    ├── 40-dashboard*.css       # 控制台
    ├── 50-chat.css             # 聊天基础布局
    ├── 51-chat-polish.css      # 聊天视觉增强聚合
    ├── chat-polish/            # 聊天视觉增强拆分模块
    ├── 52-rich-content.css     # 聊天富文本
    ├── 53-mobile-chat.css      # 移动端聊天
    ├── 60-auth.css             # 认证相关
    ├── 61-register.css         # 注册页
    ├── 70-shared-utilities.css # 少量跨页面工具类
    ├── 90-profile*.css         # 个人资料页
    ├── 95-polish.css           # 历史 polish 收口
    └── 96-warm-deepspace-ui.css# 楼阁 Quiet Luxury 全站主题层
```

## 维护约定

1. `site-pages.src.css` 的 import 顺序就是最终层叠顺序。
2. 新增功能样式优先放到对应页面/功能模块。
3. 只有设计变量、reset、明确跨页面的基础块才放进 `00-core.css`。
4. 通知、后台、聊天 polish 这类大块功能优先拆子目录。
5. 样式结构拆分和视觉重构尽量分开提交，方便回滚。
6. 如果出现覆盖异常，先查 import 顺序和旧 polish/主题层，不要急着堆选择器权重。

## 验证

```bash
npm run build:css
git diff --check
npm run smoke:test
```

更完整说明见：`docs/CSS_ARCHITECTURE.md`。
