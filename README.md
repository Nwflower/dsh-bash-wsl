# dsh-bash-wsl

Route the Windows-side DeepSeek Harness `bash` tool into WSL: commands run inside the WSL distro, with the working directory auto-mapped from `D:\Build` to `/mnt/d/Build`.

## Install

```sh
dsh plugin --profile web add -w link:<repo-path>
# or inject at runtime: dev_inject_plugin <repo-absolute-path>
```

## Config

```yaml
- insert:
    - id: dsh-bash-wsl
      name: dsh-bash-wsl
      config:
        distro: Ubuntu   # WSL distro name (default: Ubuntu)
```

## How it works

Registers a standalone `bash` tool that runs
`wsl.exe -d <distro> --cd <wsl-workdir> -e bash -c <cmd>`, mapping the Windows
workdir (`D:\...`) to its WSL path (`/mnt/d/...`). It does not occupy `ctx.shell`
(already taken by the pwsh executor on Windows), so `bash` and `pwsh` coexist.

See `docs/design.md` for architecture and `dev/REQUIREMENTS.md` for the full spec.

## vs. dsh-plugin-bash-wsl

A more feature-complete sibling, [`dsh-plugin-bash-wsl`](https://github.com/tianyu030225-lang/dsh-wsl-bash), provides persistent WSL shells, Git Bash, `bwrap` sandboxing, and a `doctor` diagnostic. This plugin deliberately takes the opposite trade-off — **minimal and zero-dependency**:

| | dsh-bash-wsl | dsh-plugin-bash-wsl |
|---|---|---|
| One-shot WSL command | ✅ `bash` | ✅ `wsl_bash` |
| Persistent shell | ❌ | ✅ `bash` |
| Git Bash | ❌ | ✅ `git_bash` |
| Sandbox (`bwrap`) | ❌ | ✅ |
| `doctor` diagnostic | ❌ | ✅ |
| Extra deps in WSL | none | `bwrap` / `script` / `realpath` |

Choose this plugin when you want the lightest possible WSL bash with automatic `/mnt` workdir mapping and no extra WSL dependencies.
