# 开发规范

本文件面向在本仓库工作的开发者和 AI agent。搭建细节见
[DEVELOPMENT.md](DEVELOPMENT.md)，当前功能范围见 [MODIFICATIONS.md](MODIFICATIONS.md)。

## 项目定位

Neri 是一个 native-first 的 Zen Browser 主题。**默认保持 Zen 原生外观**，
只对明确登记的功能做最小改动。

## 核心原则

1. **默认原生。** 未列入 [MODIFICATIONS.md](MODIFICATIONS.md) 的区域保持
   Zen 原生；不要顺手统一颜色、间距、圆角、字体或动画。
2. **一个功能一个模块。** 每个功能有独立的样式文件（需要脚本时再加独立
   脚本）、独立的选择器和 hook，并在修改清单中占一行。
3. **只影响目标模块。** 功能可以改主网页、标签页、侧边栏或任何区域，但必须
   是该功能的明确目标；不能让无关元素产生副作用。
4. **最小必要覆盖。** 优先复用 Zen 原生结构；能改一个属性就不要重写整块样式。
5. **可单独回退。** 每条规则或 hook 应能独立删除，并在修改清单中写清删除
   影响。
6. **默认不新增运行时负担。** 新增 pref、网络请求、存储或设置界面需要明确
   理由，并写入文档；能不加就不加。
7. **文档用中文。** 代码、选择器、命令、pref 名和 UI 标签保持原样。

## 当前功能模块

| 模块 | 文件 | 状态 |
| --- | --- | --- |
| Glance 预览 | `tweaks/10-glance.css`、`js/neri-glance.uc.js` | 已发布 |

新增模块后在此表追加一行，并同步更新 [MODIFICATIONS.md](MODIFICATIONS.md)。

## 新增功能流程

1. **定义范围。** 写清目标 UI、预期效果、明确不碰的区域。
2. **新建模块。** 使用 `NN-<feature>.css` / `neri-<feature>.uc.js`。
3. **注册。** 在 `userChrome.css` 的 import 区追加样式；在 `theme.json` 的
   `scripts` 中追加脚本。
4. **实现。** 选择器尽量窄；复用原生变量、原生状态类和原生布局。
5. **验证。** 在 dev profile 检查目标功能，并回归相邻 UI 非目标元素。
6. **登记。** 在 [MODIFICATIONS.md](MODIFICATIONS.md) 增加或更新该模块一行；
   工作流变化时更新 [DEVELOPMENT.md](DEVELOPMENT.md)。README 只更新概要，
   不逐项展开。
7. **提交。** 一个功能一个提交，提交信息写清动机和验证结果。

## 开发环境

- **仓库是唯一事实来源。** `<profile>/chrome/sine-mods/Neri` 只是运行时目标；
  不要在安装目录里做唯一一份修改。
- dev profile 名由 `PROFILE_NAME` 指定，默认 `zen-dev`，路径为
  `~/.config/zen/$PROFILE_NAME`，其中 `chrome/sine-mods/Neri` 是指向本仓库的
  symlink。用 `readlink -f` 确认它指向仓库。
- 启动：
  `zen-browser --new-instance --profile "$HOME/.config/zen/$PROFILE_NAME"`
- 文档和脚本中的 profile 名用 `PROFILE_NAME` / `$DEV` 变量，不要写死。
- 日常循环：
  - CSS：保存 → `Ctrl+Shift+Y` → **Refresh mod styles**，无需重启。
  - JS：保存 → 重启 dev profile。Sine 不会热重载已加载的 `.uc.js`。
- 不要在日常 profile 里实验；日常 profile 只接收验证过的稳定版本。

## 验证清单

每次改动至少完成：

1. 改动的 JS 通过 `node --check`。
2. 目标功能按预期工作。
3. 非目标区域没有变化：至少检查 `#navigator-toolbox`、`#urlbar`、
   `#tabbrowser-tabpanels`、`#TabsToolbar`，以及与该功能相邻的 UI。
4. 打开、关闭、切换状态时没有意外的尺寸跳变或位置跳变。
5. 修改清单中的删除影响仍然准确。

## 文档规则

- 所有 Markdown 文档用**中文**。代码、选择器、命令、pref 名、UI 标签保持原样。
- [README.md](README.md) 保持简短：简介、安装、当前样式概览、文档与参考链接；
  样式概览按功能模块聚合，不拆成单条规则；不写调参或故障排查。
- [MODIFICATIONS.md](MODIFICATIONS.md) **按功能模块一行**。模块内部的具体
  规则不要逐条列出；实现细节放在代码注释和 DEVELOPMENT。
- 功能模块的状态用“已修改 / 部分修改 / 未修改”；新增模块追加一行，不要重排
  整张表。元数据等辅助项可单独标注。
- 行为变更时同步受影响的文档；只改文档不需要浏览器验证。
- 内部链接用相对路径，例如 `[DEVELOPMENT.md](DEVELOPMENT.md)`。

## 提交

- 一次提交只做一件事；提交信息用中文，写清动机和结果。
- 新增功能与它的样式、脚本、注册和文档放在同一个提交里。
- 提交前检查：`git status --short`、`git diff --check`、改动的 JS 通过
  `node --check`。
- 不提交 dev profile、临时文件、浏览器日志或 Sine 生成的
  `chrome.css` / `content.css`。
- 版本号只在发布时更新：`theme.json` 的 `version` / `updatedAt`，以及
  `README.md` 中的测试版本行。

## 不要做

- 不要把多个无关功能塞进同一个文件或同一个提交。
- 不要恢复已删除的旧主网页样式文件（`00-tokens.css`、`10-webview-frame.css`、
  `20-wider-page.css`）；主网页功能应作为新的具名模块实现，而不是恢复这些
  全局覆盖。
- 不要做没有登记、没有目标模块的“顺手优化”。
- 不要把临时调试规则或临时日志留在提交里。
- 不要编辑 Sine 生成的 `chrome.css` / `content.css`。
- 不要为了“看起来更整齐”重排无关代码或文档。

## Zen 更新后的处理

若 Zen 更新导致某个模块失效：

1. 先在 dev profile 复现，确认失效点（选择器、布局、动画还是数据接口）。
2. 只修失效的最小部分，保持其他模块和原生行为不变。
3. 重新跑验证清单，并更新 [MODIFICATIONS.md](MODIFICATIONS.md) 的对应行。
