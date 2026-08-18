import { test } from 'node:test'
import assert from 'node:assert/strict'
import { toWslPath, buildWslArgv } from '../wsl-shell.mjs'

test('toWslPath：盘符路径映射为 /mnt/<盘符>', () => {
  assert.equal(toWslPath('D:\\Build'), '/mnt/d/Build')
  assert.equal(toWslPath('C:\\Users\\foo\\bar'), '/mnt/c/Users/foo/bar')
  assert.equal(toWslPath('D:/Build'), '/mnt/d/Build')
  assert.equal(toWslPath('D:\\'), '/mnt/d/')
  assert.equal(toWslPath('E:\\a\\b\\c.txt'), '/mnt/e/a/b/c.txt')
})

test('toWslPath：无法映射的路径原样返回', () => {
  assert.equal(toWslPath('/root/test'), '/root/test')
  assert.equal(toWslPath('relative/path'), 'relative/path')
  assert.equal(toWslPath('\\\\wsl.localhost\\Ubuntu\\root'), '\\\\wsl.localhost\\Ubuntu\\root')
  assert.equal(toWslPath(''), '')
  assert.equal(toWslPath(null), null)
  assert.equal(toWslPath(undefined), undefined)
})

test('buildWslArgv：构造 wsl.exe 执行 bash 的 argv', () => {
  assert.deepEqual(buildWslArgv('Ubuntu', 'echo hi', 'D:\\Build'), [
    'wsl.exe',
    '-d',
    'Ubuntu',
    '--cd',
    '/mnt/d/Build',
    '-e',
    'bash',
    '-c',
    'echo hi',
  ])
})

test('buildWslArgv：命令含空格时不拆散', () => {
  const argv = buildWslArgv('Ubuntu', 'ls -la /mnt/d/Build', 'C:\\x')
  assert.equal(argv[argv.length - 1], 'ls -la /mnt/d/Build')
  assert.equal(argv[4], '/mnt/c/x')
})
