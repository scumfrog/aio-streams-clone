import { z } from 'zod';

const schema = z.object({
  port: z.coerce.number().default(3000),
  nodeEnv: z.enum(['development', 'production', 'test']).default('development'),
  databaseUrl: z.string().optional(),
  adminPassword: z.string().optional(),
  logLevel: z.enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal']).default('info'),
  maxAddonTimeout: z.coerce.number().default(15_000),
  streamCacheTtl: z.coerce.number().default(300),
  maxStreamsPerAddon: z.coerce.number().default(50),
  maxTotalResults: z.coerce.number().default(100),
});

export const config = schema.parse({
  port: process.env['PORT'],
  nodeEnv: process.env['NODE_ENV'],
  databaseUrl: process.env['DATABASE_URL'],
  adminPassword: process.env['ADMIN_PASSWORD'],
  logLevel: process.env['LOG_LEVEL'],
  maxAddonTimeout: process.env['MAX_ADDON_TIMEOUT'],
  streamCacheTtl: process.env['STREAM_CACHE_TTL'],
  maxStreamsPerAddon: process.env['MAX_STREAMS_PER_ADDON'],
});
