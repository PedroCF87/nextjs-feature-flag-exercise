import { z } from 'zod'
import type { Request, Response, NextFunction } from 'express'

const environmentValues = ['development', 'staging', 'production'] as const
const flagTypeValues = ['release', 'experiment', 'operational', 'permission'] as const

export const createFlagSchema = z.object({
  name: z.string().min(1, 'Name is required').regex(/^[a-z0-9-]+$/, 'Name must be lowercase alphanumeric with hyphens'),
  description: z.string().min(1, 'Description is required'),
  enabled: z.boolean(),
  environment: z.enum(environmentValues),
  type: z.enum(flagTypeValues),
  rolloutPercentage: z.number().min(0).max(100),
  owner: z.string().min(1, 'Owner is required'),
  tags: z.array(z.string()),
  expiresAt: z.string().datetime().nullable().optional(),
})

export const updateFlagSchema = createFlagSchema.partial()

export const flagFilterQuerySchema = z.object({
  environment: z.enum(environmentValues).optional(),
  status: z.enum(['enabled', 'disabled']).optional(),
  type: z.enum(flagTypeValues).optional(),
  owner: z.string().optional(),
  name: z.string().optional(),
})

export function validateFlagFilters(req: Request, res: Response, next: NextFunction): void {
  try {
    res.locals.filters = flagFilterQuerySchema.parse(req.query)
    next()
  } catch (error) {
    next(error)
  }
}
