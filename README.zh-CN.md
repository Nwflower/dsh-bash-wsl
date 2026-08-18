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
