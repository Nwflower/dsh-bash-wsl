# dsh-bash-wsl

把 Windows 侧 DeepSeek Harness 的 `bash` 工具路由到 WSL：命令在 WSL 发行版内执行，工作目录自动从 `D:\Build` 映射为 `/mnt/d/Build`。

## 安装

```sh
dsh plugin --profile web add -w link:<仓库路径>
# 或运行时注入：dev_inject_plugin <仓库绝对路径>
```

## 配置

```yaml
- insert:
    - id: dsh-bash-wsl
      name: dsh-bash-wsl
      config:
        distro: Ubuntu   # WSL 发行版名（缺省 Ubuntu）
```

## 原理

注册一个独立的 `bash` 工具，跑
`wsl.exe -d <发行版> --cd <wsl工作目录> -e bash -c <cmd>`，并把 Windows 工作目录
（`D:\...`）映射为 WSL 路径（`/mnt/d/...`）。不占用 `ctx.shell`（Windows 侧已被 pwsh
执行器占用），`bash` 与 `pwsh` 共存。

架构见 `docs/design.md`，完整需求见 `dev/REQUIREMENTS.md`。

## 与 dsh-plugin-bash-wsl 的区别

更完整的同类插件 [`dsh-plugin-bash-wsl`](https://github.com/tianyu030225-lang/dsh-wsl-bash) 已经提供持久化 WSL shell、Git Bash、`bwrap` 沙箱和 `doctor` 诊断。本插件刻意走**极简、零依赖**的相反路线：

| | dsh-bash-wsl | dsh-plugin-bash-wsl |
|---|---|---|
| 一次性 WSL 命令 | ✅ `bash` | ✅ `wsl_bash` |
| 持久化 shell | ❌ | ✅ `bash` |
| Git Bash | ❌ | ✅ `git_bash` |
| 沙箱（bwrap） | ❌ | ✅ |
| doctor 诊断 | ❌ | ✅ |
| WSL 内额外依赖 | 无 | bwrap / script / realpath |

想要最轻量、自动 `/mnt` 路径映射、且不在 WSL 里装额外依赖时，选本插件。
