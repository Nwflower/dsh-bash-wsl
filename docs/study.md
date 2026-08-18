# 立项调研（dsh-bash-wsl）

## 背景：WSL 内 dsh 的 9P 卡死

- WSL 内 dsh 把 `/mnt/d/Build`（9P 挂载）设为工作区，启动时 `inotify_add_watch` → `p9_client_rpc` 内核态挂死（D 状态），整个服务器无响应（内核栈实锤）。
- 根因：WSL2 对 9P/drvfs 做 inotify 不可靠、可挂起。

## 现有实现盘点

| 组件 | 现状 |
|---|---|
| `dsh-shell` | 抽象 `ctx.shell` 缝（`ShellExecutor`） |
| `dsh-bash-local` | 只 spawn 本地 `bash -c`，无 WSL 感知 |
| `dsh-terminal-bash` | 持久 PTY 后端，无 WSL 感知 |
| DSH 核心 grep `wsl.exe` / `/mnt/c` | 空——无内置 WSL 集成 |

## 生态检索

- `dsh.so`（2058 artifacts）、`dshplugin.dev`、`awesome-dsh-plugin` 检索：**无 WSL bash 路由 / 路径映射插件**。
- 结论：空白，需自建。

## 为什么走「Win 端跑 + bash 落 WSL」

- 避开 WSL 内 dsh 的 9P inotify 坑（dsh 进程在 Win 端原生访问 Windows 文件系统）。
- 同时保留 Linux 工具链（通过 bash → WSL）。
- 这是比「WSL 内 dsh + /mnt/d 工作区」更稳的架构。

## 结论

自建 `dsh-bash-wsl`：复用 `ShellExecutor` 缝，子类化 `LocalBashExecutor` 替换 argv 为 `wsl.exe`，核心约 50–100 行。
