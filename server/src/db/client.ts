import initSqlJs, { Database } from 'sql.js'
import { createTables } from './schema.js'
import { seedFlags, isSeeded } from './seed.js'
import fs from 'fs'
import path from 'path'

const DB_PATH = path.join(process.cwd(), 'flags.db')

let db: Database | null = null

export async function getDb(): Promise<Database> {
  if (db) return db

  const SQL = await initSqlJs()

  // Try to load existing database
  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH)
    db = new SQL.Database(fileBuffer)
  } else {
    db = new SQL.Database()
    createTables(db)
    seedFlags(db)
    saveDb()
  }

  // Seed if empty
  if (!isSeeded(db)) {
    seedFlags(db)
    saveDb()
  }

  return db
}

export function saveDb(): void {
  if (!db) return
  const data = db.export()
  const buffer = Buffer.from(data)
  fs.writeFileSync(DB_PATH, buffer)
}

export function closeDb(): void {
  if (db) {
    saveDb()
    db.close()
    db = null
  }
}
