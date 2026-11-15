# 开发

Neri 从本仓库开发。`<profile>/chrome/sine-mods/Neri` 下的文件夹是运行时目标，
不是源码树。

唯一事实来源是 git 仓库。浏览器 profile 只读取它。不要让安装副本成为某个改动
唯一存在的地方。

开发规范（作用域、验证、提交和文档规则）见 [AGENTS.md](AGENTS.md)。
以下以当前 Glance 模块为例；新增模块沿用同一套流程。

## 为什么用 dev profile

独立 profile 可以保持日常浏览器稳定：

- 修改 JavaScript 需要重启浏览器；重启干净的 profile 成本很低。
- 调试用 prefs（`sine.enable-dev`、Browser Toolbox）不会进入日常使用。
- 损坏的 `userChrome.css` 或 userscript 不会卡死日常浏览器。
- 删除 dev profile 并重新执行搭建步骤即可重置。
- 用 `--new-instance` 可以让第二个实例与日常浏览器同时运行。

不要在 dev profile 登录账号或保留重要标签页。把它当作一次性环境。

## 目录结构

```text
<repo>/                              # git 根目录；这里就是 mod 文件夹
  theme.json
  userChrome.css
  userContent.css
  tweaks/
    10-glance.css
  js/
    neri-glance.uc.js
  README.md
  DEVELOPMENT.md
  MODIFICATIONS.md
  AGENTS.md

<dev-profile>/chrome/
  JS/                                # Sine 引擎（从可用 profile 复制）
  utils/                             # Sine 引导 + chrome.manifest
  sine-mods/
    mods.json                        # Sine 的已安装 mod 元数据
    chrome.css                       # 由 Sine 生成
    content.css                      # 由 Sine 生成
    Neri -> <repo>                   # symlink；仓库就是 mod
```

`chrome.css` 和 `content.css` 每次 Sine 刷新都会重新生成，不要直接编辑。

## 一次性搭建

以下命令假设 Linux，并且已有一个 Sine 正常工作的 profile。其他系统请自行调整
路径。

```bash
PROFILE_NAME="${PROFILE_NAME:-zen-dev}"
REPO="$HOME/code/browser/zen-neri"
DEV="$HOME/.config/zen/$PROFILE_NAME"
DAILY="$HOME/.config/zen/<existing-profile>"   # 已安装并可正常使用 Sine

# 1. 创建并注册 profile（如果不存在）。
if [ ! -d "$DEV" ]; then
  zen-browser --no-remote -CreateProfile "$PROFILE_NAME $DEV"
fi

# 2. 复制 Sine 引擎（如果缺失）。/opt/zen-browser-bin/config.js 只从 profile
#    的 chrome/ 目录引导 Sine，所以每个 profile 都需要自己的一份引擎。
mkdir -p "$DEV/chrome"
if [ ! -d "$DEV/chrome/JS" ]; then
  cp -a "$DAILY/chrome/JS" "$DEV/chrome/JS"
  cp -a "$DAILY/chrome/utils" "$DEV/chrome/utils"
fi

# 3. 确保 Neri 的 mods.json 条目，并把安装目录替换为 symlink。
mkdir -p "$DEV/chrome/sine-mods"
node - "$DAILY/chrome/sine-mods/mods.json" \
        "$DEV/chrome/sine-mods/mods.json" <<'NODE'
const fs = require("fs");
const [srcPath, dstPath] = process.argv.slice(2);
const readJson = (path) =>
  fs.existsSync(path) ? JSON.parse(fs.readFileSync(path, "utf8")) : {};
const src = readJson(srcPath);
const dst = readJson(dstPath);
const mod = dst["Neri"] || src["Neri"];
if (!mod) {
  throw new Error("找不到 Neri 元数据，请先在某个 profile 安装一次");
}
mod.enabled = true;
mod["no-updates"] = true;
dst["Neri"] = mod;
fs.writeFileSync(dstPath, JSON.stringify(dst));
NODE

if [ -e "$DEV/chrome/sine-mods/Neri" ] && [ ! -L "$DEV/chrome/sine-mods/Neri" ]; then
  mv "$DEV/chrome/sine-mods/Neri" \
    "${TMPDIR:-/tmp}/Neri-backup-$(date +%s)"
fi
ln -sfn "$REPO" "$DEV/chrome/sine-mods/Neri"
readlink -f "$DEV/chrome/sine-mods/Neri"       # 必须输出 $REPO
```

`mods.json` 必须包含 `Neri` 条目。脚本优先保留 dev profile 已有的条目，没有
时从日常 profile 提取；复用的 profile 里其他 Mod 条目不会丢失。如果两个来源
都没有 Neri，先在任意 profile 的 Sine 设置里安装一次，再重新执行这一步。

脚本会把 `Neri` 的 `"no-updates"` 设为 `true`。Sine 更新或重装会替换文件夹并
丢掉 symlink；这个设置可以避免正常启动时动它。

### `user.js`

创建或确认 `<dev-profile>/user.js`。它会在每次启动时重新应用并覆盖
`prefs.js`，因此这些值会一直保持。如果文件已存在，确认这些 pref 都在。

```js
// Sine：加载 .uc.js mod，启用 dev 调色板（Ctrl+Shift+Y），并在测试期间
// 避开引擎/mod 更新。
user_pref("sine.allow-unsafe-js", true);
user_pref("sine.enable-dev", true);
user_pref("sine.auto-updates", false);
user_pref("sine.engine.auto-update", false);

// 快速、空白启动。
user_pref("browser.shell.checkDefaultBrowser", false);
user_pref("browser.startup.page", 0);
user_pref("browser.startup.homepage", "about:blank");
user_pref("browser.startup.homepage_override.mstone", "ignore");
user_pref("browser.sessionstore.resume_from_crash", false);
user_pref("browser.aboutwelcome.enabled", false);
user_pref("browser.tabs.warnOnClose", false);
user_pref("zen.welcome-screen.seen", true);
user_pref("datareporting.policy.dataSubmissionPolicyBypassNotification", true);
user_pref("toolkit.telemetry.reportingpolicy.firstRun", false);

// Browser Toolbox，用于检查 Glance。
user_pref("devtools.chrome.enabled", true);
user_pref("devtools.debugger.remote-enabled", true);
user_pref("devtools.debugger.prompt-connection", false);
```

`sine.allow-unsafe-js` 是必需的。没有它，Sine 会静默跳过所有 `.uc.js`
脚本，Glance 弧线补丁也不会加载。

启动：

```bash
zen-browser --new-instance --profile "$DEV"
```

`--new-instance` 会在日常浏览器运行时启动一个独立进程，并避免把陈旧的
profile lock 误判为已有实例。

验证：

- `about:config` 中 `sine.allow-unsafe-js = true`、`sine.enable-dev = true`。
- `Ctrl+Shift+Y` 打开一个小调色板，包含 **Refresh mod styles** 和
  **Open mod folder**。
- 启动后 `ls -l "$DEV/chrome/sine-mods/Neri"` 仍然是 symlink。
- Glance 以 90% × 90% 打开并居中。

## 日常循环

| 改动 | 操作 |
| --- | --- |
| CSS（`tweaks/10-glance.css`） | 保存 → `Ctrl+Shift+Y` → **Refresh mod styles**。无需重启。 |
| JS（`js/neri-glance.uc.js`） | 保存 → 重启 dev profile。 |
| `theme.json` 元数据 | 安装 mod 时读取，不是实时生效。本地开发忽略它；发布时才重要。 |
| 行为变更 | 更新 [MODIFICATIONS.md](MODIFICATIONS.md) 中对应模块行。 |
| `README.md` / `DEVELOPMENT.md` / `MODIFICATIONS.md` / `AGENTS.md` | 不需要浏览器操作。 |

新增模块遵循同一规则：改 CSS 用 **Refresh mod styles**，改 JS 重启 dev profile。

**为什么 CSS 能重载。** 执行 **Refresh mod styles** 时，Sine 会重新生成
`chrome.css` 并把它作为 user sheet 重新应用。已经打开的界面会立即读到新值。

**为什么 JS 不能。** Sine 的刷新会跳过已经加载、且没有 unload 回调的
`.uc.js`。补丁还会在重复执行时提前返回（guard 标志），所以重启 dev profile
才是可靠的循环。不要在旧 wrapper 仍然安装时清掉 guard，那会叠加多层补丁。

## 检查

- **Browser Toolbox**：Tools → Browser Tools → Browser Toolbox。用 Inspector
  查看目标元素，用 Style Editor 查看导入的样式表。
- **Glance 模块检查**（Browser Toolbox 控制台，Glance 已打开）：

  ```js
  const w = gBrowser.ownerDocument.querySelector(
    ".zen-glance-overlay .browserContainer"
  );
  const p = gBrowser.tabpanels.getBoundingClientRect();
  const r = w.getBoundingClientRect();
  ({
    pctW: r.width / p.width,
    pctH: r.height / p.height,
    dx: r.left + r.width / 2 - (p.left + p.width / 2),
    dy: r.top + r.height / 2 - (p.top + p.height / 2),
  });
  ```

  期望：`pctW` 和 `pctH` 为 `0.9`，`dx` 和 `dy` 在 1 像素以内为 `0`。

### Headless 检查

当前 Glance 模块的自动化检查使用一次性 profile，不要用 dev profile：

```bash
MOZ_REMOTE_ALLOW_SYSTEM_ACCESS=1 \
  zen-browser --headless --marionette --new-instance \
  --profile /tmp/neri-test about:blank
```

Marionette 的 chrome 上下文需要 `MOZ_REMOTE_ALLOW_SYSTEM_ACCESS=1`。连接后
调用 `gZenGlanceManager.openGlance(...)`，并把
`getBoundingClientRect()` 与 `gBrowser.tabpanels` 对比。当前 Glance 模块的
几何检查就是这样跑的。

## 常见坑

1. **没有 symlink 就没有实时编辑。** 如果 `sine-mods/Neri` 是真实文件夹，
   改仓库不会生效，除非手动复制。用 `readlink` 检查。
2. **Sine 更新会替换 symlink。** 不要对 symlink 的 mod 点更新。在 dev
   profile 里保持 `no-updates` 开启、`sine.auto-updates` 关闭。
3. **`mods.json` 才是已安装状态。** 仓库里的 `theme.json` 只在安装时读取。
   改仓库里的 `version`、`style` 或 `scripts` 不会更新正在运行的 Sine 条目。
4. **`sine.allow-unsafe-js` 必须为 true**，否则 userscript 会被静默跳过，
   而且没有明显报错。
5. **import 必须在普通规则之前。** 当前加载
   `@import url("tweaks/10-glance.css");`；新增模块时按序号追加，全部放在
   普通规则之前。
6. **不要留旧文件。** mod 文件夹只应包含 `theme.json`、`userChrome.css`、
   `userContent.css`、当前功能模块文件和文档。已删除的旧主网页 tweak
   （`00-tokens.css`、`10-webview-frame.css`、`20-wider-page.css`）不得重新
   引入。
7. **作用域。** 每次改动只针对一个已登记的功能模块；未涉及的区域保持原生。
   新功能可以改主网页、标签页、侧边栏等，但必须是该模块的明确目标，不能产生
   无关副作用。保持 [MODIFICATIONS.md](MODIFICATIONS.md) 中的范围清单最新。

## 发布检查清单

1. 在 dev profile 中验证改动（目标功能和相邻 UI 回归），并更新
   [MODIFICATIONS.md](MODIFICATIONS.md) 中对应模块行。
2. 更新 `theme.json` 的 `version` 和 `updatedAt`。
3. 更新 `README.md` 中的测试版本行。
4. 检查 `git diff`；从仓库提交并推送。
5. 在日常 profile 中通过 Sine 从仓库安装或更新（不要用 symlink），然后重启。
6. 检查安装文件夹是否有旧文件，并确认当前功能按预期工作。
