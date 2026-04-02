import { spawn, spawnSync } from 'node:child_process'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const cwd = path.resolve(__dirname, '..')
const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm'
const nextArgs = process.argv.slice(2)

function run(label, args) {
  const child = spawn(npmCmd, ['exec', '--', ...args], {
    cwd,
    env: process.env,
    stdio: 'inherit',
  })

  child.on('error', (error) => {
    console.error(`[${label}] failed to start`, error)
  })

  return child
}

const initialBuild = spawnSync(
  npmCmd,
  ['exec', '--', 'velite', 'build', '--clean'],
  {
    cwd,
    env: process.env,
    stdio: 'inherit',
  }
)

if (initialBuild.status !== 0) {
  process.exit(initialBuild.status ?? 1)
}

const children = [
  run('velite', ['velite', 'dev']),
  run('next', ['next', 'dev', ...nextArgs]),
]

let shuttingDown = false

function shutdown(signal = 'SIGTERM') {
  if (shuttingDown) {
    return
  }

  shuttingDown = true

  for (const child of children) {
    if (!child.killed) {
      child.kill(signal)
    }
  }
}

for (const child of children) {
  child.on('exit', (code, signal) => {
    if (!shuttingDown) {
      shutdown(signal ?? 'SIGTERM')
      process.exit(code ?? 0)
    }
  })
}

process.on('SIGINT', () => shutdown('SIGINT'))
process.on('SIGTERM', () => shutdown('SIGTERM'))
