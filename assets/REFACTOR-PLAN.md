# Digate 网站整体重构计划

版本：2026-09-02  
范围：当前 13 个静态 HTML 页面、`assets/css` 与 `assets/js` 目录  
原则：先稳定、再迁移、后精简；每一阶段都保持网站可访问，不进行一次性推倒重写。

## 1. 当前基线

### 页面与目录

- 主页：根目录 `index.html`
- 其他页面：`assets/html`，共 12 个
- 页面总数：13
- 当前本地页面、CSS 和 JS 引用缺失：0
- HTML 已统一为 UTF-8，重复 ID 已处理
- 导航容器已统一为 `1180px` 最大宽度和 `28px` gutter

### 样式现状

| 文件 | 大小 | 行数 | `!important` |
| --- | ---: | ---: | ---: |
| `overrides.css` | 约 339KB | 5229 | 1145 |
| `home.css` | 约 107KB | 674 | 77 |
| `platform.css` | 约 37KB | 200 | 2 |
| 其余页面 CSS | 约 6–11KB / 文件 | — | 每个约 0–2 |

目前最主要的问题是：大量页面最终样式仍由 `overrides.css` 决定，文件名与实际职责不一致。Digate、X-Digate、Solutions、Platform、Company 在该文件中的规则最多；Blogs、Use Cases 和详情页尚无独立页面 CSS。

### 2026-09-02 第一轮执行记录

- 已建立 `blogs.css`、`use-cases.css` 与 `content-detail.css`。
- 已将 Resources 的 FAQ 页面细化规则迁入 `resources.css`。
- 已将全站最终导航与文字标识规则迁入 `navigation.css`，13 个页面统一加载。
- `overrides.css` 从约 339KB / 5229 行 / 1145 个 `!important` 降至约 293KB / 4675 行 / 950 个 `!important`。
- 本轮以规则归位为主，未刻意删除必要的 `!important`；全站总量的降低安排在阶段 4。

## 2. 目标结构

```text
index.html
assets/
  html/
    platform.html
    ...
  css/
    tokens.css
    base.css
    components/
      navigation.css
      footer.css
      buttons.css
      cards.css
      forms.css
    pages/
      home.css
      platform.css
      digate.css
      xdigate.css
      solutions.css
      built-for.css
      resources.css
      blogs.css
      use-cases.css
      company.css
      demo.css
      content-detail.css
  js/
    navigation.js
    resources.js
    content-detail.js
    interactions.js
    main.js
```

这是一种职责划分示意。迁移期间不急着一次改变所有物理目录，先让规则归属正确，再决定是否移动文件。

## 3. 分阶段执行

### 阶段 0：建立安全基线

目的：让后续每次迁移都可以判断是否破坏页面。

工作：

1. 固定 13 个页面清单和页面间链接检查。
2. 建立 UTF-8、重复 ID、缺失本地资源、CSS 括号和 JavaScript 语法检查。
3. 记录每个页面加载的 CSS 文件及当前 `!important` 数量。
4. 按桌面、平板、手机三档维护人工验收清单；只有用户明确要求浏览器测试时再执行视觉浏览器测试。

验收：所有自动检查通过，后续每阶段都重复运行同一套检查。

### 阶段 1：按页面拆出 `overrides.css`

目的：先明确规则归属，不立即改变视觉结果。

工作：

1. 按页面 ID 将专属规则迁回对应页面 CSS。
2. 新建 `blogs.css`、`use-cases.css` 和 `content-detail.css`。
3. 将 Blog Detail 与 Use Case Detail 共用的文章布局放入 `content-detail.css`。
4. 将只属于 Resources 家族的导航和内容规则放入对应页面或共享组件文件。
5. 每迁移一个页面，就从 `overrides.css` 删除已迁移规则并完成检查。

推荐顺序：

1. Resources
2. Blogs / Blog Detail
3. Use Cases / Use Case Detail
4. Demo
5. Built For
6. Company
7. Platform
8. Solutions
9. X-Digate
10. Digate
11. Home

先处理规则较独立的小页面，用它们验证迁移方法；Home、Digate、X-Digate 最后处理。

验收：所有页面仍正常加载；`overrides.css` 只保留真正跨页面或尚未迁移的规则。

### 阶段 2：提取全站组件

目的：避免相同导航、按钮、页脚和卡片在多个页面各写一套。

工作：

1. 将统一后的导航规则迁入 `navigation.css`。
2. 将页脚、按钮、表单、标签、卡片和 CTA 提取为共享组件。
3. 为组件定义状态：默认、hover、focus-visible、active、disabled。
4. 页面 CSS 只描述页面布局与页面独有视觉，不再重写共享组件尺寸。

验收：导航和页脚各只有一个主规则来源；页面文件不再通过高权重 ID 选择器修改共享组件。

### 阶段 3：完善设计令牌

目的：把颜色、字体、容器、间距、圆角、阴影和响应式边界集中管理。

工作：

1. 保留现有颜色、字体与容器令牌，删除同义重复值。
2. 增加间距、字号、行高、圆角、阴影和层级令牌。
3. 明确标准容器、窄内容容器和阅读容器的使用场景。
4. 统一响应式断点，避免每个页面自行选择相近断点。
5. 将硬编码的高频值逐步替换为令牌，不为了“令牌化”处理只出现一次且具有明确语义的值。

验收：品牌颜色、正文颜色、字体族、导航容器和主要间距不再散落重复定义。

### 阶段 4：降低选择器权重并清理 `!important`

目的：恢复正常的 CSS 层叠关系。

工作：

1. 删除无效、被覆盖和完全重复的声明。
2. 用组件类和页面作用域替代长 ID 链。
3. 按加载顺序和职责解决冲突，而不是继续追加 `!important`。
4. 只为确有必要的工具类或第三方样式兼容保留少量 `!important`。

阶段目标：

- 第一轮：1145 降到 500 以下
- 第二轮：降到 100 以下
- 完成目标：控制在 0–20，且每一处都能解释原因

### 阶段 5：拆分 JavaScript

目的：让约 37KB 的 `light-index.js` 不再同时承担全部页面逻辑。

工作：

1. 路由与路径识别保留在统一入口。
2. 导航、Resources 菜单、Blog Detail、Use Case Detail、表单和滚动动画分别拆分。
3. 仅在页面存在对应组件时初始化逻辑。
4. 移除与旧单页结构相关的遗留代码。
5. 保持无框架、原生 JavaScript，除非未来确实需要内容管理或组件构建流程。

验收：每个模块职责单一；任一页面缺少某组件时脚本不会报错；所有链接和内容详情参数正常。

### 阶段 6：HTML 共用结构与可维护性

目的：解决 13 个页面重复维护导航和页脚的问题。

短期方案：

- 继续保留纯静态 HTML。
- 建立一个明确的导航/页脚主模板说明。
- 修改全站结构时使用可验证的批量更新脚本，并在完成后删除临时脚本。

中期可选方案：

- 如果页面数量继续增长或需要频繁更新内容，再引入轻量静态站点生成流程。
- 不建议只为消除少量重复就立即迁移 React、Vue 或大型框架。

验收：13 个页面的导航项目、顺序、链接和页脚内容保持一致。

### 阶段 7：可访问性、性能与发布准备

工作：

1. 检查标题层级、图片替代文本、表单 label、键盘焦点和移动导航状态。
2. 为当前远程图片建立本地资源或可靠 CDN 策略，避免外部资源失效。
3. 检查每页 title、description、Open Graph 和 canonical。
4. 减少未使用 CSS；最终页面只加载共享 CSS 与自己的页面 CSS。
5. 确定部署目标后再加入对应构建或托管配置。

验收：无断链、无重复 ID、无乱码、无控制台语法错误；页面具备基础 SEO 和键盘可用性。

### 阶段 8：移除 `overrides.css`

删除条件：

1. 文件内所有有效规则已迁入明确归属文件。
2. 13 个页面不再引用它。
3. 全站检查通过。
4. 人工确认桌面、平板与手机的关键页面没有视觉回退。

完成后，`overrides.css` 应被删除，而不是保留一个空壳或再次作为补丁入口。

## 4. 每轮工作的固定流程

每次只处理一个页面家族或一个共享组件：

1. 盘点该范围内的当前规则。
2. 标记重复、失效、共享和页面专属规则。
3. 先迁移有效规则，再删除原规则。
4. 检查页面链接、CSS 结构、JavaScript 语法、UTF-8 和重复 ID。
5. 记录 `overrides.css` 大小与 `!important` 数量变化。
6. 确认稳定后再进入下一范围。

## 5. 建议马上开始的工作

下一步建议执行“阶段 1A：Resources 家族样式归位”：

- 范围：Resources、Blogs、Blog Detail、Use Cases、Use Case Detail
- 原因：这五个页面相互关联、规则边界较清楚，而且其中四个页面还没有独立 CSS
- 结果：建立这组页面的正式样式文件，清除 `overrides.css` 中对应规则，为后续页面提供可重复的迁移方法

该阶段不改设计、不改内容，只整理样式归属并清理确定失效或重复的规则。

## 6. 完成指标

- 页面数：13，全部可访问
- 本地缺失引用：0
- 重复 ID：0
- 非 UTF-8 文件：0
- `overrides.css`：删除
- `!important`：0–20，均有明确理由
- 全局导航：一个规范、一个规则来源
- 页面 CSS：仅包含页面专属布局和视觉
- JavaScript：按功能拆分，无旧单页路由遗留
- 设计规范与代码中的令牌、容器、字体和颜色保持一致
