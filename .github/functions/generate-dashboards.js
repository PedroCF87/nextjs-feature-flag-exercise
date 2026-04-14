#!/usr/bin/env node
/**
 * generate-dashboards.js
 *
 * Reads the three AI Layer log sources and generates three Bootstrap 5
 * HTML dashboards in Docs/dashboard/:
 *
 *   timeline.html     → activity timeline  (Docs/agile/timeline.jsonl)
 *   backlog.html      → backlog index       (Docs/agile/backlog-index.json)
 *   friction-log.html → friction log        (nextjs-feature-flag-exercise/.agents/templates/friction-log.md)
 *
 * CLI:
 *   node "Docs/.github/functions/generate-dashboards.js" [--friction-log <abs-path>]
 *
 * Options:
 *   --friction-log <abs-path>   Override the default friction-log.md path
 *
 * @module generate-dashboards
 */

'use strict';

const fs   = require('fs');
const path = require('path');

// ─── Path resolution ─────────────────────────────────────────────────────────

const WORKSPACE_ROOT   = path.resolve(__dirname, '..', '..', '..');
const DOCS_ROOT        = path.join(WORKSPACE_ROOT, 'Docs');
const TIMELINE_PATH    = path.join(DOCS_ROOT, 'agile', 'timeline.jsonl');
const BACKLOG_PATH     = path.join(DOCS_ROOT, 'agile', 'backlog-index.json');
const DEFAULT_FRICTION = path.join(
  WORKSPACE_ROOT,
  'nextjs-feature-flag-exercise',
  '.agents', 'templates', 'friction-log.md'
);
const OUTPUT_DIR = path.join(DOCS_ROOT, 'dashboard');

// Bootstrap 5.3.3 CDN
const BS_CSS = 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css';
const BS_JS  = 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js';

// ─── Data loaders ─────────────────────────────────────────────────────────────

/**
 * Parse timeline.jsonl into an array of objects.
 * Normalises the `notes` / `description` field inconsistency.
 * @param {string} filePath
 * @returns {object[]}
 */
function loadTimeline(filePath) {
  return fs
    .readFileSync(filePath, 'utf8')
    .trim()
    .split('\n')
    .map((line, i) => {
      try {
        const e = JSON.parse(line);
        e._notes = e.notes || e.description || '';
        return e;
      } catch {
        console.warn(`  ⚠️  timeline line ${i + 1} is invalid JSON — skipped`);
        return null;
      }
    })
    .filter(Boolean);
}

/**
 * Parse backlog-index.json.
 * @param {string} filePath
 * @returns {object}   Full backlog document (with .items array)
 */
function loadBacklog(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

/**
 * Parse the markdown pipe-table rows from friction-log.md.
 * Returns an array of { num, story, timestamp, description, impact }.
 * @param {string} content   Raw markdown string
 * @returns {object[]}
 */
function parseFrictionLogTable(content) {
  const rows = [];
  const lines = content.split('\n');
  let headerFound = false;
  let inTable = false;

  for (const line of lines) {
    const t = line.trim();
    if (!headerFound && t.startsWith('| #')) {
      headerFound = true;
      inTable = true;
      continue;                       // skip header row
    }
    if (inTable && /^\|[-: |]+\|$/.test(t)) continue; // skip separator
    if (inTable && t.startsWith('|')) {
      const cells = t.split('|').slice(1, -1).map(c => c.trim());
      if (cells.length >= 5) {
        rows.push({
          num:         cells[0],
          story:       cells[1],
          timestamp:   cells[2],
          description: cells[3].replace(/^_|_$/g, ''), // strip italic markers
          impact:      cells[4],
        });
      }
    } else if (inTable && t !== '') {
      inTable = false;
    }
  }
  return rows;
}

/**
 * Load and parse friction-log.md; returns empty array if file is missing.
 * @param {string} filePath
 * @returns {object[]}
 */
function loadFrictionLog(filePath) {
  if (!fs.existsSync(filePath)) {
    console.warn(`  ⚠️  friction-log not found at ${filePath} — empty data used`);
    return [];
  }
  return parseFrictionLogTable(fs.readFileSync(filePath, 'utf8'));
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Unique sorted non-empty values of a key across an array of objects. */
function unique(arr, key) {
  return [...new Set(
    arr.map(item => item[key]).filter(v => v && v !== 'null' && v !== null)
  )].sort();
}

/** Escape HTML special chars. */
function esc(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ─── Badge helpers ─────────────────────────────────────────────────────────────

function actionBadge(action) {
  const map = {
    create: 'success', created: 'success',
    update: 'primary', updated: 'primary',
    close: 'secondary', closed: 'secondary',
    delete: 'danger', deleted: 'danger',
  };
  return `<span class="badge bg-${map[action] || 'dark'}">${esc(action)}</span>`;
}

function impactBadge(impact) {
  const lvl = (impact || '').toLowerCase();
  const cls = { high: 'danger', medium: 'warning text-dark', low: 'info text-dark' }[lvl] || 'secondary';
  return `<span class="badge bg-${cls}">${esc(impact || '—')}</span>`;
}

function statusBadge(status) {
  const map = { Done: 'success', 'In Progress': 'primary', Draft: 'secondary', Blocked: 'danger' };
  return `<span class="badge bg-${map[status] || 'secondary'}">${esc(status)}</span>`;
}

function priorityBadge(priority) {
  const map = { P0: 'danger', P1: 'warning text-dark', P2: 'info text-dark' };
  return `<span class="badge bg-${map[priority] || 'secondary'}">${esc(priority)}</span>`;
}

// ─── Shared page shell ────────────────────────────────────────────────────────

function navbar(activePage, totalsByPage) {
  const pages = [
    { id: 'timeline',     label: '🕒 Timeline',     href: 'timeline.html',     count: totalsByPage.timeline },
    { id: 'backlog',      label: '📋 Backlog',       href: 'backlog.html',      count: totalsByPage.backlog },
    { id: 'friction-log', label: '⚡ Friction Log',  href: 'friction-log.html', count: totalsByPage.friction },
  ];
  const links = pages.map(p => {
    const active = p.id === activePage ? ' active fw-semibold' : '';
    return `      <li class="nav-item">
        <a class="nav-link${active}" href="${p.href}">
          ${p.label} <span class="badge bg-secondary">${p.count}</span>
        </a>
      </li>`;
  }).join('\n');

  return `<nav class="navbar navbar-expand-lg navbar-dark bg-dark px-3 mb-0">
    <a class="navbar-brand fw-bold" href="#">📊 AI Layer</a>
    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#mainNav">
      <span class="navbar-toggler-icon"></span>
    </button>
    <div class="collapse navbar-collapse" id="mainNav">
      <ul class="navbar-nav ms-auto">
${links}
      </ul>
    </div>
  </nav>`;
}

function htmlWrap(title, activePage, bodyContent, totals) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title} — AI Layer Dashboards</title>
  <link rel="stylesheet" href="${BS_CSS}" crossorigin="anonymous">
  <style>
    body          { background: #f5f6fa; }
    .filter-bar   { background: #fff; border-radius: 8px; padding: 1rem 1.25rem;
                    margin-bottom: 1rem; box-shadow: 0 1px 4px rgba(0,0,0,.07); }
    .table-sm td,
    .table-sm th  { font-size: 0.82rem; vertical-align: middle; }
    .notes-cell   { max-width: 320px; white-space: nowrap; overflow: hidden;
                    text-overflow: ellipsis; cursor: pointer; }
    .notes-cell.expanded { white-space: normal; }
    .badge        { font-size: 0.73rem; }
    .dep-badge    { cursor: pointer; }
    .result-hint  { font-size: 0.82rem; color: #6c757d; }
  </style>
</head>
<body>
${navbar(activePage, totals)}
<div class="container-fluid py-4 px-4">
${bodyContent}
</div>
<script src="${BS_JS}" crossorigin="anonymous"></script>
</body>
</html>`;
}

// ─── Page builders ────────────────────────────────────────────────────────────

/**
 * Build timeline.html from an array of timeline entries.
 * @param {object[]} entries
 * @param {object}   totals   { timeline, backlog, friction }
 * @returns {string}
 */
function buildTimeline(entries, totals) {
  const actions = unique(entries, 'action');
  const types   = unique(entries, 'artifact_type');
  const epics   = unique(entries, 'epic_id');
  const agents  = unique(entries, 'agent');

  const opts = arr => arr.map(v => `<option value="${esc(v)}">${esc(v)}</option>`).join('');

  const rows = entries.map(e => {
    const notes      = esc(e._notes);
    const notesShort = e._notes.length > 90 ? esc(e._notes.slice(0, 90)) + '…' : notes;
    const pathLink   = e.artifact_path
      ? `<a href="../${esc(e.artifact_path)}" title="${esc(e.artifact_path)}" class="text-decoration-none">🔗</a>`
      : '';

    return `<tr class="tl-row"
        data-action="${esc(e.action)}"
        data-type="${esc(e.artifact_type || '')}"
        data-epic="${esc(e.epic_id || '')}"
        data-agent="${esc(e.agent || '')}"
        data-search="${esc((e.artifact_id + ' ' + e._notes).toLowerCase())}">
      <td class="text-muted font-monospace" style="white-space:nowrap;font-size:0.75rem">${esc(e.id)}</td>
      <td style="white-space:nowrap;font-size:0.78rem">${esc(e.timestamp || '—')}</td>
      <td>${actionBadge(e.action)}</td>
      <td><code style="font-size:0.75rem">${esc(e.artifact_type || '—')}</code></td>
      <td><strong>${esc(e.artifact_id || '—')}</strong> ${pathLink}</td>
      <td>${esc(e.epic_id   || '—')}</td>
      <td>${esc(e.story_id && e.story_id !== 'null' ? e.story_id : '—')}</td>
      <td class="text-muted">${esc(e.agent || '—')}</td>
      <td class="notes-cell"
          title="${notes}"
          onclick="this.classList.toggle('expanded')">${notesShort}</td>
    </tr>`;
  }).join('\n');

  const body = `
<h4 class="mb-3">🕒 Activity Timeline
  <span class="badge bg-secondary ms-1" id="tl-count">${entries.length}</span>
</h4>
<div class="filter-bar row g-2 align-items-end">
  <div class="col-md-2">
    <label class="form-label mb-1">Action</label>
    <select class="form-select form-select-sm" id="f-action">
      <option value="">All</option>${opts(actions)}
    </select>
  </div>
  <div class="col-md-2">
    <label class="form-label mb-1">Artifact Type</label>
    <select class="form-select form-select-sm" id="f-type">
      <option value="">All</option>${opts(types)}
    </select>
  </div>
  <div class="col-md-2">
    <label class="form-label mb-1">Epic</label>
    <select class="form-select form-select-sm" id="f-epic">
      <option value="">All</option>${opts(epics)}
    </select>
  </div>
  <div class="col-md-2">
    <label class="form-label mb-1">Agent</label>
    <select class="form-select form-select-sm" id="f-agent">
      <option value="">All</option>${opts(agents)}
    </select>
  </div>
  <div class="col-md-3">
    <label class="form-label mb-1">Search (ID / notes)</label>
    <input type="text" class="form-control form-control-sm" id="f-search"
           placeholder="e.g. friction-log, E0-S2…">
  </div>
  <div class="col-md-1">
    <button class="btn btn-sm btn-outline-secondary w-100 mt-1" onclick="clearTLFilters()">
      Clear
    </button>
  </div>
</div>
<p class="result-hint mb-2">Click a Notes cell to expand full text.</p>
<div class="table-responsive">
  <table class="table table-sm table-striped table-hover" id="tl-table">
    <thead class="table-dark">
      <tr>
        <th>ID</th><th>Timestamp</th><th>Action</th><th>Type</th>
        <th>Artifact</th><th>Epic</th><th>Story</th><th>Agent</th><th>Notes</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>
</div>
<script>
  function applyTLFilters() {
    const action = document.getElementById('f-action').value;
    const type   = document.getElementById('f-type').value;
    const epic   = document.getElementById('f-epic').value;
    const agent  = document.getElementById('f-agent').value;
    const search = document.getElementById('f-search').value.toLowerCase().trim();
    let count = 0;
    document.querySelectorAll('.tl-row').forEach(row => {
      const ok = (!action || row.dataset.action === action)
               && (!type   || row.dataset.type   === type)
               && (!epic   || row.dataset.epic   === epic)
               && (!agent  || row.dataset.agent  === agent)
               && (!search || row.dataset.search.includes(search));
      row.style.display = ok ? '' : 'none';
      if (ok) count++;
    });
    document.getElementById('tl-count').textContent = count;
  }
  function clearTLFilters() {
    ['f-action','f-type','f-epic','f-agent'].forEach(id =>
      document.getElementById(id).value = '');
    document.getElementById('f-search').value = '';
    applyTLFilters();
  }
  ['f-action','f-type','f-epic','f-agent'].forEach(id =>
    document.getElementById(id).addEventListener('change', applyTLFilters));
  document.getElementById('f-search').addEventListener('input', applyTLFilters);
</script>`;

  return htmlWrap('Timeline', 'timeline', body, totals);
}

/**
 * Build backlog.html from the backlog document.
 * @param {object}   backlog   Full backlog document (with .items)
 * @param {object}   totals
 * @returns {string}
 */
function buildBacklog(backlog, totals) {
  const items     = backlog.items;
  const epics     = unique(items, 'epic');
  const statuses  = unique(items, 'status');
  const priorities= unique(items, 'priority');
  const types     = unique(items, 'type');
  const opts = arr => arr.map(v => `<option value="${esc(v)}">${esc(v)}</option>`).join('');

  const rows = items.map(item => {
    const deps = (item.depends_on || []).length
      ? (item.depends_on).map(d =>
          `<span class="badge bg-secondary dep-badge me-1"
                 onclick="filterById('${esc(d)}')"
                 title="Filter to ${esc(d)}">${esc(d)}</span>`).join('')
      : '—';
    const blocks = (item.blocks || []).length
      ? (item.blocks).map(d =>
          `<span class="badge bg-danger dep-badge me-1"
                 onclick="filterById('${esc(d)}')"
                 title="Filter to ${esc(d)}">${esc(d)}</span>`).join('')
      : '—';
    const agents = (item.responsible_agent || []).length
      ? (item.responsible_agent).map(a =>
          `<span class="badge bg-dark me-1">${esc(a)}</span>`).join('')
      : '—';
    const storyLink = item.story_file
      ? ` <a href="../${esc(item.story_file)}" title="${esc(item.story_file)}"
              class="text-decoration-none ms-1">📄</a>`
      : '';

    return `<tr class="bl-row"
        data-id="${esc(item.id)}"
        data-epic="${esc(item.epic || '')}"
        data-status="${esc(item.status || '')}"
        data-priority="${esc(item.priority || '')}"
        data-type="${esc(item.type || '')}">
      <td><strong>${esc(item.id)}</strong>${storyLink}</td>
      <td><code style="font-size:0.75rem">${esc(item.type)}</code></td>
      <td>${esc(item.epic || '—')}</td>
      <td>${priorityBadge(item.priority)}</td>
      <td>${statusBadge(item.status)}</td>
      <td>${agents}</td>
      <td>${deps}</td>
      <td>${blocks}</td>
      <td class="text-muted" style="font-size:0.75rem;white-space:nowrap">${esc(item.last_updated || '—')}</td>
    </tr>`;
  }).join('\n');

  const body = `
<h4 class="mb-1">📋 Backlog Index
  <span class="badge bg-secondary ms-1" id="bl-count">${items.length}</span>
  <small class="text-muted ms-2" style="font-size:0.73rem">
    v${esc(backlog.version)} · generated ${esc(backlog.generated_at)}
  </small>
</h4>
<div class="filter-bar row g-2 align-items-end mt-2">
  <div class="col-md-2">
    <label class="form-label mb-1">Epic</label>
    <select class="form-select form-select-sm" id="bl-epic">
      <option value="">All</option>${opts(epics)}
    </select>
  </div>
  <div class="col-md-2">
    <label class="form-label mb-1">Status</label>
    <select class="form-select form-select-sm" id="bl-status">
      <option value="">All</option>${opts(statuses)}
    </select>
  </div>
  <div class="col-md-2">
    <label class="form-label mb-1">Priority</label>
    <select class="form-select form-select-sm" id="bl-priority">
      <option value="">All</option>${opts(priorities)}
    </select>
  </div>
  <div class="col-md-2">
    <label class="form-label mb-1">Type</label>
    <select class="form-select form-select-sm" id="bl-type">
      <option value="">All</option>${opts(types)}
    </select>
  </div>
  <div class="col-md-3">
    <label class="form-label mb-1">Search by ID</label>
    <input type="text" class="form-control form-control-sm" id="bl-search"
           placeholder="e.g. E0-S1">
  </div>
  <div class="col-md-1">
    <button class="btn btn-sm btn-outline-secondary w-100 mt-1" onclick="clearBLFilters()">
      Clear
    </button>
  </div>
</div>
<p class="result-hint mb-2">
  Click a <span class="badge bg-secondary">depends_on</span> or
  <span class="badge bg-danger">blocks</span> badge to filter to that item.
</p>
<div class="table-responsive">
  <table class="table table-sm table-striped table-hover" id="bl-table">
    <thead class="table-dark">
      <tr>
        <th>ID</th><th>Type</th><th>Epic</th><th>Priority</th><th>Status</th>
        <th>Agents</th><th>Depends on</th><th>Blocks</th><th>Last updated</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>
</div>
<script>
  function applyBLFilters() {
    const epic     = document.getElementById('bl-epic').value;
    const status   = document.getElementById('bl-status').value;
    const priority = document.getElementById('bl-priority').value;
    const type     = document.getElementById('bl-type').value;
    const search   = document.getElementById('bl-search').value.toLowerCase().trim();
    let count = 0;
    document.querySelectorAll('.bl-row').forEach(row => {
      const ok = (!epic     || row.dataset.epic     === epic)
               && (!status   || row.dataset.status   === status)
               && (!priority || row.dataset.priority === priority)
               && (!type     || row.dataset.type     === type)
               && (!search   || row.dataset.id.toLowerCase().includes(search));
      row.style.display = ok ? '' : 'none';
      if (ok) count++;
    });
    document.getElementById('bl-count').textContent = count;
  }
  function clearBLFilters() {
    ['bl-epic','bl-status','bl-priority','bl-type'].forEach(id =>
      document.getElementById(id).value = '');
    document.getElementById('bl-search').value = '';
    applyBLFilters();
  }
  function filterById(id) {
    document.getElementById('bl-search').value = id;
    applyBLFilters();
  }
  ['bl-epic','bl-status','bl-priority','bl-type'].forEach(id =>
    document.getElementById(id).addEventListener('change', applyBLFilters));
  document.getElementById('bl-search').addEventListener('input', applyBLFilters);
</script>`;

  return htmlWrap('Backlog', 'backlog', body, totals);
}

/**
 * Build friction-log.html from parsed friction-log rows.
 * @param {object[]} rows
 * @param {object}   totals
 * @returns {string}
 */
function buildFrictionLog(rows, totals) {
  const count = lvl => rows.filter(r => (r.impact || '').toLowerCase() === lvl).length;
  const high   = count('high');
  const medium = count('medium');
  const low    = count('low');
  const real   = rows.filter(r => r.story !== '—' && r.story !== '').length;

  const stories = [...new Set(rows.map(r => r.story).filter(s => s && s !== '—'))].sort();
  const storyOpts = stories.map(s => `<option value="${esc(s)}">${esc(s)}</option>`).join('');

  const impactRowClass = { high: 'table-danger', medium: 'table-warning', low: 'table-info' };

  const tableRows = rows.map(r => {
    const cls = impactRowClass[(r.impact || '').toLowerCase()] || '';
    return `<tr class="fl-row ${cls}"
        data-story="${esc(r.story)}"
        data-impact="${esc((r.impact || '').toLowerCase())}">
      <td>${esc(r.num)}</td>
      <td>${esc(r.story)}</td>
      <td style="white-space:nowrap;font-size:0.78rem">${esc(r.timestamp)}</td>
      <td>${esc(r.description)}</td>
      <td>${impactBadge(r.impact)}</td>
    </tr>`;
  }).join('\n');

  const body = `
<h4 class="mb-3">⚡ Friction Log
  <span class="badge bg-secondary ms-1" id="fl-count">${rows.length}</span>
</h4>
<div class="row g-3 mb-3">
  <div class="col-sm-3">
    <div class="alert alert-danger mb-0 py-2 text-center">
      <span class="fs-3 fw-bold d-block">${high}</span>High impact
    </div>
  </div>
  <div class="col-sm-3">
    <div class="alert alert-warning mb-0 py-2 text-center">
      <span class="fs-3 fw-bold d-block">${medium}</span>Medium impact
    </div>
  </div>
  <div class="col-sm-3">
    <div class="alert alert-info mb-0 py-2 text-center">
      <span class="fs-3 fw-bold d-block">${low}</span>Low impact
    </div>
  </div>
  <div class="col-sm-3">
    <div class="alert alert-secondary mb-0 py-2 text-center">
      <span class="fs-3 fw-bold d-block">${real}</span>Real entries
    </div>
  </div>
</div>
<div class="filter-bar row g-2 align-items-end">
  <div class="col-md-3">
    <label class="form-label mb-1">Story</label>
    <select class="form-select form-select-sm" id="fl-story">
      <option value="">All</option>${storyOpts}
    </select>
  </div>
  <div class="col-md-3">
    <label class="form-label mb-1">Impact</label>
    <select class="form-select form-select-sm" id="fl-impact">
      <option value="">All</option>
      <option value="high">🔴 High (&gt;30 min or revert)</option>
      <option value="medium">🟡 Medium (10–30 min)</option>
      <option value="low">🔵 Low (&lt;10 min)</option>
    </select>
  </div>
  <div class="col-md-2">
    <button class="btn btn-sm btn-outline-secondary w-100 mt-1" onclick="clearFLFilters()">
      Clear
    </button>
  </div>
</div>
<div class="table-responsive">
  <table class="table table-sm table-hover align-middle">
    <thead class="table-dark">
      <tr><th>#</th><th>Story</th><th>Timestamp</th><th>Description</th><th>Impact</th></tr>
    </thead>
    <tbody>${tableRows}</tbody>
  </table>
</div>
<script>
  function applyFLFilters() {
    const story  = document.getElementById('fl-story').value;
    const impact = document.getElementById('fl-impact').value;
    let count = 0;
    document.querySelectorAll('.fl-row').forEach(row => {
      const ok = (!story  || row.dataset.story  === story)
               && (!impact || row.dataset.impact === impact);
      row.style.display = ok ? '' : 'none';
      if (ok) count++;
    });
    document.getElementById('fl-count').textContent = count;
  }
  function clearFLFilters() {
    document.getElementById('fl-story').value  = '';
    document.getElementById('fl-impact').value = '';
    applyFLFilters();
  }
  document.getElementById('fl-story').addEventListener('change',  applyFLFilters);
  document.getElementById('fl-impact').addEventListener('change', applyFLFilters);
</script>`;

  return htmlWrap('Friction Log', 'friction-log', body, totals);
}

// ─── Main ─────────────────────────────────────────────────────────────────────

function main() {
  // CLI: detect --friction-log override
  const args    = process.argv.slice(2);
  const flIdx   = args.indexOf('--friction-log');
  const frictionPath = flIdx !== -1 ? args[flIdx + 1] : DEFAULT_FRICTION;

  console.log('📊 generate-dashboards.js');
  console.log(`  Workspace root : ${WORKSPACE_ROOT}`);
  console.log(`  Timeline       : ${TIMELINE_PATH}`);
  console.log(`  Backlog        : ${BACKLOG_PATH}`);
  console.log(`  Friction log   : ${frictionPath}`);
  console.log(`  Output dir     : ${OUTPUT_DIR}\n`);

  // Load data
  const timeline    = loadTimeline(TIMELINE_PATH);
  const backlog     = loadBacklog(BACKLOG_PATH);
  const frictionRows = loadFrictionLog(frictionPath);

  console.log(`  ✅ timeline    : ${timeline.length} entries`);
  console.log(`  ✅ backlog     : ${backlog.items.length} items`);
  console.log(`  ✅ friction    : ${frictionRows.length} rows`);

  const totals = {
    timeline: timeline.length,
    backlog:  backlog.items.length,
    friction: frictionRows.length,
  };

  // Ensure output directory
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    console.log(`\n  📁 Created ${OUTPUT_DIR}`);
  }

  // Generate and write each HTML
  const files = [
    ['timeline.html',     buildTimeline(timeline, totals)],
    ['backlog.html',      buildBacklog(backlog, totals)],
    ['friction-log.html', buildFrictionLog(frictionRows, totals)],
  ];

  console.log('');
  for (const [name, html] of files) {
    const dest = path.join(OUTPUT_DIR, name);
    fs.writeFileSync(dest, html, 'utf8');
    const kb = (Buffer.byteLength(html, 'utf8') / 1024).toFixed(1);
    console.log(`  📄 ${name.padEnd(24)} ${kb.padStart(6)} KB  →  ${dest}`);
  }

  console.log('\n✅  Done. Open Docs/dashboard/timeline.html to explore.');
}

if (require.main === module) main();

module.exports = { loadTimeline, loadBacklog, parseFrictionLogTable, loadFrictionLog };
