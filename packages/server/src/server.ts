import { createApp } from './app.js';
import { initDb } from './db/index.js';
import { config } from './config.js';

async function main() {
  await initDb();

  const app = createApp();

  app.listen(config.port, () => {
    console.log(`[server] AIOStreams Clone running on http://localhost:${config.port}`);
    console.log(`[server] Configure at: http://localhost:${config.port}/configure`);
    console.log(`[server] Environment: ${config.nodeEnv}`);
  });
}

main().catch(err => {
  console.error('[server] Fatal error:', err);
  process.exit(1);
});
