# 开发路线（dsh-bash-wsl）

## V1（当前）：WSL bash 执行器

目标：Windows 端 `bash` 工具落到 WSL，cwd 自动映射 `/mnt/d/Build`，绕开「WSL 内 dsh 对 9P 盘做 inotify 卡死」的坑。

- [x] 目录结构 + 骨架（package.json / cordis.patch.yml / AGENTS.md / CLAUDE.md）
- [x] dev/ 需求（REQUIREMENTS.md）与本文档
- [x] docs/ 设计（design.md）与调研（study.md）
- [x] `wsl-shell.mjs` 纯逻辑：`toWslPath` + `buildWslArgv`
- [x] `index.mjs` 宿主面：注册独立 `bash` 工具（`ctx.tools.register` + `execFile` 跑 `wsl.exe`）
- [x] `test/wsl-shell.test.mjs` 单测（4/4 绿）
- [x] 注入 + 验证 bash 走 WSL（`pwd` → `/mnt/d/Build`，Linux 内核）

## V2：fs 路径映射

目标：fs 工具双向映射 `/mnt/d` ↔ `D:`，模型无感。

## V3：env / terminal

目标：环境变量同步、持久 terminal 会话路由到 WSL。
