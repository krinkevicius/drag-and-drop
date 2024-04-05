import { join } from 'path'
import { fileURLToPath } from 'node:url'
import { DataSource, type DataSourceOptions } from 'typeorm'
import { SnakeNamingStrategy } from 'typeorm-naming-strategies'
import { newDb } from 'pg-mem'
import { isTest } from '@server/config'
import * as entities from '../entities'

export function createDatabase(
  options: Partial<DataSourceOptions | { type: 'pg-mem' }> = {}
) {
  // Run with an in-memory database.
  if (options.type === 'pg-mem') {
    return createMemoryDatabase()
  }

  return new DataSource({
    // defaults
    entities,
    migrations: isTest ? [] : [relative('./migrations/**/*.ts')],
    namingStrategy: new SnakeNamingStrategy(),

    // overrides
    ...options,
  } as any)
}

function createMemoryDatabase(): DataSource {
  const pgMemory = newDb()

  pgMemory.public.registerFunction({
    name: 'current_database',
    implementation: () => 'test',
  })
  pgMemory.public.registerFunction({
    name: 'version',
    implementation: () => '1',
  })

  return pgMemory.adapters.createTypeormDataSource({
    type: 'postgres',
    entities,
    synchronize: true,
    logging: false,
    namingStrategy: new SnakeNamingStrategy(),
  })
}

function relative(...paths: string[]) {
  const directory = join(fileURLToPath(import.meta.url), '..')
  return join(directory, ...paths)
}

export type Database = DataSource
