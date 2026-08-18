# 架构设计（dsh-bash-wsl）

## 目标

让 Windows 侧 dsh 的 `bash` 工具在 WSL 内执行，从而：

1. 使用 Linux 工具链与 `/mnt/...` 路径；
2. 绕开「WSL 内 dsh 对 9P 盘做 inotify 卡死」的坑——dsh 进程在 Win 端原生访问 Windows 文件系统，只有 bash 落到 WSL。

## 为什么是独立工具而非 ctx.shell 缝

- `dsh-shell` 定义 `ShellExecutor`（注册为 `ctx.shell`，一个实现 per context）。
- **Windows 侧 `ctx.shell` 已被 pwsh 执行器 `SandboxPwshExecutor`（`dsh-pwsh-sandbox`）占用**；再注册第二个 `ctx.shell` 会报 `service "shell" has been registered` 冲突。
- 因此本插件**注册一个独立的 `bash` 工具**（`ctx.tools.register`），不碰 `ctx.shell`，保留 pwsh 的同时新增 WSL bash。

## 方案

注册 `bash` 工具，`execute` 用 `child_process.execFile` 跑：

```
["wsl.exe", "-d", <distro>, "--cd", <wslWorkdir>, "-e", "bash", "-c", cmd]
```

工作目录 `D:\Build` 映射为 `/mnt/d/Build`（盘符 → `/mnt/<小写>`，`\` → `/`）。

## 路径映射

```
toWslPath("D:\\Build")     → /mnt/d/Build
toWslPath("C:\\Users\\x")  → /mnt/c/Users/x
```

未匹配（相对路径、UNC、非 Windows 路径）原样返回。

## 边界与权衡

- 前台执行（V1）；后台任务 / `ctx.subprocess` 集成 / sandbox 升级留待 V2。
- distro 默认 `Ubuntu`，config 可覆盖。
- `--cd` 设 WSL 侧工作目录（已实测：`pwd` 返回 `/mnt/d/Build`）。
- V2 的 fs 路径映射是**正交的另一个关注点**，不在本工具内做。
