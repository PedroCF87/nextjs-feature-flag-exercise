import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import initSqlJs, { Database } from 'sql.js'
import { v4 as uuidv4 } from 'uuid'

// We'll test the service functions with a fresh in-memory database for each test
let db: Database

const createTables = (db: Database) => {
  db.run(`
    CREATE TABLE IF NOT EXISTS flags (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      description TEXT NOT NULL,
      enabled INTEGER NOT NULL DEFAULT 0,
      environment TEXT NOT NULL,
      type TEXT NOT NULL,
      rollout_percentage INTEGER NOT NULL DEFAULT 100,
      owner TEXT NOT NULL,
      tags TEXT NOT NULL DEFAULT '[]',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      expires_at TEXT,
      last_evaluated_at TEXT
    )
  `)
}

interface DbRow {
  id: string
  name: string
  description: string
  enabled: number
  environment: string
  type: string
  rollout_percentage: number
  owner: string
  tags: string
  created_at: string
  updated_at: string
  expires_at: string | null
  last_evaluated_at: string | null
}

interface FeatureFlag {
  id: string
  name: string
  description: string
  enabled: boolean
  environment: string
  type: string
  rolloutPercentage: number
  owner: string
  tags: string[]
  createdAt: string
  updatedAt: string
  expiresAt: string | null
  lastEvaluatedAt: string | null
}

function rowToFlag(row: DbRow): FeatureFlag {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    enabled: row.enabled === 1,
    environment: row.environment,
    type: row.type,
    rolloutPercentage: row.rollout_percentage,
    owner: row.owner,
    tags: JSON.parse(row.tags) as string[],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    expiresAt: row.expires_at,
    lastEvaluatedAt: row.last_evaluated_at,
  }
}

function getAllFlags(db: Database): FeatureFlag[] {
  const result = db.exec('SELECT * FROM flags ORDER BY created_at DESC')
  if (result.length === 0) return []
  const columns = result[0].columns
  return result[0].values.map(row => {
    const obj: Record<string, unknown> = {}
    columns.forEach((col, i) => {
      obj[col] = row[i]
    })
    return rowToFlag(obj as unknown as DbRow)
  })
}

function getFlagById(db: Database, id: string): FeatureFlag | null {
  const stmt = db.prepare('SELECT * FROM flags WHERE id = ?')
  stmt.bind([id])
  if (stmt.step()) {
    const row = stmt.getAsObject() as unknown as DbRow
    stmt.free()
    return rowToFlag(row)
  }
  stmt.free()
  return null
}

function getFlagByName(db: Database, name: string): FeatureFlag | null {
  const stmt = db.prepare('SELECT * FROM flags WHERE name = ?')
  stmt.bind([name])
  if (stmt.step()) {
    const row = stmt.getAsObject() as unknown as DbRow
    stmt.free()
    return rowToFlag(row)
  }
  stmt.free()
  return null
}

interface CreateFlagInput {
  name: string
  description: string
  enabled: boolean
  environment: string
  type: string
  rolloutPercentage: number
  owner: string
  tags: string[]
  expiresAt?: string | null
}

function createFlag(db: Database, input: CreateFlagInput): FeatureFlag {
  const existing = getFlagByName(db, input.name)
  if (existing) {
    throw new Error(`CONFLICT: Flag with name '${input.name}' already exists`)
  }

  const id = uuidv4()
  const now = new Date().toISOString()

  const stmt = db.prepare(`
    INSERT INTO flags (id, name, description, enabled, environment, type, rollout_percentage, owner, tags, created_at, updated_at, expires_at, last_evaluated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

  stmt.run([
    id,
    input.name,
    input.description,
    input.enabled ? 1 : 0,
    input.environment,
    input.type,
    input.rolloutPercentage,
    input.owner,
    JSON.stringify(input.tags),
    now,
    now,
    input.expiresAt ?? null,
    null,
  ])
  stmt.free()

  const flag = getFlagById(db, id)
  if (!flag) throw new Error('Failed to create flag')
  return flag
}

function updateFlag(db: Database, id: string, input: Partial<CreateFlagInput>): FeatureFlag {
  const existing = getFlagById(db, id)
  if (!existing) {
    throw new Error(`NOT_FOUND: Flag with id '${id}' not found`)
  }

  if (input.name && input.name !== existing.name) {
    const nameConflict = getFlagByName(db, input.name)
    if (nameConflict) {
      throw new Error(`CONFLICT: Flag with name '${input.name}' already exists`)
    }
  }

  const now = new Date().toISOString()
  const updates: string[] = []
  const values: (string | number | null)[] = []

  if (input.name !== undefined) { updates.push('name = ?'); values.push(input.name) }
  if (input.description !== undefined) { updates.push('description = ?'); values.push(input.description) }
  if (input.enabled !== undefined) { updates.push('enabled = ?'); values.push(input.enabled ? 1 : 0) }
  if (input.environment !== undefined) { updates.push('environment = ?'); values.push(input.environment) }
  if (input.type !== undefined) { updates.push('type = ?'); values.push(input.type) }
  if (input.rolloutPercentage !== undefined) { updates.push('rollout_percentage = ?'); values.push(input.rolloutPercentage) }
  if (input.owner !== undefined) { updates.push('owner = ?'); values.push(input.owner) }
  if (input.tags !== undefined) { updates.push('tags = ?'); values.push(JSON.stringify(input.tags)) }
  if (input.expiresAt !== undefined) { updates.push('expires_at = ?'); values.push(input.expiresAt) }

  updates.push('updated_at = ?')
  values.push(now)
  values.push(id)

  const stmt = db.prepare(`UPDATE flags SET ${updates.join(', ')} WHERE id = ?`)
  stmt.run(values)
  stmt.free()

  const flag = getFlagById(db, id)
  if (!flag) throw new Error('Failed to update flag')
  return flag
}

function deleteFlag(db: Database, id: string): void {
  const existing = getFlagById(db, id)
  if (!existing) {
    throw new Error(`NOT_FOUND: Flag with id '${id}' not found`)
  }

  const stmt = db.prepare('DELETE FROM flags WHERE id = ?')
  stmt.run([id])
  stmt.free()
}

describe('Flag Service', () => {
  beforeEach(async () => {
    const SQL = await initSqlJs()
    db = new SQL.Database()
    createTables(db)
  })

  afterEach(() => {
    db.close()
  })

  describe('getAllFlags', () => {
    it('returns empty array when no flags exist', () => {
      const flags = getAllFlags(db)
      expect(flags).toEqual([])
    })

    it('returns all flags', () => {
      createFlag(db, {
        name: 'test-flag',
        description: 'Test flag',
        enabled: true,
        environment: 'development',
        type: 'release',
        rolloutPercentage: 100,
        owner: 'team-test',
        tags: ['test'],
      })

      const flags = getAllFlags(db)
      expect(flags).toHaveLength(1)
      expect(flags[0].name).toBe('test-flag')
    })
  })

  describe('createFlag', () => {
    it('creates a flag with correct data', () => {
      const flag = createFlag(db, {
        name: 'new-feature',
        description: 'A new feature',
        enabled: true,
        environment: 'production',
        type: 'release',
        rolloutPercentage: 50,
        owner: 'team-a',
        tags: ['frontend', 'ux'],
      })

      expect(flag.name).toBe('new-feature')
      expect(flag.description).toBe('A new feature')
      expect(flag.enabled).toBe(true)
      expect(flag.environment).toBe('production')
      expect(flag.type).toBe('release')
      expect(flag.rolloutPercentage).toBe(50)
      expect(flag.owner).toBe('team-a')
      expect(flag.tags).toEqual(['frontend', 'ux'])
    })

    it('generates a UUID for the flag', () => {
      const flag = createFlag(db, {
        name: 'uuid-test',
        description: 'Test UUID',
        enabled: false,
        environment: 'development',
        type: 'experiment',
        rolloutPercentage: 0,
        owner: 'team-b',
        tags: [],
      })

      expect(flag.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)
    })

    it('sets timestamps', () => {
      const before = new Date().toISOString()
      const flag = createFlag(db, {
        name: 'timestamp-test',
        description: 'Test timestamps',
        enabled: true,
        environment: 'staging',
        type: 'operational',
        rolloutPercentage: 100,
        owner: 'team-c',
        tags: [],
      })
      const after = new Date().toISOString()

      expect(flag.createdAt >= before).toBe(true)
      expect(flag.createdAt <= after).toBe(true)
      expect(flag.updatedAt >= before).toBe(true)
      expect(flag.updatedAt <= after).toBe(true)
    })

    it('rejects duplicate names', () => {
      createFlag(db, {
        name: 'duplicate-name',
        description: 'First flag',
        enabled: true,
        environment: 'production',
        type: 'release',
        rolloutPercentage: 100,
        owner: 'team-a',
        tags: [],
      })

      expect(() => createFlag(db, {
        name: 'duplicate-name',
        description: 'Second flag',
        enabled: false,
        environment: 'staging',
        type: 'experiment',
        rolloutPercentage: 50,
        owner: 'team-b',
        tags: [],
      })).toThrow('CONFLICT')
    })
  })

  describe('getFlagById', () => {
    it('returns the correct flag', () => {
      const created = createFlag(db, {
        name: 'find-me',
        description: 'Find this flag',
        enabled: true,
        environment: 'production',
        type: 'release',
        rolloutPercentage: 100,
        owner: 'team-a',
        tags: ['findable'],
      })

      const found = getFlagById(db, created.id)
      expect(found).not.toBeNull()
      expect(found?.name).toBe('find-me')
      expect(found?.tags).toEqual(['findable'])
    })

    it('returns null for unknown ID', () => {
      const found = getFlagById(db, 'non-existent-id')
      expect(found).toBeNull()
    })
  })

  describe('updateFlag', () => {
    it('modifies specified fields', () => {
      const created = createFlag(db, {
        name: 'update-me',
        description: 'Original description',
        enabled: false,
        environment: 'development',
        type: 'experiment',
        rolloutPercentage: 10,
        owner: 'team-a',
        tags: ['original'],
      })

      const updated = updateFlag(db, created.id, {
        description: 'Updated description',
        enabled: true,
        rolloutPercentage: 50,
      })

      expect(updated.name).toBe('update-me') // Unchanged
      expect(updated.description).toBe('Updated description')
      expect(updated.enabled).toBe(true)
      expect(updated.rolloutPercentage).toBe(50)
      expect(updated.tags).toEqual(['original']) // Unchanged
    })

    it('updates the updatedAt timestamp', async () => {
      const created = createFlag(db, {
        name: 'timestamp-update',
        description: 'Test timestamp update',
        enabled: true,
        environment: 'production',
        type: 'release',
        rolloutPercentage: 100,
        owner: 'team-a',
        tags: [],
      })

      // Small delay to ensure timestamp difference
      await new Promise(resolve => setTimeout(resolve, 10))

      const updated = updateFlag(db, created.id, { description: 'Updated' })
      expect(updated.updatedAt > created.updatedAt).toBe(true)
    })

    it('throws error for unknown ID', () => {
      expect(() => updateFlag(db, 'non-existent-id', { description: 'Update' }))
        .toThrow('NOT_FOUND')
    })
  })

  describe('deleteFlag', () => {
    it('removes the flag', () => {
      const created = createFlag(db, {
        name: 'delete-me',
        description: 'To be deleted',
        enabled: true,
        environment: 'production',
        type: 'release',
        rolloutPercentage: 100,
        owner: 'team-a',
        tags: [],
      })

      deleteFlag(db, created.id)

      const found = getFlagById(db, created.id)
      expect(found).toBeNull()
    })

    it('throws error for unknown ID', () => {
      expect(() => deleteFlag(db, 'non-existent-id'))
        .toThrow('NOT_FOUND')
    })
  })
})
