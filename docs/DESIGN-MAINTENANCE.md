# Design and maintenance guide

这份文档记录本站的设计约定、配置入口和内容工作流。它面向未来维护，不替代项目根目录的 README。

设计组织方式将稳定的设计 token、站点数据、页面文案和内容 schema 分开维护。本项目是静态个人站，不引入管理后台或运行时 JSON 设置层，避免为少量配置增加不必要复杂度。

## 1. 文件职责

| 文件 | 维护内容 |
| --- | --- |
| `src/styles/tokens.css` | 浅色／深色颜色、字体语义、核心布局宽度、跨组件间距 |
| `src/styles/fonts.css` | 自托管字体的 `@font-face` 声明和字符子集 |
| `src/styles/global.css` | 组件外观、文章排版、响应式规则和动画 |
| `src/config.ts` | 双语站点信息、社媒和 Gravatar 配置 |
| `src/config/theme.ts` | 主题选项的值、图标和短文案 key |
| `src/i18n/config.ts` | 支持语言、默认语言、URL 前缀与 Intl/HTML locale 映射 |
| `src/i18n/ui.ts` | 类型安全的中英文短 UI 文案与路径本地化 helper |
| `src/content.config.ts` | note、project 与 page frontmatter 字段和校验规则 |
| `src/lib/posts.ts` | 按语言查询 note、翻译配对、静态路径、canonical URL 与正文摘要 |
| `src/lib/projects.ts` | 按语言读取并排序 project 内容 |
| `src/content/projects/` | 中英文 project Markdown 内容 |
| `src/content/pages/<page-key>/` | 必须双语的 About、Friends 等页面级 Markdown 与 assets |
| `scripts/new-content.mjs` | 创建中英文 post／project 草稿的本地脚手架 |
| `src/components/pages/` | Home、Archive、Projects、About、404、Post 的共享页面结构 |
| `src/components/PostList.astro` | 首页文章列表，以及日期与 tags 的同行展示 |
| `src/markdown/remark-extensions.mjs` | `[!NOTE]` alert 和 `==spoiler==` 扩展 |
| `src/markdown/shiki-toolbar.mjs` | 构建期代码块工具栏、语言标识和复制按钮结构 |
| `src/markdown/lang-icons.mjs` | 代码语言到 Iconify 图标的映射与 SVG 输出 |
| `src/config/code-block.json` | 可维护的代码语言别名、显示名称和图标配置 |
| `src/pages/posts/[...id].astro` | 文章详情、TOC、阅读统计、代码复制、相邻文章 |

## 2. 设计 tokens

颜色和跨组件尺寸统一在 `src/styles/tokens.css` 中修改。

### 颜色

- `--bg`：页面背景。当前浅色模式为纯白 `#ffffff`，深色模式为炭黑。
- `--surface` / `--surface-solid`：半透明与实体表面。
- `--text` / `--muted` / `--faint`：正文、次要信息、弱信息。
- `--line`：中性分隔线。
- `--accent-strong`：普鲁士蓝主色，页面标题和明确状态。
- `--accent`：较明亮的交互蓝。
- `--link`：正文链接，必须在浅色和深色模式中保持足够对比。
- `--accent-soft` / `--accent-line`：淡蓝背景和边界。
- `--hover`：控件和主题菜单使用的中性 hover 表面。
- `--card-hover`：post、project、archive 卡片的中性灰 hover 表面。
- `--view-all-hover`：首页“查看全部”的独立灰色 hover 表面，不使用深色阴影或边框。
- `--warm` / `--warm-soft`：次级标签色。浅色模式使用低饱和蓝灰，用于 tags、项目编号、项目状态和卡片箭头；深色模式保留暖金色。不要把它理解为固定的橙色。
- `--neutral-accent`：终端与次要控件使用的中性灰强调。
- `--spoiler-mask` / `--spoiler-reveal`：浅色和深色模式各自独立的黑幕遮罩与揭示背景。
- `--code*`：代码块背景、工具栏和边界。
- `--toc-*`：目录背景、边界、当前项、hover、分隔符和阴影。浅色 TOC 使用半透明浅灰表面，深色 TOC 使用半透明炭灰表面。
- `--scrollbar-*`：滚动条轨道、滑块和 hover 颜色；浅色使用蓝灰，深色使用炭灰与低饱和金色。

新增颜色前先判断是否能由现有语义 token 或 `color-mix()` 表达。Alert 的蓝、绿、紫、琥珀和红色属于局部语义色，保留在对应组件规则中，不升级为全站品牌 token。

### 字体语义

- `--font-body`：正文黑体。当前映射到系统中文无衬线字体栈。
- `--font-heading`：文章章节、列表标题和项目标题。当前映射到 Noto Serif SC。
- `--font-display`：页面大标题与品牌展示。当前映射到 LXGW WenKai Lite。
- `--font-meta`：日期、代码、标签和元数据。

侧栏 motto 按页面语言选择字体并统一使用斜体：中文使用 `--font-display`，英文使用 `--font-heading`。语言选择依赖 `<html lang="zh-CN|en">`，不要在组件中重复判断 locale。

不要在新组件中直接重复一长串字体 fallback；优先使用以上语义 token。自托管字体位于 `public/fonts/`，Noto Serif SC 与 LXGW WenKai Lite 分为 latin、常用 CJK 和扩展 CJK 三个 WOFF2 子集，声明集中在 `src/styles/fonts.css`。

更换字体时按这个顺序处理：

1. 将新的 WOFF2 文件放入 `public/fonts/`。
2. 在 `src/styles/fonts.css` 中替换对应的 `@font-face` 和 `unicode-range`。
3. 在 `src/styles/tokens.css` 中修改 `--serif`、`--hand` 或 `--sans` 的语义映射。
4. 运行 `pnpm run build`，确认中英文和代码块都没有回退异常。

### 布局

- `--layout-max`：桌面整体最大宽度，当前 940px。
- `--sidebar-width`：桌面侧栏宽度，当前 210px。
- `--layout-gap`：侧栏、分隔线与正文的列间距，当前 32px。
- `--content-max`：正文最大宽度，当前 670px。
- `--toc-content-gap`：TOC 到正文的距离，当前 38px。

响应式断点仍在 `global.css`：780px 切换移动布局，480px 处理极窄屏。断点属于组件协调规则，不建议仅为单个小组件随意新增断点。

### 交互与动效

- post、project 和 archive 卡片 hover 时使用中性灰背景；右侧箭头继续沿用当前主题的次级标签色，并向右移动少量距离。
- 卡片标题下方的主题色线条由左向右展开，移开后反向收回。线条只按标题内容宽度绘制，不应拉满标题列。
- 首页“查看全部”使用独立的灰色块面 hover，不使用边框、蓝色文字阴影或加粗下划线。
- `prefers-reduced-motion: reduce` 下应关闭非必要过渡和页面切换动画。
- 页面使用细窄圆角滚动条；新增组件不要重新定义一套滚动条颜色。

## 3. 站点、社媒与项目

`src/config.ts` 是站点身份、地址和社媒的单一入口。`site.locales.zh/en` 分别维护站点标题、SEO description、首页简介 `homeIntro` 和侧栏 motto；布局与首页会按当前 locale 自动选择，不要在页面或 `ui.ts` 重复填写这些站点定位文案。

### 社媒

每项包含 `label`、`href` 和 `icon`。只有 `href` 非空的社媒才会渲染；在 `site` 中填写地址并将它传给对应 social 项后自动出现。Email 使用 `mailto:`，不会强制新开标签。图标放在 `public/icons/`，配置的文件名必须与实际 SVG 一致。图标作为 `currentColor` 单色 mask 渲染，以便统一响应浅色、深色和 hover 状态；Linux.do 使用社区提供的 24px 描边版本。

### 项目

项目存放在 `src/content/projects/`，不再写入 `config.ts`。每个项目使用中文和英文两份 Markdown，并以相同的 `translationKey` 配对。新内容统一使用同名目录，便于将来定位内容和资源：

```text
src/content/projects/my-project/
├── assets/
│   └── cover.webp
├── zh.md
└── en.md
```

frontmatter 字段包括：

- `name`
- `lang`，必须是 `zh` 或 `en`
- `translationKey`，同一项目的两种语言保持一致
- `description`
- `href`
- `stack`
- `image`，可省略
- `status`
- `order`，控制首页和项目页顺序
- `draft`，默认 `false`

项目列表中的 `stack` 会以 `#Astro`、`#TypeScript` 这样的形式展示。项目页的“持续维护”等状态与 tags 共用 `--warm` 语义色：浅色为蓝灰，深色为暖金。

Markdown 正文可以记录更完整的背景和设计说明，目前列表页面使用 frontmatter，正文为将来增加项目详情页预留。`getProjects(locale)` 统一负责过滤语言、排除草稿和排序；首页显示前两个项目，项目页显示全部项目。项目首先按 `order` 升序排列（数值越小越靠前）；`order` 相同才按内容文件 ID 的字母顺序稳定排序。新增或修改项目时应同步维护两种语言文件，页面本身不需要再改。

## 4. i18n

本站只支持中文和英文。`src/i18n/config.ts` 是语言配置的单一入口：中文当前是默认无前缀路由，英文使用 `/en/`；`astro.config.mjs` 直接读取这里的 `locales` 与 `defaultLocale`。未来调整默认语言时，应同时重新评估 `localeMeta.prefix`、现有 URL 重定向、canonical 和 sitemap，不要只改页面文案。

`src/i18n/ui.ts` 使用中文 key 集合作为类型基准，英文必须提供完全相同的 key。导航、按钮、tooltip、ARIA、空状态、搜索、文章工具栏和复制状态等短文案都通过 `t(locale, key, values)` 在构建期输出，不使用浏览器运行时翻译。

非 Post 页面必须双语：

- Home、Archive、Projects 和 404 共用 `src/components/pages/` 中的 Astro 结构，根路由与 `/en/` 路由只传入 locale。
- About 的中英文正文分别位于 `src/content/pages/about/zh.md` 与 `src/content/pages/about/en.md`，使用通用 `ContentPage.astro`；页面视觉素材直接由 Markdown 引用。
- Project 必须提供 `zh`、`en` 完整配对；`getProjects()` 会在构建期间检查同一 `translationKey` 是否两种语言都存在。

Post 可以只有中文或只有英文：中文 URL 是 `/posts/YYYY/MM/slug/`，英文 URL 是 `/en/posts/YYYY/MM/slug/`。只有两篇文章设置相同的 `translationKey` 时才显示语言切换并生成双向 `hreflang`；单语文章的语言按钮保持禁用，不创建不存在的翻译 URL。

所有存在双语版本的页面由 `BaseLayout` 输出 canonical、当前语言与另一语言的 `hreflang`，以及指向中文默认版本的 `x-default`。普通页面按镜像路径切换；Post 根据 `translationKey` 找到实际目标，不通过字符串猜测翻译地址。

不要为了追求“全部抽象”把长正文拆成大量 message key：短 UI 进入 `ui.ts`，可增长的结构化内容进入 Content Collection，复杂动态布局留在共享 Astro 组件中。

## 5. 添加一个新的双语页面

页面级内容也按 page key 收进独立目录；About 已采用这一结构。以“友链”为例，推荐沿用当前页面组件和内容集合的分工：

```text
src/content/pages/friends/
├── assets/
├── zh.md
└── en.md

src/components/pages/ContentPage.astro
src/pages/friends.astro
src/pages/en/friends.astro
```

实施步骤：

1. 优先运行 `pnpm new:page -- friends`；它会创建内容目录和中英文路由入口。
2. 通用文字页面使用 `ContentPage.astro`，不再为每一页复制查询与排版逻辑；只有特殊视觉结构才新建专用页面组件。
3. 如果页面要进入主导航，修改 `src/layouts/BaseLayout.astro` 的 `nav` 数组，并在 `src/i18n/ui.ts` 添加导航文案。
4. 如果它只是旧链接兼容入口，可以保留独立 redirect；真正启用页面时再改为 `ContentPage` 路由。

文章、项目和普通页面的职责保持分开：可增长的正文放 `src/content/`，页面骨架放 `src/components/pages/`，URL 入口放 `src/pages/`。

### `src/pages/` 与 URL 的对应关系

Astro 使用文件系统路由：`src/pages/` 下的一个文件就是一个 URL 入口，文件夹就是 URL 的路径段。例如：

| 源文件 | 生成 URL | 作用 |
| --- | --- | --- |
| `src/pages/about.astro` | `/about/` | 中文 About 路由入口 |
| `src/pages/en/about.astro` | `/en/about/` | 英文 About 路由入口；`en` 只是 URL 的第一段 |
| `src/pages/projects.astro` | `/projects/` | 中文项目页入口 |
| `src/pages/posts/[...id].astro` | `/posts/**/` | 捕获任意层级文章地址的动态路由 |
| `src/pages/rss.xml.js` | `/rss.xml` | 构建时生成 XML，而不是 HTML 页面 |

路由文件应尽量保持很薄：只导入共享页面组件、传入 locale，或为旧地址做重定向。正文和复杂结构不要直接堆在 `src/pages/`；分别放在 `src/content/` 与 `src/components/pages/`。

## 5.1 快速创建文章与项目

使用内置脚手架，不需要手动创建文件夹、复制双语 frontmatter 或记资源路径：

```bash
pnpm new:post -- my-first-note
pnpm new:project -- my-new-project
```

两个命令都只接受小写 kebab-case slug，并生成：

```text
src/content/posts/my-first-note/
├── assets/
│   └── diagram.png
├── zh.md
└── en.md
```

项目生成到相同结构的 `projects/<slug>/`。脚手架始终生成 `draft: true`，因此占位标题、示例 URL 和未完成正文不会进入线上站点。文章模板将 `tags`、`updatedAt`、`legacyPath` 等可选字段作为 YAML 注释；项目模板同样将 `stack`、`image` 作为注释。填写完必填字段并将两份内容的 `draft` 设为 `false` 后，运行 `pnpm run build`。

文章图片和项目封面一律放在各自内容目录的 `assets/`：例如 `src/content/posts/<slug>/assets/diagram.png` 或 `src/content/projects/<slug>/assets/cover.webp`。文章 Markdown 使用 `![说明](./assets/diagram.png)`；项目 frontmatter 使用 `image: ./assets/cover.webp`。Astro 会在构建时将这些本地资源输出到站点资源目录，页面组件不再依赖 `public/images` 中的内容图片。

当前使用 Astro 的 passthrough 图片服务，因此图片会以原始尺寸与格式输出，不引入 `sharp` 原生依赖。这很适合体积较小、手动处理过的个人站资源；如果将来需要自动裁剪、响应式尺寸、WebP 或 AVIF，再安装 `sharp` 并移除 `astro.config.mjs` 中的 passthrough 配置。

## 6. 新增配色组合

颜色 token 集中在 `src/styles/tokens.css`。现有 `light` 和 `dark` 是 `data-theme` 的两个值；新增配色时：

1. 在 `:root[data-theme='new-theme']` 中定义完整的语义 token，而不是在组件中写新颜色。
2. 在 `src/config/theme.ts` 增加选项的 `value`、图标和 `labelKey`。
3. 在 `src/i18n/ui.ts` 为该选项增加中英文名称。
4. `PreferenceControls.astro` 和主题同步脚本会自动读取配置，不需要再修改图标同步逻辑。
5. 检查正文、链接、代码块、TOC、卡片 hover 和移动端，而不只检查页面背景。

如果只是微调现有浅色／深色，不要新增主题值，直接修改 `tokens.css` 中对应语义变量。

## 7. GitHub Pages 部署

仓库已经提供 `.github/workflows/deploy.yml`。它在 `main` push 后执行 `pnpm install --frozen-lockfile`、`pnpm run build`，然后使用 GitHub Pages artifact 部署 `dist/`。

不需要手动维护 `gh-pages` 分支。首次启用时，在仓库设置中选择：

```text
Settings → Pages → Build and deployment → Source: GitHub Actions
```

当前仓库使用 `public/CNAME` 配置 `www.kfenghub.top`，因此自定义域名会随构建产物一同发布。若改用 `k4if3ng.github.io`，需要同步修改 `astro.config.mjs` 的 `site`，并删除或替换 `public/CNAME`。

本地发布前建议先运行：

```bash
pnpm run build
pnpm run preview
```

只有需要使用旧式“从某个分支直接发布静态文件”工作流时，才考虑手动维护 `gh-pages` 分支；当前 Actions artifact 方案不需要它。

## 8. Note frontmatter

推荐模板：

```yaml
---
title: 中文标题
slug: english-kebab-case
publishedAt: 2026-08-04
updatedAt: 2026-08-05
tags: [astro, design]
lang: zh
translationKey: optional-shared-id
draft: false
legacyPath: /old/path/
---
```

### `title`、`slug`、`translationKey` 与 URL

| 字段 | 职责 | 是否出现在 URL | 双语版本是否相同 |
| --- | --- | --- | --- |
| `title` | 页面标题、列表标题、SEO 标题 | 否 | 通常不同 |
| `slug` | URL 中可读、稳定的文章标识 | 是 | 推荐相同，也可以不同 |
| `translationKey` | 标识“这两篇内容互为翻译” | 否 | 必须相同 |
| `publishedAt` | 提供 URL 中的年份与月份，并控制排序 | 间接出现 | 通常相同 |

公开地址由 `lang`、`publishedAt` 与 `slug` 组成：中文为 `/posts/YYYY/MM/<slug>/`，英文为 `/en/posts/YYYY/MM/<slug>/`。例如：

```yaml
# src/content/posts/content-workflow/zh.md
title: 内容工作流
slug: content-workflow
translationKey: content-workflow
publishedAt: 2025-04-14
lang: zh
```

生成地址是 `/posts/2025/04/content-workflow/`；英文文件的 `title` 可为 `Content workflow`，`lang: en` 会生成 `/en/posts/2025/04/content-workflow/`。两者通过相同的 `translationKey` 建立语言切换和 `hreflang` 关系，而不是通过 title、文件夹名或 URL 猜测彼此。

`slug` 是必填字段，只允许小写英文、数字和单连字符；修改它就会修改公开 URL。Collection 内部 ID 则由源文件路径生成，所以 `zh.md` 和 `en.md` 能自然共用同一个 slug，不会互相覆盖。当前代码仍会去除旧 slug 末尾的 `-zh` 或 `-en` 以兼容历史内容，但新文章不应使用该后缀。同一语言、同一月份的重复 URL 会让构建失败。`legacyPath` 用于旧地址 301 迁移。

`translationKey` 对 Post 是可选字段。同一文章的中英文译本填写相同值；单语文章省略即可。每种语言下同一个 translationKey 最多只能出现一次。

Note 不再维护 `description` frontmatter。`src/lib/posts.ts` 的 `getPostExcerpt()` 会选取正文中第一个普通段落，清理 Markdown 标记并截断，统一供首页列表、归档搜索、文章 SEO description 和 RSS 使用。开头只有标题、列表、代码块或引用时会继续寻找后面的普通段落；因此建议每篇文章尽早写出一段能独立表达主题的正文。

## 9. Markdown extensions

### Alert

```md
> [!NOTE] 可选自定义标题
> 内容
```

支持 `NOTE`、`TIP`、`IMPORTANT`、`WARNING`、`CAUTION`，类型名不区分大小写。标记必须位于 blockquote 第一段的开头。

### Spoiler

```md
==隐藏内容==
```

扩展不会跨越换行、链接、强调或代码节点。代码块和行内代码中的 `==` 不会转换。

### 原生引用

```md
> 普通引用
```

普通引用使用斜体；Alert 使用直立字体。

## 10. 文章页

- TOC 从 Astro `render(post).headings` 获取二、三级标题。
- 文章工具栏紧接标题和日期元数据，承载 TOC、返回归档、顶部和底部跳转。返回类站内链接使用单独的细线 SVG 左箭头，避免受字符字体影响而错位。
- 桌面 TOC 默认展开，移动端默认折叠；目录面板处于正常文档流中，展开时推开正文而不会遮挡内容。`--toc-content-gap` 控制目录区到正文的距离。
- TOC 背景通过 `--toc-bg` 使用半透明灰色，并配合轻微 `backdrop-filter` 模糊；浅色正文为纯白时仍保持足够区分度。
- “目录”标签使用 `--font-meta` 对应的等宽字体，与文章展示标题明确区分；当前章节和目录项维持正文无衬线字体。
- IntersectionObserver 更新当前章节和 `aria-current`。
- 中文按约 300 字／分钟、英文按约 200 词／分钟估算阅读时间。
- 代码块由 Shiki 构建期 transformer 生成语言工具栏、语言图标和复制按钮。工具栏不再显示 UTF-8、总行数或额外分隔信息，只保留语言标识和复制按钮；代码行号默认关闭。
- 语言图标优先从 `@iconify-json/logos`、`@iconify-json/simple-icons` 的本地数据生成，不在浏览器运行时请求 Iconify。YAML、TOML、Java、Go、Rust、TypeScript、Python、Bash 等映射集中维护在 `src/config/code-block.json`。
- 相邻文章按发布时间降序计算；上一篇是更旧内容，下一篇是更新内容。
- 相邻文章、日期、归档地址和工具栏语言都来自当前 Post 的 `lang`，不会跨语言混排。
- 工具栏按钮使用 `data-link-plain` 或页内锚点，不会附加普通站内链接标记。

## 11. 链接

站内链接和站外链接通过显式 class 统一箭头形式：

- `.link-internal`：站内右箭头 SVG mask。
- `.link-external`：站外打开图标 SVG mask，并设置新标签页及 `rel=noreferrer`。
- `.link-internal-back`：返回类站内链接使用左箭头，箭头位于文字左侧。

卡片链接使用 `data-link-card`，纯控件／返回按钮使用 `data-link-plain`。卡片的箭头由卡片组件显式放置；锚点链接不会自动加图标。

## 12. 修改后的检查清单

```bash
pnpm astro check
pnpm run build
```

常用本地命令也可以通过 `pnpm run` 调用：

```bash
pnpm run dev
pnpm run preview
pnpm run help
pnpm run new:post -- my-first-note
pnpm run new:project -- my-new-project
pnpm run deploy
```

视觉上至少检查：

1. 中文无前缀路由和英文 `/en/` 路由。
2. 浅色、深色、跟随系统。
3. 780px 和 480px 以下布局。
4. 中英文 note 自动摘要、有／无译文、有／无 TOC、长标题和代码块。
5. archive 搜索、项目图片、空社媒占位。
6. 普通引用、五种 Alert、spoiler、站内／站外链接。

修改 locale、URL、slug、`translationKey` 或 `legacyPath` 时，还要检查中英文生成目录、两份 RSS、canonical、hreflang、sitemap 和旧地址重定向。
