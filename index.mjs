// index.mjs — dsh-bash-wsl 宿主面（唯一依赖 DSH 宿主服务的文件）。
//
// 注册一个独立的 `bash` 工具：把命令经 wsl.exe 路由到 WSL 执行，工作目录自动映射
// （D:\Build → /mnt/d/Build）。
//
// 注：不注册 ctx.shell——Windows 侧 ctx.shell 已被 pwsh 执行器（SandboxPwshExecutor）
// 占用，注册会冲突。改为独立工具，保留 pwsh 的同时新增 WSL bash。
// 前台执行（V1）；后台任务 / sandbox 升级留待 V2。

import { execFile } from 'node:child_process'
import { buildWslArgv } from './wsl-shell.mjs'

const DEFAULT_DISTRO = 'Ubuntu'
const DEFAULT_TIMEOUT_MS = 120000
const MAX_BUFFER = 64 * 1024 * 1024

function runWsl(distro, command, workdir, timeoutMs) {
  const argv = buildWslArgv(distro, command, workdir)
  return new Promise((resolve) => {
    execFile(
      argv[0],
      argv.slice(1),
      { maxBuffer: MAX_BUFFER, timeout: timeoutMs, windowsHide: true },
      (err, stdout, stderr) => {
        const lines = []
        if (stdout) lines.push(...stdout.replace(/\r\n/g, '\n').split('\n'))
        if (stderr) lines.push(...stderr.replace(/\r\n/g, '\n').split('\n'))
        let ok = false
        let exitCode = 1
        if (err) {
          if (err.killed) {
            lines.push(`[timeout after ${timeoutMs}ms]`)
          } else if (typeof err.code === 'number') {
            exitCode = err.code
            lines.push(`[exit code: ${err.code}]`)
          } else {
            lines.push(`[spawn failed: ${err.message || String(err)}]`)
          }
        } else {
          ok = true
          exitCode = 0
        }
        resolve({ ok, exitCode, lines })
      },
    )
  })
}

export default {
  name: 'dsh-bash-wsl',
  inject: ['tools'],
  apply(ctx, config = {}) {
    const distro =
      config && typeof config.distro === 'string' && config.distro.length > 0
        ? config.distro
        : DEFAULT_DISTRO
    const timeoutMs = Number(config.timeoutMs) || DEFAULT_TIMEOUT_MS
    const defaultWorkdir = config.cwd || process.cwd()

    ctx.effect(() =>
      ctx.tools.register({
        name: 'bash',
        description:
          '在 WSL 内执行 bash 命令（Windows 端 dsh 的 Linux 后端）。工作目录自动从 Windows 路径映射到 WSL 路径（D:\\Build → /mnt/d/Build）。',
        parameters: {
          type: 'object',
          properties: {
            command: { type: 'string', description: '要在 WSL 内执行的 bash 命令' },
            workdir: {
              type: 'string',
              description: '工作目录（Windows 路径，自动映射到 /mnt/...；缺省用会话 cwd）',
            },
          },
          required: ['command'],
        },
        output: {
          schema: {
            type: 'object',
            properties: {
              ok: { type: 'boolean', description: '是否成功（exit 0）' },
              exitCode: { type: 'number', description: '退出码' },
              lines: { type: 'array', items: { type: 'string' }, description: '输出行' },
            },
            required: ['ok', 'exitCode', 'lines'],
            additionalProperties: false,
          },
          render: (_args, value) => [{ type: 'text', text: value.lines.join('\n') }],
        },
        async execute(args, exec) {
          try {
            const sessionCwd =
              exec && exec.agent && exec.agent.session && exec.agent.session.header
                ? exec.agent.session.header.cwd
                : undefined
            const workdir = args.workdir || sessionCwd || defaultWorkdir
            return await runWsl(distro, args.command, workdir, timeoutMs)
          } catch (e) {
            return { ok: false, exitCode: 1, lines: ['错误：' + (e && e.message ? e.message : String(e))] }
          }
        },
      }),
    )
  },
}
