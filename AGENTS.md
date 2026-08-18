# AGENTS.md

`dsh-bash-wsl` 是 DeepSeek Harness 的 Host 插件：把 Windows 侧 dsh 的 `bash` 工具路由到 WSL 执行（注册独立 `bash` 工具，不占用 `ctx.shell`），并自动把工作目录从 Windows 路径（`D:\Build`）映射为 WSL 路径（`/mnt/d/Build`）。DSH 的哲学是 **everything is a plugin**——本仓库只做插件，不碰引擎。改代码前先读 `docs/design.md`（架构）、`dev/REQUIREMENTS.md`（需求）与 `docs/study.md`（立项调研）。

## 仓库布局：发布面 / 文档面 / 工程面

根目录只放发布到 GitHub / npm 的文件；文档进 `docs/`，本地工程文件进 `dev/`（二者不进 npm 包，但会提交进 git）。**不要把所有东西堆进 README**——README 是对外契约（精简），细节下沉到 docs/ 和 dev/。

```
index.mjs          插件 host 面（唯一依赖 DSH 宿主服务的文件）：WSL bash 执行器
wsl-shell.mjs      纯逻辑核心（零 DSH 依赖、可独立单测）：路径映射 + wsl.exe argv 构造
cordis.patch.yml   bundle 声明（insert dsh-bash-wsl）
package.json       npm 包元数据；files 白名单 = 发布内容
README.md          对外契约（英文，GitHub/npm 默认）；README.zh-CN.md 中文版——行为变更必须同步两版
AGENTS.md          本文件：agent 协作规范
LICENSE            MIT
test/              单测 + mock ctx 集成测试（进 GitHub，不进 npm 包）
docs/              文档面：design.md 架构设计、study.md 立项调研
dev/               工程面：REQUIREMENTS.md 需求清单、ROADMAP.md 开发路线、HANDOFF.md 交接、bin/ 脚本、夹具
```

- `package.json` 的 `files` 白名单就是 npm 发布面。新增被 `index.mjs` import 或 README 引用的文件必须同步加进 `files`。
- **永不提交**：`node_modules/`、`*.log`、`*.tgz`、`.prev-session*.jsonl`、任何凭据/密钥。

## 命令

```sh
npm test        # node --test 跑 test/*.test.mjs（纯逻辑单测 + mock ctx 集成测试）
```

无构建步骤：纯 ESM。手工验证：`dev_inject_plugin <本仓库绝对路径>` 后，在 Windows 端会话里调用 `bash` 工具，确认命令确实落到 WSL（输出里有 `/mnt/...` cwd，或 `wsl -e` 进程可见）。

## 分支纪律

- `main` 是稳定主干：每个 commit 都可通过。
- 开发在 `dev` 分支；一个需求一个 commit（conventional 前缀）；完成后 `git checkout main && git merge dev`（线性，先 rebase 再 fast-forward）。
- push 前 `git pull --rebase origin main`。

## 提交纪律

- **conventional commit 前缀**：`feat:` / `fix:` / `refactor:` / `chore:` / `docs:` / `test:`，中文描述。
- **一个逻辑变更一个 commit**：不混改，不提交 WIP。
- **提交前必过**：① `npm test` 全绿；② `git status` 无杂物；③ `git diff --cached --check` 无空白错误。
- **行为变更同 commit 更新 README 与测试**：README 是对外契约，测试描述现有行为。

## DSH 插件约束

- **只消费 host 公开服务**：`tools`（经 `ctx.tools.register`）。注册独立 `bash` 工具。
- **插件，不是引擎改动**：注册 `bash` 工具跑 `wsl.exe`，绝不改 DSH 引擎。
- **不占用 `ctx.shell`**：Windows 侧 `ctx.shell` 已被 `SandboxPwshExecutor`（pwsh）注册，重复注册会冲突。
- **失败要大声**：WSL 不可达、distro 不存在、workdir 映射失败都要显式报告，绝不静默吞掉。

## 质量约定

- 文件以**恰好一个**换行结尾；空 `catch` 必须说明吞掉什么且 `try` 只包一条语句。
- 保持 `wsl-shell.mjs` 零 DSH 依赖纯函数：任何 DSH 依赖只允许出现在 `index.mjs`。
- 测试描述行为而非背书正确性；夹具用合成数据，永不掺真实 transcript。

## 编辑本文件

规则保持自包含；改完须与仓库现状一致（目录、命令、约束过时了要同步更新）。
