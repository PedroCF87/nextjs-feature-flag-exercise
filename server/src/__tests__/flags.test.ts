import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import initSqlJs, { Database } from 'sql.js'
import type { Request, Response, NextFunction } from 'express'
import { createTables } from '../db/schema.js'
import { _resetDbForTesting } from '../db/client.js'
import {
  getAllFlags,
  getFlagById,
  getFlagByName,
  createFlag,
  updateFlag,
  deleteFlag,
} from '../services/flags.js'
import { validateFlagFilters } from '../middleware/validation.js'
import type { CreateFlagInput } from '../../../shared/types.js'

let db: Database

const validFlagInput: CreateFlagInput = {
  name: 'test-flag',
  description: 'Test flag description',
  enabled: true,
  environment: 'development',
  type: 'release',
  rolloutPercentage: 100,
  owner: 'team-test',
  tags: ['test'],
}

describe('Flag Service', () => {
  beforeEach(async () => {
    const SQL = await initSqlJs()
    db = new SQL.Database()
    createTables(db)
    _resetDbForTesting(db)
  })

  afterEach(() => {
    _resetDbForTesting(null)
    db.close()
  })

  describe('getAllFlags', () => {
    it('returns empty array when no flags exist', async () => {
      const flags = await getAllFlags()
      expect(flags).toEqual([])
    })

    it('returns all flags', async () => {
      await createFlag(validFlagInput)

      const flags = await getAllFlags()
      expect(flags).toHaveLength(1)
      expect(flags[0].name).toBe('test-flag')
    })
  })

  describe('getAllFlags with filters', () => {
    it('returns all flags when no filters provided', async () => {
      await createFlag(validFlagInput)
      await createFlag({ ...validFlagInput, name: 'second-flag' })

      const flags = await getAllFlags()
      expect(flags).toHaveLength(2)
    })

    it('filters by environment', async () => {
      await createFlag({ ...validFlagInput, environment: 'production' })
      await createFlag({ ...validFlagInput, name: 'staging-flag', environment: 'staging' })

      const flags = await getAllFlags({ environment: 'production' })
      expect(flags).toHaveLength(1)
      expect(flags[0].environment).toBe('production')
    })

    it('filters by status enabled', async () => {
      await createFlag({ ...validFlagInput, enabled: true })
      await createFlag({ ...validFlagInput, name: 'disabled-flag', enabled: false })

      const flags = await getAllFlags({ status: 'enabled' })
      expect(flags).toHaveLength(1)
      expect(flags[0].enabled).toBe(true)
    })

    it('filters by status disabled', async () => {
      await createFlag({ ...validFlagInput, enabled: true })
      await createFlag({ ...validFlagInput, name: 'disabled-flag', enabled: false })

      const flags = await getAllFlags({ status: 'disabled' })
      expect(flags).toHaveLength(1)
      expect(flags[0].enabled).toBe(false)
    })

    it('filters by type', async () => {
      await createFlag({ ...validFlagInput, type: 'release' })
      await createFlag({ ...validFlagInput, name: 'experiment-flag', type: 'experiment' })

      const flags = await getAllFlags({ type: 'experiment' })
      expect(flags).toHaveLength(1)
      expect(flags[0].type).toBe('experiment')
    })

    it('filters by owner', async () => {
      await createFlag({ ...validFlagInput, owner: 'team-a' })
      await createFlag({ ...validFlagInput, name: 'other-flag', owner: 'team-b' })

      const flags = await getAllFlags({ owner: 'team-a' })
      expect(flags).toHaveLength(1)
      expect(flags[0].owner).toBe('team-a')
    })

    it('filters by name partial match', async () => {
      await createFlag({ ...validFlagInput, name: 'search-feature-a' })
      await createFlag({ ...validFlagInput, name: 'unrelated-flag' })

      const flags = await getAllFlags({ name: 'search-feature' })
      expect(flags).toHaveLength(1)
      expect(flags[0].name).toBe('search-feature-a')
    })

    it('name filter is case insensitive', async () => {
      await createFlag({ ...validFlagInput, name: 'my-feature-flag' })

      const flags = await getAllFlags({ name: 'MY-FEATURE' })
      expect(flags).toHaveLength(1)
      expect(flags[0].name).toBe('my-feature-flag')
    })

    it('name filter treats LIKE special characters as literals', async () => {
      await createFlag({ ...validFlagInput, name: 'test-flag' })

      // Without escaping, '_' would be a wildcard matching 'test-flag' (- matches _)
      // With correct escaping, 'test_flag' should not match 'test-flag'
      const flags = await getAllFlags({ name: 'test_flag' })
      expect(flags).toHaveLength(0)
    })

    it('name filter treats % as a literal character', async () => {
      await createFlag({ ...validFlagInput, name: 'test-flag' })

      // Without escaping, '%' would match everything
      // With correct escaping, searching for '%' returns only flags whose name contains a literal '%'
      const flags = await getAllFlags({ name: '%' })
      expect(flags).toHaveLength(0)
    })

    it('applies multiple filters simultaneously', async () => {
      await createFlag({ ...validFlagInput, name: 'prod-enabled', environment: 'production', enabled: true })
      await createFlag({ ...validFlagInput, name: 'prod-disabled', environment: 'production', enabled: false })
      await createFlag({ ...validFlagInput, name: 'dev-enabled', environment: 'development', enabled: true })

      const flags = await getAllFlags({ environment: 'production', status: 'enabled' })
      expect(flags).toHaveLength(1)
      expect(flags[0].name).toBe('prod-enabled')
    })

    it('returns empty array when no flags match filters', async () => {
      await createFlag({ ...validFlagInput, environment: 'development' })

      const flags = await getAllFlags({ environment: 'production' })
      expect(flags).toEqual([])
    })
  })

  describe('createFlag', () => {
    it('creates a flag with correct data', async () => {
      const flag = await createFlag({
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

    it('generates a UUID for the flag', async () => {
      const flag = await createFlag({
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

    it('sets timestamps', async () => {
      const before = new Date().toISOString()
      const flag = await createFlag({
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

    it('rejects duplicate names', async () => {
      await createFlag({
        name: 'duplicate-name',
        description: 'First flag',
        enabled: true,
        environment: 'production',
        type: 'release',
        rolloutPercentage: 100,
        owner: 'team-a',
        tags: [],
      })

      await expect(createFlag({
        name: 'duplicate-name',
        description: 'Second flag',
        enabled: false,
        environment: 'staging',
        type: 'experiment',
        rolloutPercentage: 50,
        owner: 'team-b',
        tags: [],
      })).rejects.toThrow('already exists')
    })
  })

  describe('getFlagById', () => {
    it('returns the correct flag', async () => {
      const created = await createFlag({
        name: 'find-me',
        description: 'Find this flag',
        enabled: true,
        environment: 'production',
        type: 'release',
        rolloutPercentage: 100,
        owner: 'team-a',
        tags: ['findable'],
      })

      const found = await getFlagById(created.id)
      expect(found).not.toBeNull()
      expect(found?.name).toBe('find-me')
      expect(found?.tags).toEqual(['findable'])
    })

    it('returns null for unknown ID', async () => {
      const found = await getFlagById('non-existent-id')
      expect(found).toBeNull()
    })
  })

  describe('getFlagByName', () => {
    it('returns the correct flag', async () => {
      await createFlag({
        name: 'search-by-name',
        description: 'Find by name',
        enabled: true,
        environment: 'production',
        type: 'release',
        rolloutPercentage: 100,
        owner: 'team-a',
        tags: [],
      })

      const found = await getFlagByName('search-by-name')
      expect(found).not.toBeNull()
      expect(found?.name).toBe('search-by-name')
    })

    it('returns null for unknown name', async () => {
      const found = await getFlagByName('non-existent')
      expect(found).toBeNull()
    })
  })

  describe('updateFlag', () => {
    it('modifies specified fields', async () => {
      const created = await createFlag({
        name: 'update-me',
        description: 'Original description',
        enabled: false,
        environment: 'development',
        type: 'experiment',
        rolloutPercentage: 10,
        owner: 'team-a',
        tags: ['original'],
      })

      const updated = await updateFlag(created.id, {
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
      const created = await createFlag({
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

      const updated = await updateFlag(created.id, { description: 'Updated' })
      expect(updated.updatedAt > created.updatedAt).toBe(true)
    })

    it('throws error for unknown ID', async () => {
      await expect(updateFlag('non-existent-id', { description: 'Update' }))
        .rejects.toThrow('not found')
    })

    it('throws error when updating name to existing name', async () => {
      await createFlag({
        name: 'existing-flag',
        description: 'First flag',
        enabled: true,
        environment: 'production',
        type: 'release',
        rolloutPercentage: 100,
        owner: 'team-a',
        tags: [],
      })

      const second = await createFlag({
        name: 'different-flag',
        description: 'Second flag',
        enabled: true,
        environment: 'production',
        type: 'release',
        rolloutPercentage: 100,
        owner: 'team-b',
        tags: [],
      })

      await expect(updateFlag(second.id, { name: 'existing-flag' }))
        .rejects.toThrow('already exists')
    })
  })

  describe('deleteFlag', () => {
    it('removes the flag', async () => {
      const created = await createFlag({
        name: 'delete-me',
        description: 'To be deleted',
        enabled: true,
        environment: 'production',
        type: 'release',
        rolloutPercentage: 100,
        owner: 'team-a',
        tags: [],
      })

      await deleteFlag(created.id)

      const found = await getFlagById(created.id)
      expect(found).toBeNull()
    })

    it('throws error for unknown ID', async () => {
      await expect(deleteFlag('non-existent-id'))
        .rejects.toThrow('not found')
    })
  })
})

describe('validateFlagFilters middleware', () => {
  function makeReqRes(query: Record<string, string>) {
    const req = { query } as unknown as Request
    const res = { locals: {} } as unknown as Response
    return { req, res }
  }

  it('passes valid filters and stores them in res.locals', () => {
    const { req, res } = makeReqRes({ environment: 'production', status: 'enabled' })
    let nextCalled = false
    let nextError: unknown
    const next: NextFunction = (err?: unknown) => {
      nextError = err
      nextCalled = true
    }

    validateFlagFilters(req, res, next)

    expect(nextCalled).toBe(true)
    expect(nextError).toBeUndefined()
    expect((res.locals as Record<string, unknown>).filters).toEqual({ environment: 'production', status: 'enabled' })
  })

  it('calls next(error) for invalid environment value', () => {
    const { req, res } = makeReqRes({ environment: 'invalid-env' })
    let capturedError: unknown
    const next: NextFunction = (err?: unknown) => { capturedError = err }

    validateFlagFilters(req, res, next)

    expect(capturedError).toBeDefined()
  })

  it('calls next(error) for invalid status value', () => {
    const { req, res } = makeReqRes({ status: 'unknown' })
    let capturedError: unknown
    const next: NextFunction = (err?: unknown) => { capturedError = err }

    validateFlagFilters(req, res, next)

    expect(capturedError).toBeDefined()
  })

  it('calls next(error) for invalid type value', () => {
    const { req, res } = makeReqRes({ type: 'not-a-type' })
    let capturedError: unknown
    const next: NextFunction = (err?: unknown) => { capturedError = err }

    validateFlagFilters(req, res, next)

    expect(capturedError).toBeDefined()
  })

  it('passes with empty query (no filters)', () => {
    const { req, res } = makeReqRes({})
    let nextCalled = false
    const next: NextFunction = (err?: unknown) => { nextCalled = !err }

    validateFlagFilters(req, res, next)

    expect(nextCalled).toBe(true)
  })
})
