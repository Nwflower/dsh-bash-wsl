// wsl-shell.mjs — dsh-bash-wsl 纯逻辑核心（零 DSH 依赖，可独立单测）。
//
// 职责：
//   1. toWslPath：把 Windows 路径映射为 WSL 路径（D:\Build → /mnt/d/Build）；
//   2. buildWslArgv：构造 wsl.exe 执行 bash 的 argv。
//
// 规则：盘符 → /mnt/<小写>，`\` → `/`；未匹配（相对路径、UNC、非 Windows 路径）原样返回。

export function toWslPath(p) {
  if (typeof p !== 'string' || p.length === 0) return p
  const m = /^([A-Za-z]):[\\/](.*)$/.exec(p)
  if (m) {
    const drive = m[1].toLowerCase()
    const rest = m[2].replace(/\\/g, '/')
    return `/mnt/${drive}/${rest}`
  }
  return p
}

export function buildWslArgv(distro, command, workdir) {
  const wslWorkdir = toWslPath(workdir)
  return ['wsl.exe', '-d', distro, '--cd', wslWorkdir, '-e', 'bash', '-c', command]
}
