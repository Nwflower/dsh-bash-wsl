# 需求清单（dsh-bash-wsl）

## V1 —— WSL bash 工具（当前）

- **REQ-01** 注册独立的 `bash` 工具（经 `ctx.tools.register`）：命令经 `wsl.exe` 在 WSL 发行版内执行。
- **REQ-02** workdir 映射：宿主工作目录 `D:\Build` 自动映射为 `/mnt/d/Build`（盘符→`/mnt/<小写>`，`\`→`/`）。
- **REQ-03** distro 可配置：默认 `Ubuntu`，config 可覆盖；WSL 不可达 / distro 不存在时显式报错。
- **REQ-04** 前台执行：`execFile` + 超时（默认 120s）+ 输出预算（maxBuffer 64MB）；后台任务留待 V2。
- **REQ-05** 退出码 / 超时 / spawn 失败显式报告（`[exit code: N]` / `[timeout ...]` / `[spawn failed ...]`）。
- **REQ-06** 与 pwsh 工具共存：**不占用 `ctx.shell`**（Windows 侧已被 `SandboxPwshExecutor` 注册）。

## V2 —— 增强（规划）

- **REQ-10** fs 工具（read/write/edit/glob/grep）双向路径映射：`/mnt/d/...` ↔ `D:\...`。
- **REQ-11** bash 输出中的 `/mnt/...` 路径反向映射回 Windows 路径。
- **REQ-12** 后台任务（`start`）+ `ctx.subprocess` 集成（sandbox / 进程组清理）。
- **REQ-13** 环境变量同步：把宿主 env 透传给 WSL。

## V3 —— 增强（规划）

- **REQ-20** terminal 持久会话路由到 WSL。
