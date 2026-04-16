#!/usr/bin/env node

/**
 * Stop hook: blocks session completion when task-pack validation is pending/failing.
 *
 * It reads state written by PostToolUse hook in:
 *   .github/hooks/.task-pack-validation-state.json
 *
 * To avoid infinite loops, it respects `stop_hook_active`.
 */

const fs = require('node:fs')
const path = require('node:path')

const STATE_PATH = path.join(__dirname, '.task-pack-validation-state.json')

function readStdin() {
  return new Promise((resolve) => {
    let input = ''
    process.stdin.on('data', (chunk) => {
      input += chunk
    })
    process.stdin.on('end', () => resolve(input.trim()))
    process.stdin.resume()
  })
}

function readState() {
  if (!fs.existsSync(STATE_PATH)) return { sessions: {} }
  try {
    return JSON.parse(fs.readFileSync(STATE_PATH, 'utf8'))
  } catch {
    return { sessions: {} }
  }
}

function printBlock(reason) {
  const output = {
    hookSpecificOutput: {
      hookEventName: 'Stop',
      decision: 'block',
      reason,
    },
  }

  process.stdout.write(`${JSON.stringify(output)}\n`)
}

async function main() {
  try {
    const raw = await readStdin()
    if (!raw) process.exit(0)

    const payload = JSON.parse(raw)
    const sessionId = payload.sessionId || ''
    const stopHookActive = Boolean(payload.stop_hook_active)

    if (!sessionId || stopHookActive) {
      process.exit(0)
    }

    const state = readState()
    const sessionState = state.sessions?.[sessionId]

    if (!sessionState || !sessionState.pending) {
      process.exit(0)
    }

    const failedStories = Array.isArray(sessionState.failedStories)
      ? sessionState.failedStories.filter(Boolean)
      : []

    const suffix = failedStories.length > 0 ? `: ${failedStories.join(', ')}` : ''
    printBlock(`Task-pack validation still failing${suffix}. Fix tasks until validate-task-pack passes, then stop.`)

    process.exit(0)
  } catch {
    // Non-blocking on runtime/parsing failures.
    process.exit(0)
  }
}

main()
