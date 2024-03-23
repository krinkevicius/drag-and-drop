import { createDatabase } from '@server/database'
import { config } from '@server/config'
import type { DataSource, DataSourceOptions } from 'typeorm'

export async function createTestDatabase() {
  const db = createDatabase(config.database as DataSourceOptions)

  await db.initialize()

  return db
}

export async function dropTestDatabase(db: DataSource) {
  if (config.env === 'test' && config.database.type !== 'pg-mem') {
    await db.dropDatabase()
  }
}

export function createMockDatabase(repositories: any) {
  return {
    getRepository: (entity: any) => {
      if (!(entity.name in repositories)) {
        throw new Error(
          `Repository for ${entity.name} was not found. Did you forget to mock it?`
        )
      }

      return repositories[entity.name]
    },
  } as any
}
