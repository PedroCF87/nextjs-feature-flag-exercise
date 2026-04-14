#!/usr/bin/env node

/**
 * Auto-log agile artifact operations from VS Code Agent Hooks.
 *
 * Reads hook payload from stdin and:
 * - regenerates agile/backlog-index.json after edits in agile/** (recursive .md)
 * - appends timeline entries for created/updated markdown artifacts in agile/
 */

const fs = require('node:fs')
const path = require('node:path')
const { spawnSync } = require('node:child_process')

const DOCS_ROOT = path.resolve(__dirname, '..', '..')
const WORKSPACE_ROOT = path.resolve(DOCS_ROOT, '..')
const TASK_PACK_STATE_PATH = path.join(__dirname, '.task-pack-validation-state.json')

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

function runNode(scriptPath, args = [], options = {}) {
  const result = spawnSync('node', [scriptPath, ...args], {
    encoding: 'utf8',
    cwd: options.cwd || DOCS_ROOT,
    stdio: ['ignore', 'pipe', 'pipe'],
  })

  return {
    ok: result.status === 0,
    status: result.status,
    stdout: (result.stdout || '').trim(),
    stderr: (result.stderr || '').trim(),
  }
}

function readTaskPackState() {
  if (!fs.existsSync(TASK_PACK_STATE_PATH)) return { sessions: {} }
  try {
    return JSON.parse(fs.readFileSync(TASK_PACK_STATE_PATH, 'utf8'))
  } catch {
    return { sessions: {} }
  }
}

function writeTaskPackState(state) {
  const safeState = state && typeof state === 'object' ? state : { sessions: {} }
  if (!safeState.sessions || typeof safeState.sessions !== 'object') {
    safeState.sessions = {}
  }
  fs.writeFileSync(TASK_PACK_STATE_PATH, `${JSON.stringify(safeState, null, 2)}\n`, 'utf8')
}

function normalizePath(value) {
  if (!value || typeof value !== 'string') return ''
  return value.replace(/\\/g, '/')
}

function getArtifactType(filePath) {
  if (filePath.includes('/agile/tasks/')) return 'task'
  if (filePath.includes('/agile/stories/')) return 'story'
  if (filePath.includes('/agile/epics/')) return 'epic'
  return 'artifact'
}

function getArtifactId(filePath) {
  const base = path.basename(filePath, '.md')

  // Match only the ID segment (e.g. E0S1T0 from task-E0S1T0-bootstrap-ai-layer)
  const taskMatch = base.match(/task-(E\d+S\d+T\d+)/i)
  if (taskMatch) {
    return taskMatch[1].toUpperCase().replace(/^E(\d+)S(\d+)T(\d+)$/, 'E$1-S$2-T$3')
  }

  const storyMatch = base.match(/story-(E\d+S\d+)/i)
  if (storyMatch) {
    return storyMatch[1].toUpperCase().replace(/^E(\d+)S(\d+)$/, 'E$1-S$2')
  }

  const epicMatch = base.match(/epic\s*([0-9]+)/i)
  if (epicMatch) return `EPIC-${epicMatch[1]}`

  return base
}

function inferStoryAndEpic(artifactId) {
  const story = artifactId.match(/E\d+-S\d+/)?.[0]
  const epic = artifactId.match(/E(\d+)-S\d+/)?.[1]
  return {
    story: story || '',
    epic: epic ? `EPIC-${epic}` : '',
  }
}

function toTimelineArtifactFile(filePath) {
  const normalized = normalizePath(filePath)
  if (!normalized) return 'Docs/agile/unknown.md'

  if (normalized.includes('/Docs/')) {
    return `Docs/${normalized.split('/Docs/').pop()}`
  }

  if (normalized.startsWith('Docs/')) {
    return normalized
  }

  if (normalized.startsWith('agile/')) {
    return `Docs/${normalized}`
  }

  return `Docs/${normalized.replace(/^\/+/, '')}`
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

function normalizeAndDedupePaths(paths) {
  const set = new Set()
  for (const raw of paths) {
    const normalized = normalizePath(raw)
    if (!normalized) continue
    if (!normalized.includes('.')) continue
    set.add(normalized)
  }
  return [...set]
}

function storyIdFromTaskPath(filePath) {
  const base = path.basename(filePath, '.md')
  const m = base.match(/^task-E(\d+)S(\d+)T\d+/i)
  if (!m) return ''
  return `E${m[1]}-S${m[2]}`
}

function isAgileMarkdown(filePath) {
  return filePath.endsWith('.md') && filePath.includes('/agile/')
}

function isDashboardRelevantPath(filePath) {
  return (
    filePath.endsWith('/agile/timeline.jsonl') ||
    filePath.endsWith('/agile/backlog-index.json') ||
    filePath.endsWith('/.agents/templates/friction-log.md')
  )
}

function resolveAction(toolName) {
  const createdTools = new Set(['create_file'])
  const updatedTools = new Set([
    'replace_string_in_file',
    'multi_replace_string_in_file',
    'apply_patch',
    'edit_file',
    'editFiles',
  ])

  if (createdTools.has(toolName)) return 'created'
  if (updatedTools.has(toolName)) return 'updated'
  return ''
}

/**
 * Extracts the first H1 or H2 heading from markdown content,
 * stripping inline formatting characters.
 */
function extractTitleFromMarkdown(content) {
  if (!content || typeof content !== 'string') return ''
  const m = content.match(/^#{1,2}\s+(.+)$/m)
  return m ? m[1].replace(/[*_`]/g, '').trim() : ''
}

/**
 * Generates a human-readable notes string for a timeline entry by
 * inspecting the tool name and its input payload.
 *
 * Priority:
 *   1. toolInput.explanation  — provided by multi_replace_string_in_file
 *   2. H1/H2 heading from create_file content
 *   3. Contextual line from replace_string_in_file oldString
 *   4. Generic fallback
 */
function generateNotes(toolName, toolInput, artifactId, artifactType, action) {
  const label = `${artifactType[0].toUpperCase()}${artifactType.slice(1)} ${artifactId}`

  // 1. Use explanation field (multi_replace_string_in_file provides this)
  if (toolInput.explanation && typeof toolInput.explanation === 'string') {
    const s = toolInput.explanation.trim().replace(/\s+/g, ' ')
    return s.length > 120 ? `${s.slice(0, 117)}...` : s
  }

  // 2. For create_file: extract title from markdown content
  if (toolName === 'create_file' && toolInput.content) {
    const title = extractTitleFromMarkdown(String(toolInput.content))
    if (title) {
      const t = title.length > 80 ? `${title.slice(0, 77)}...` : title
      return `${label} created — ${t}`
    }
    return `${label} created`
  }

  // 3. For replace_string_in_file: summarize what changed
  if (toolName === 'replace_string_in_file' && toolInput.oldString) {
    const old = String(toolInput.oldString).trim()
    if (/Last updated/i.test(old)) return `${label} updated — Last updated timestamp refreshed`
    if (/\| Status \|/i.test(old)) return `${label} updated — status field changed`
    const firstLine = old.split('\n')[0].replace(/^\s*[|#*>-]+\s*/, '').trim().slice(0, 70)
    if (firstLine) return `${label} updated — near: ${firstLine}`
    return `${label} updated`
  }

  // 4. Fallback
  return `Auto-logged by VS Code PostToolUse hook`
}

function toAbsoluteFsPath(filePath) {
  const normalized = normalizePath(filePath)
  if (!normalized) return ''

  if (path.isAbsolute(normalized)) return normalized
  if (normalized.startsWith('Docs/')) return path.join(WORKSPACE_ROOT, normalized)
  if (normalized.startsWith('agile/')) return path.join(DOCS_ROOT, normalized)
  return path.join(WORKSPACE_ROOT, normalized)
}

function parseResponsibleAgentsFromMarkdown(filePath) {
  const absPath = toAbsoluteFsPath(filePath)
  if (!absPath || !fs.existsSync(absPath)) return []

  let content = ''
  try {
    content = fs.readFileSync(absPath, 'utf8')
  } catch {
    return []
  }

  const rowMatch = content.match(/^\|\s*\*\*Responsible agent\*\*\s*\|\s*(.+?)\s*\|\s*$/im)
  if (!rowMatch) return []

  const raw = rowMatch[1]
  const cleaned = raw
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[*`]/g, '')
    .replace(/\s+/g, ' ')
    .trim()

  if (!cleaned) return []

  return cleaned
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean)
}

function parseResponsibleAgentsFromMarkdownContent(content) {
  if (!content || typeof content !== 'string') return []

  const rowMatch = content.match(/^\|\s*\*\*Responsible agent\*\*\s*\|\s*(.+?)\s*\|\s*$/im)
  if (!rowMatch) return []

  const cleaned = rowMatch[1]
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[*`]/g, '')
    .replace(/\s+/g, ' ')
    .trim()

  if (!cleaned) return []

  return cleaned
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean)
}

function resolveTimelineAgent(payload, toolInput, filePath, artifactType) {
  const payloadAgentKeys = ['agent', 'agent_name', 'agentName', 'participant', 'role', 'mode']

  for (const key of payloadAgentKeys) {
    if (typeof payload[key] === 'string' && payload[key].trim()) {
      return payload[key].trim()
    }
  }

  if (artifactType === 'task' || artifactType === 'story') {
    if (typeof toolInput.content === 'string') {
      const ownersFromContent = parseResponsibleAgentsFromMarkdownContent(toolInput.content)
      if (ownersFromContent.length === 1) return `copilot-hook:${ownersFromContent[0]}`
      if (ownersFromContent.length > 1) {
        return `copilot-hook:${ownersFromContent[0]}+${ownersFromContent.length - 1}`
      }
    }

    const owners = parseResponsibleAgentsFromMarkdown(filePath)
    if (owners.length === 1) return `copilot-hook:${owners[0]}`
    if (owners.length > 1) return `copilot-hook:${owners[0]}+${owners.length - 1}`
  }

  return 'copilot-hook'
}

async function main() {
  try {
    const raw = await readStdin()
    if (!raw) process.exit(0)

    const payload = JSON.parse(raw)
    const toolName = payload.tool_name || ''
    const toolInput = payload.tool_input || {}
    const sessionId = payload.sessionId || ''

    const touchedPaths = normalizeAndDedupePaths(collectPaths(toolInput))
    const agileMarkdownPaths = touchedPaths.filter(isAgileMarkdown)
    const taskMarkdownPaths = agileMarkdownPaths.filter((p) => p.includes('/agile/tasks/'))
    const dashboardRelevantTouched = touchedPaths.some(isDashboardRelevantPath)

    if (agileMarkdownPaths.length === 0 && !dashboardRelevantTouched) {
      process.exit(0)
    }

    const functionsDir = path.join(DOCS_ROOT, '.github', 'functions')
    const agileDir = path.join(DOCS_ROOT, 'agile')

    const syncScript = path.join(functionsDir, 'sync-backlog-index.js')
    const timelineIdScript = path.join(functionsDir, 'timeline-id.js')
    const datetimeScript = path.join(functionsDir, 'datetime.js')
    const validateTaskPackScript = path.join(functionsDir, 'validate-task-pack.js')
    const generateDashboardsScript = path.join(functionsDir, 'generate-dashboards.js')
    const timelinePath = path.join(DOCS_ROOT, 'agile', 'timeline.jsonl')

    let shouldGenerateDashboards = dashboardRelevantTouched

    if (agileMarkdownPaths.length > 0 && fs.existsSync(syncScript)) {
      const sync = runNode(syncScript, [agileDir], { cwd: DOCS_ROOT })
      if (!sync.ok) {
        process.stderr.write(`[agile-hook] sync-backlog-index failed: ${sync.stderr || sync.stdout}\n`)
      } else {
        shouldGenerateDashboards = true
      }
    }

    const action = resolveAction(toolName)
    if (
      action &&
      agileMarkdownPaths.length > 0 &&
      fs.existsSync(timelineIdScript) &&
      fs.existsSync(datetimeScript) &&
      fs.existsSync(timelinePath)
    ) {
      const dateResult = runNode(datetimeScript, [], { cwd: DOCS_ROOT })
      const timestamp = dateResult.ok ? dateResult.stdout : ''

      for (const filePath of agileMarkdownPaths) {
        const idResult = runNode(timelineIdScript, [timelinePath], { cwd: DOCS_ROOT })
        if (!idResult.ok || !timestamp) {
          process.stderr.write('[agile-hook] timeline append skipped due to datetime/timeline-id failure\n')
          break
        }

        const artifactType = getArtifactType(filePath)
        const artifactId = getArtifactId(filePath)
        const { story, epic } = inferStoryAndEpic(artifactId)

        const entry = {
          id: idResult.stdout,
          timestamp,
          agent: resolveTimelineAgent(payload, toolInput, filePath, artifactType),
          action,
          artifact_type: artifactType,
          artifact_id: artifactId,
          artifact_file: toTimelineArtifactFile(filePath),
          story,
          epic,
          notes: generateNotes(toolName, toolInput, artifactId, artifactType, action),
        }

        fs.appendFileSync(timelinePath, `${JSON.stringify(entry)}\n`, 'utf8')
        shouldGenerateDashboards = true
      }
    }

    if (taskMarkdownPaths.length > 0 && fs.existsSync(validateTaskPackScript)) {
      const stories = [...new Set(taskMarkdownPaths.map(storyIdFromTaskPath).filter(Boolean))]
      const failedStories = []

      for (const storyId of stories) {
        const args = [agileDir, '--story', storyId]
        const validation = runNode(validateTaskPackScript, args, { cwd: DOCS_ROOT })
        if (!validation.ok) {
          failedStories.push(storyId)
          process.stderr.write(`[agile-hook] validate-task-pack failed for ${storyId}: ${validation.stdout || validation.stderr}\n`)
        }
      }

      if (sessionId) {
        const state = readTaskPackState()

        if (failedStories.length > 0) {
          state.sessions[sessionId] = {
            pending: true,
            failedStories,
            updatedAt: new Date().toISOString(),
          }
        } else {
          delete state.sessions[sessionId]
        }

        writeTaskPackState(state)
      }
    }

    if (shouldGenerateDashboards && fs.existsSync(generateDashboardsScript)) {
      const dashboards = runNode(generateDashboardsScript, [], { cwd: WORKSPACE_ROOT })
      if (!dashboards.ok) {
        process.stderr.write(`[agile-hook] generate-dashboards failed: ${dashboards.stderr || dashboards.stdout}\n`)
      }
    }

    process.exit(0)
  } catch (error) {
    // Non-blocking behavior for hooks: warn and continue.
    const message = error instanceof Error ? error.message : String(error)
    process.stderr.write(`[agile-hook] ${message}\n`)
    process.exit(1)
  }
}

main()
