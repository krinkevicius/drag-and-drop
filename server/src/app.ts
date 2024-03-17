import express from 'express'
import {
  createExpressMiddleware,
  type CreateExpressContextOptions,
} from '@trpc/server/adapters/express'
import cors from 'cors'
import * as Sentry from '@sentry/node'
import { nodeProfilingIntegration } from '@sentry/profiling-node'
import type { Database } from './database'
import { appRouter } from './modules'
import type { Context } from './trpc'
import config from './config'

export default function createApp(db: Database) {
  const app = express()

  Sentry.init({
    dsn: config.sentryServerDSN,
    integrations: [
      // enable HTTP calls tracing
      new Sentry.Integrations.Http({ tracing: true }),
      // enable Express.js middleware tracing
      new Sentry.Integrations.Express({ app }),
      nodeProfilingIntegration(),
    ],
    // Performance Monitoring
    tracesSampleRate: 1.0, //  Capture 100% of the transactions
    // Set sampling rate for profiling - this is relative to tracesSampleRate
    profilesSampleRate: 1.0,
  })

  // The request handler must be the first middleware on the app
  app.use(Sentry.Handlers.requestHandler())

  // TracingHandler creates a trace for every incoming request
  app.use(Sentry.Handlers.tracingHandler())

  app.use(cors())
  app.use(express.json())

  // Endpoint for health checks - pinging the server to see if it's alive.
  // This can be used by tests, load balancers, monitoring tools, etc.
  app.use('/api/health', (_, res) => {
    res.status(200).send('OK')
  })

  // Using TRPC router, which will live under /v1/trpc
  // path. It will be used for all our procedures.
  app.use(
    '/api/v1/trpc',
    createExpressMiddleware({
      // Created context for each request, which we will be able to
      // access in our procedures.
      createContext: ({ req, res }: CreateExpressContextOptions): Context => ({
        // What we provide to our procedures under `ctx` key.
        db,
        req,
        res,
      }),

      // all routes
      router: appRouter,
    })
  )

  app.use(Sentry.Handlers.errorHandler())

  return app
}
