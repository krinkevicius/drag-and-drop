import 'dotenv/config'
import z from 'zod'

const { env } = process

if (!env.NODE_ENV) env.NODE_ENV = 'development'

const isTest = env.NODE_ENV === 'test'
const isDevTest = env.NODE_ENV === 'development' || isTest

export const isInMemory = env.DB_TYPE === 'pg-mem'

const s3config = z.object({
  clientConfig: z.object({
    region: isDevTest
      ? z.string().trim().min(1).optional()
      : z.string().trim().min(1),
    credentials: z.object({
      accessKeyId: isDevTest
        ? z.string().trim().min(1).optional()
        : z.string().trim().min(1),
      secretAccessKey: isDevTest
        ? z.string().trim().min(1).optional()
        : z.string().trim().min(1),
    }),
  }),
  bucket: isDevTest
    ? z.string().trim().min(1).optional()
    : z.string().trim().min(1),
})

export type S3Config = z.infer<typeof s3config>

export const schema = z
  .object({
    env: z
      .enum(['development', 'production', 'staging', 'test'])
      .default('development'),
    isCi: z.preprocess(coerceBoolean, z.boolean().default(false)),
    port: z.coerce.number().default(3000),

    auth: z.object({
      tokenKey: z.string().default(() => {
        if (isDevTest) {
          return ''
        }

        throw new Error('You must provide a token key in production env!')
      }),
      expiresIn: z.string().default('7d'),
      passwordCost: z.coerce.number().default(isDevTest ? 6 : 12),
    }),

    database: z.object({
      type: z
        .enum(['postgres', 'mysql', 'mariadb', 'better-sqlite3', 'pg-mem'])
        .default('postgres'),
      host: z.string().default('localhost'),
      port: z.coerce.number().default(5432),
      database: isInMemory ? z.string().optional() : z.string(),
      username: isInMemory ? z.string().optional() : z.string(),
      password: isInMemory ? z.string().optional() : z.string(),

      // By default, log and synchronize the database schema only for tests and development.
      ssl: z.preprocess(coerceBoolean, z.boolean().default(false)),
      logging: z.preprocess(coerceBoolean, z.boolean().default(isDevTest)),
      synchronize: z.preprocess(coerceBoolean, z.boolean().default(isDevTest)),
    }),

    s3config,
    sentryServerDSN: isDevTest
      ? z.string().optional()
      : z.string().trim().min(1),

    tinyfyKey: isDevTest ? z.string().optional() : z.string().trim().min(1),
  })
  .readonly()

export const config = schema.parse({
  env: env.NODE_ENV,
  port: env.PORT,
  isCi: env.CI,

  auth: {
    tokenKey: env.TOKEN_KEY,
    expiresIn: env.TOKEN_EXPIRES_IN,
    passwordCost: env.PASSWORD_COST,
  },

  database: {
    type: env.DB_TYPE,
    host: env.DB_HOST,
    port: env.DB_PORT,
    database: env.DB_NAME,
    username: env.DB_USER,
    password: env.DB_PASSWORD,
    logging: env.DB_LOGGING,
    synchronize: env.DB_SYNC,
    ssl: env.DB_SSL,
  },

  s3config: {
    clientConfig: {
      region: env.AWS_REGION,
      credentials: {
        accessKeyId: env.AWS_BUCKET_ACCESS_KEY,
        secretAccessKey: env.AWS_BUCKET_SECRET_ACCESS_KEY,
      },
    },
    bucket: env.AWS_BUCKET_NAME,
  },

  sentryServerDSN: env.SENTRY_SERVER_DSN,
  tinyfyKey: env.TINIFY_KEY,
})

// utility functions
function coerceBoolean(value: unknown) {
  if (typeof value === 'string') {
    return value === 'true' || value === '1'
  }

  return undefined
}

export const isDefined = (value: object | string): boolean => {
  if (typeof value === 'object' && value !== null) {
    return Object.values(value).every((v) => isDefined(v))
  }
  return value !== undefined && value !== ''
}
