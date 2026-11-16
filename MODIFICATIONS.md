# 修改清单

按功能模块核对 Neri 当前版本的修改范围。每个模块一行；未列出的区域保持
Zen 原生。Glance 预览是第一个功能模块，右键菜单图标是第二个；后续功能继续按
模块追加，而不是把规则逐条展开。

“元数据”是辅助项，不属于可见功能。

最后核对：**Zen Browser 1.24.2b**（Linux），2026-11-16。

| 模块 | 状态 | 摘要 | 文件 |
| --- | --- | --- | --- |
| Glance 预览 | **已修改** | 尺寸 90% × 90%、圆角 14px、背后父页面不缩放、打开/关闭弧线重定向到 90% 矩形 | `tweaks/10-glance.css`、`js/neri-glance.uc.js` |
| 右键菜单图标 | **已修改** | 浏览器自身右键菜单使用 MingCute 图标；网页内菜单、checkbox/radio 和未知动态项保持原生 | `tweaks/20-context-icons.css`、`js/neri-context-icons.uc.js`、`icons/mingcute/`、`chrome.manifest` |
| 网页内容 | 未修改 | `userContent.css` 为空 | — |
| 标签页 / 标签栏 / workspace | 部分修改 | 标签页和 workspace 右键菜单由图标模块处理；布局保持原生 | — |
| 侧边栏 / 垂直标签 | 部分修改 | 侧边栏右键菜单由图标模块处理；侧边栏和垂直标签布局保持原生 | — |
| 工具栏 / 地址栏 / 菜单 | 部分修改 | 工具栏、页面和标签页右键菜单由图标模块处理；地址栏和其他菜单保持原生 | — |
| 面板 / 对话框 / 通知 / 下载 | 部分修改 | 下载项右键菜单由图标模块处理；其他保持原生 | — |
| 颜色 / 字体 / 图标 / 阴影 | 部分修改 | 仅右键菜单图标使用 MingCute；其他图标、颜色、字体、阴影保持原生 | — |
| 其他动画 | 未修改 | toast、面板、标签页、侧边栏等保持原生 | — |
| 元数据 | 已注册 | Sine 入口：`userChrome.css`、空的 `userContent.css`、两个 userscript；`chrome.manifest` 提供本地图标 | `theme.json`、`chrome.manifest` |

## 核对结论

- 当前版本有两个功能模块：**Glance 预览** 和 **右键菜单图标**。
- Glance 打开期间唯一触碰 overlay 之外的元素，是父标签的
  `.browserSidebarContainer`（阻止原生 0.97 缩放）；这是 Glance 背景处理的
  一部分，Glance 关闭后即失效。
- 右键菜单图标只在 `menupopup` 打开时给映射项加 `data-neri-icon` 和原生
  icon class，不修改菜单结构、命令或其他区域；未知项与 checkbox/radio 保持
  原生。
- 没有内容 CSS、没有其他功能模块。
- 这张表描述当前版本，不是永久范围；新增功能时追加一行即可。

## 维护

新增功能模块时：

1. 新建独立文件（`tweaks/NN-<feature>.css`、`js/neri-<feature>.uc.js`），不要
   堆进现有 Glance 文件。
2. 在 `userChrome.css` 和 `theme.json` 中注册；需要本地图片时同时登记
   `chrome.manifest`。
3. 在表中追加一行，写清状态、摘要和文件。README 只更新概要，按模块聚合，
   不逐项展开。
4. 验证目标功能，并回归相邻的非目标区域。

删除功能模块时：删除代码、import、脚本注册，并删除该行或改回“未修改”。

不需要把每个选择器或每条规则都列进这张表；具体实现细节放在代码注释和
[DEVELOPMENT.md](DEVELOPMENT.md) 中。
