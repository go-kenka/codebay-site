# CodeBay 官网设计规范

版本：2.0 · 2026-10-20
适用：`web/` 静态站点（index.html / style.css / main.js）

这份规范是官网配色的唯一依据。改颜色、圆角、阴影、动效之前先改这里，再改 CSS。

## 参考体系

- [Radix Colors · Understanding the scale](https://www.radix-ui.com/colors/docs/palette-composition/understanding-the-scale)：12 级色阶各自的使用位置（背景、组件、边框、实心、文字）。
- [Radix Colors · Composing a palette](https://www.radix-ui.com/colors/docs/palette-composition/composing-a-palette)：Sand 灰与 Amber 的天然配对；Jade 表示成功、Red 表示错误。
- [Radix Colors · Scales](https://www.radix-ui.com/colors/docs/palette-composition/scales)：具体色值。
- [Geist Design System · Colors](https://vercel.com/geist/colors)：Background 1/2、组件色 1–3、边框 4–6、高对比 7–8 的分层方式；边框只画一次；阴影用半透明黑。
- [Apple HIG · Color](https://developer.apple.com/design/human-interface-guidelines/color)：macOS 原生产品的克制用色；颜色只承担状态与身份，不承担装饰。

## 设计方向

**工作台（Workbench）**：暖石墨色的工作台面、骨白刻度、纸面记录。整站只有一种「信号色」——琥珀；它只表示「有 Agent 在等你」。
没有紫色、青色、玫瑰色的装饰光；没有渐变文字；没有大面积玻璃和彩色投影。身份来自排版、发丝线、留白和交互，不来自饱和度。

关键词：**石墨 · 骨白 · 琥珀 · 发丝线 · 刻度**。

## 色板

### 暗色工作台（Radix Sand dark）

| Token | 值 | Radix 层级 | 用途 |
|---|---|---|---|
| `--bg` | `#111110` | sand-1 | 页面底色 |
| `--bg-soft` | `#151514` | 1/2 之间 | 页脚、深层窗口 |
| `--surface-1` | `#191918` | sand-2 | 卡片、终端、代码块 |
| `--surface-2` | `#222221` | sand-3 | 组件默认背景 |
| `--surface-3` | `#2a2a28` | sand-4 | hover / 选中 |
| `--line` | `rgba(238,238,236,.08)` | sand-6 等价 | 分隔线、卡片边 |
| `--line-2` | `rgba(238,238,236,.16)` | sand-7/8 | 交互边框、focus |
| `--ink` | `#eeeeec` | sand-12 | 主文字 |
| `--ink-2` | `#b5b3ad` | sand-11 | 正文、说明 |
| `--mute` | `#a19e97` | sand-10/11 之间 | 弱化标签、脚注；小字仍保证 4.5:1 |

### 信号色

| Token | 值 | 来源 | 用途（只有这些） |
|---|---|---|---|
| `--amber` | `#ffc53d` | Radix Amber 9 | 等待确认、被看见、当前焦点 |
| `--amber-text` | `#ffca16` | Amber 11 | 深色底上的琥珀文字 |
| `--amber-bg` | `#1d180f` | Amber 2 | 等待卡片底色 |
| `--jade` | `#1fd8a4` | Radix Jade 11 | 运行中、通过 |
| `--red` | `#ff9592` | Radix Red 11 | 错误、删除、失败 |

琥珀配额：一屏最多 3 处；不允许用于普通链接、按钮底色、装饰线、图标底色。Jade 只做 6px 状态点、diff `+`、测试通过标签。

### 纸面记录（Radix Sand light）

| Token | 值 | Radix 层级 | 用途 |
|---|---|---|---|
| `--paper` | `#f1f0ef` | sand-3 | 验收数字段底色 |
| `--paper-deep` | `#e9e8e6` | sand-4 | 纸面边缘 |
| `--paper-ink` | `#21201c` | sand-12 | 纸面标题与数字 |
| `--paper-ink-2` | `#63635e` | sand-11 | 纸面说明 |
| `--paper-line` | `rgba(33,32,28,.14)` | sand-6 等价 | 纸面分栏 |
| `--paper-accent` | `#ab6400` | Amber 11（light） | RECORD 标签、纸面强调 |

### 禁止项

- 禁止紫色、青色、玫瑰色、彩虹渐变、彩色 mesh 背景。
- 禁止 `background-clip: text` 渐变标题。
- 禁止彩色辉光 `box-shadow`；阴影一律半透明黑。
- 禁止大面积 `backdrop-filter`；只允许滚动后的桌面导航条使用。
- 禁止用琥珀表达“品牌/装饰”；它只表达等待与注意力。

## 字体

| 层 | 字体 | 用途 |
|---|---|---|
| 拉丁正文 | Manrope | 正文、UI、数字 |
| 中文 | PingFang SC / 系统字体 | 标题与正文 |
| 展示衬线 | Instrument Serif Italic | 英文短句、数字 |
| 等宽 | JetBrains Mono | 标签、键位、代码、数据 |

- 标题中文 600–700 字重，正文 400–500；中文标题字距 `-0.02em`。
- 微标签：mono 9–11px，大写，字距 `.18em–.22em`。
- 数字：Instrument Serif Italic，`tabular-nums`。

## 间距、圆角、边框

- 间距按 4px 网格：4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 / 96 / 128。
- 圆角四档：`4px`（状态标签）、`6px`（键帽/小 chip）、`8px`（按钮/输入）、`12px`（卡片/窗口）、`16px`（大面板/地图）。
- **不使用全站胶囊按钮**；状态标签才允许 999px。
- 边框只画一次：容器有边框时，内部分隔线用更弱的 `--line`。
- 阴影：`0 1px 0 rgba(255,255,255,.03) inset, 0 24px 60px -32px rgba(0,0,0,.9)`；不用彩色 shadow。

## 动效

- 时长三档：`180ms`（反馈）、`420ms`（进入）、`900ms`（叙事）。
- 缓动：`cubic-bezier(.22,1,.36,1)`；不弹跳、不回弹。
- 只动 `transform` / `opacity`；滚动统一一个 passive listener + 一个 rAF。
- 进入动画 ≤ 900ms，stagger ≤ 40ms；离开视口即停。
- Canvas 30fps 上限、DPR ≤ 2、离屏暂停。
- `prefers-reduced-motion: reduce` 下全部直接显示终态；无 JS 时内容完整可读。

## 组件规则

- **导航**：滚动后实底 `rgba(17,17,16,.9)` + 1px 发丝线；菜单项 hover 用 `--surface-2`，不用胶囊。
- **按钮**：主按钮骨白实底、石墨字、8px 圆角；次按钮透明底 + 1px 边框。Moving Border 只给主 CTA，旋转环只允许骨白与琥珀两个色标。
- **终端**：`--surface-1` 实底，1px 边框；运行中 Jade 点，等待 Amber 点；等宽 11–12px。
- **卡片**：实底 `--surface-1`，1px `--line`；hover 只上浮 2px、边框变 `--line-2`；指针光斑为骨白 4% 透明度。
- **数字**：纸面段使用 Sand light；数字用 Instrument Serif Italic；分割线 `--paper-line`。
- **地图**：底点 Sand 9；城市点骨白；本次点击的城市用琥珀，且只亮一次。
- **下载**：Lamp 用骨白，不用琥珀；安装命令块实底，复制反馈只用文字与边框变化。

## 文案语气

短句、事实、限定条件；数字必须带样本；演示与示意直接标在界面上。禁止“智能编排 / 自动接管 / 云端同步 / 即将上线 / 永久免费”。

## 实现映射

- 颜色只在 `web/style.css` 的 `:root` 定义一次；组件不得写死色值（地图 Canvas 除外，需与 token 注释对应）。
- 圆角、间距、阴影同样从 `:root` 取。
- 新增组件先对照本文件，再写代码；PR 描述里注明引用的 Radix 色阶。
