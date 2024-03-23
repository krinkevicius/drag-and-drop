import type { DataSourceOptions } from 'typeorm'
import createApp from './app'
import { createDatabase } from './database'
import { config } from './config'
import { logger } from './logger'

const database = createDatabase(config.database as DataSourceOptions)
database.initialize().then(() => {
  const app = createApp(database)

  app.listen(config.port, () => {
    logger.info(`Server is running at http://localhost:${config.port}`)
  })
})
