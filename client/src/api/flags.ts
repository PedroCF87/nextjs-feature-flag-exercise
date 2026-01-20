import type { FeatureFlag, CreateFlagInput, UpdateFlagInput, ApiError } from '@shared/types'

const API_BASE = 'http://localhost:3001/api'

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error: ApiError = await response.json()
    throw new Error(error.message)
  }
  return response.json()
}

export async function getFlags(): Promise<FeatureFlag[]> {
  const response = await fetch(`${API_BASE}/flags`)
  return handleResponse<FeatureFlag[]>(response)
}

export async function getFlag(id: string): Promise<FeatureFlag> {
  const response = await fetch(`${API_BASE}/flags/${id}`)
  return handleResponse<FeatureFlag>(response)
}

export async function createFlag(input: CreateFlagInput): Promise<FeatureFlag> {
  const response = await fetch(`${API_BASE}/flags`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  return handleResponse<FeatureFlag>(response)
}

export async function updateFlag(id: string, input: UpdateFlagInput): Promise<FeatureFlag> {
  const response = await fetch(`${API_BASE}/flags/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  return handleResponse<FeatureFlag>(response)
}

export async function deleteFlag(id: string): Promise<void> {
  const response = await fetch(`${API_BASE}/flags/${id}`, {
    method: 'DELETE',
  })
  if (!response.ok) {
    const error: ApiError = await response.json()
    throw new Error(error.message)
  }
}
