#!/usr/bin/env node

/**
 * PreToolUse guard for agile log/index files.
 *
 * Blocks direct edits to:
 * - Docs/agile/backlog-index.json
 * - Docs/agile/timeline.jsonl
 *
 * Rationale: these files are derived/append-only and should be maintained
 * through hook automation and shared function scripts.
 */

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

function normalizePath(value) {
  if (!value || typeof value !== 'string') return ''
  return value.replace(/\\/g, '/')
}

function extractPatchPaths(patchText) {
  if (!patchText || typeof patchText !== 'string') return []
  const paths = []
  const re = /^\*\*\*\s+(?:Update|Add|Delete) File:\s+(.+)$/gm
  let m
  while ((m = re.exec(patchText)) !== null) {
    paths.push(m[1].trim())
  }
  return paths
}

function collectPaths(value, out = []) {
  if (!value) return out

  if (typeof value === 'string') {
    if (value.includes('/')) out.push(value)
    return out
  }

  if (Array.isArray(value)) {
    for (const item of value) collectPaths(item, out)
    return out
  }

  if (typeof value === 'object') {
    const directKeys = [
      'filePath',
      'file_path',
      'targetFile',
      'target_file',
      'path',
      'paths',
      'files',
      'includePattern',
    ]

    for (const key of directKeys) {
      if (key in value) collectPaths(value[key], out)
    }

    if (typeof value.input === 'string') {
      collectPaths(extractPatchPaths(value.input), out)
    }

    for (const nestedValue of Object.values(value)) {
      if (nestedValue && typeof nestedValue === 'object') {
        collectPaths(nestedValue, out)
      }
    }
  }

  return out
}

function isProtectedPath(filePath) {
  const p = normalizePath(filePath)
  return (
    p.endsWith('/Docs/agile/backlog-index.json') ||
    p.endsWith('/Docs/agile/timeline.jsonl') ||
    p.endsWith('Docs/agile/backlog-index.json') ||
    p.endsWith('Docs/agile/timeline.jsonl') ||
    p.endsWith('/agile/backlog-index.json') ||
    p.endsWith('/agile/timeline.jsonl')
  )
}

function asDeny(reason) {
  const output = {
    hookSpecificOutput: {
      hookEventName: 'PreToolUse',
      permissionDecision: 'deny',
      permissionDecisionReason: reason,
    },
  }

  process.stdout.write(`${JSON.stringify(output)}\n`)
}

async function main() {
  try {
    const raw = await readStdin()
    if (!raw) process.exit(0)

    const payload = JSON.parse(raw)
    const toolInput = payload.tool_input || {}

    const paths = [...new Set(collectPaths(toolInput).map(normalizePath).filter(Boolean))]
    const blocked = paths.find(isProtectedPath)

    if (blocked) {
      asDeny(
        `Direct edits to ${blocked} are blocked. Use hook automation and shared functions for backlog/timeline maintenance.`
      )
    }

    process.exit(0)
  } catch {
    // Non-blocking on parsing/runtime failures.
    process.exit(0)
  }
}

main()
