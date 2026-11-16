# Neri

个人向的 Zen Browser 主题。

以 Zen 原生外观为基准，只做自己需要的少量调整；不追求通用性，也不保证适合所有人的使用习惯。

## 安装

需要先安装 [Sine](https://github.com/CosmoCreeper/Sine)。

**通过 Sine 安装**

1. 打开 Zen 设置 → **Sine Mods**。
2. 在自定义 mod 输入框中粘贴 `https://github.com/Rinne05/zen-neri`，点击添加。
3. 启用 **Neri**，重启 Zen。

> Neri 包含两个 userscript（Glance 弧线、右键菜单图标）。如果 Sine 默认禁止
> 脚本执行，需要先允许（`sine.allow-unsafe-js = true`）再重启。

> 右键菜单图标通过 `chrome.manifest` 提供本地 SVG；手动 `userChrome.css`
> 安装不会注册这个 manifest，因此右键菜单图标不会生效。

**手动安装到 sine-mods**

如果无法通过仓库地址安装，也可以把本仓库复制到
`<profile>/chrome/sine-mods/Neri/`，确保 `theme.json` 直接位于该目录下，
再按 Sine 的本地 mod 安装方式登记并启用。路径可通过 `about:support` →
**Open Profile Folder** 找到；不需要复制 `.git` 目录。

## 样式详情

- **Glance 预览**：`90% × 90%` 尺寸、`14px` 圆角、背景页面不缩放，开合弧线对齐到居中预览。
- **右键菜单图标**：使用 MingCute 图标集覆盖浏览器自身的右键菜单；网页内菜单和未知动态项保持原生。

## 其他

- 功能范围：[MODIFICATIONS.md](MODIFICATIONS.md)
- 开发流程：[DEVELOPMENT.md](DEVELOPMENT.md)
- 仓库规范：[AGENTS.md](AGENTS.md)
- 测试版本：**Zen Browser 1.24.2b**（Linux）

### 参考

- [Zen-Nebula](https://github.com/JustAdumbPrsn/Zen-Nebula) — 个人向 Zen 主题，作为视觉与结构参考
- [MingCute](https://github.com/mingcute-design/mingcute-icons) — 右键菜单图标集（Apache-2.0）
- [Sine](https://github.com/CosmoCreeper/Sine) — mod 加载与管理
- [Catppuccin for Zen](https://github.com/catppuccin/zen-browser) — 配色主题参考
- [sameerasw/zen-themes](https://github.com/sameerasw/zen-themes) — 个人 Zen 主题与 mod 集合
- [Zen Browser theme store](https://github.com/zen-browser/theme-store) — 官方主题 / 模组索引
