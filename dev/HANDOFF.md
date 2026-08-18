# 交接笔记（dsh-bash-wsl）

## 当前状态

V1 立项完成，进入原型开发。

## 已确认的关键事实

- DSH 无内置 WSL 集成（核心 grep `wsl.exe` 为空）。
- `dsh-shell` 提供 `ShellExecutor`（`ctx.shell` 缝）；`dsh-bash-local` 用 `["bash","-c",cmd]` spawn，注释明确预留「替换 shell argv」的子类化扩展点（`runArgv`/`startArgv`）。
- 生态（dsh.so / dshplugin.dev / awesome-dsh-plugin）无 WSL bash 路由插件——空白。
- Windows 侧 `bash` 工具当前禁用（无本地 bash）。
- **关键决策**：`ctx.shell` 在 Windows 侧已被 `SandboxPwshExecutor`（pwsh）注册，重复注册冲突。故本插件改为注册**独立 `bash` 工具**（`ctx.tools.register`），与 pwsh 共存。
- **V1 已跑通**：`wsl.exe -d Ubuntu --cd /mnt/d/Build -e bash -c "pwd"` 返回 `/mnt/d/Build`，且在 WSL Linux 内核执行。
- **定位决策（方案 B）**：发现已有 `dsh-plugin-bash-wsl`（持久化 + git_bash + bwrap + doctor，更全）。本插件走「极简、零依赖」差异化：只做一次性 WSL bash + 路径映射，不引入 bwrap 依赖。README 已注明区别。

## 待办 / 风险

- [ ] distro 配置项如何进入 Config schema（V1 暂用 `DEFAULT_DISTRO='Ubuntu'` 回退 + 读 `config.distro`，若被 schemastery 剥离则需 extend Config）。
- [ ] `wsl.exe --cd` 与 `-e` 组合的实际行为需实测（Windows cwd 传给 wsl.exe，`--cd` 设 WSL 侧 cwd）。
- [ ] 后台任务（`start`）跨 WSL 的进程清理语义。
- [ ] UNC / 相对路径的映射边界（V1 原样返回）。

## 验证方式

`dev_inject_plugin D:\Build\dsh-bash-wsl` → Windows 端会话调 `bash`，确认命令落在 WSL（cwd 为 `/mnt/...`）。
