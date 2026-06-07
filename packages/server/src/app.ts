import express from 'express';
import compression from 'compression';
import path from 'path';
import { fileURLToPath } from 'url';
import { corsMiddleware } from './middleware/cors.js';
import { loggerMiddleware } from './middleware/logger.js';
import { stremioRouter } from './routes/stremio.js';
import { apiRouter } from './routes/api.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function createApp() {
  const app = express();

  app.set('trust proxy', 1);

  app.use(corsMiddleware);
  app.use(compression() as express.RequestHandler);
  app.use(express.json({ limit: '2mb' }));
  app.use(loggerMiddleware as express.RequestHandler);

  // API
  app.use('/api', apiRouter);

  // Stremio addon protocol (/:userId/...)
  app.use('/', stremioRouter);

  // Serve built React frontend
  const frontendPath = path.join(__dirname, '../public/frontend');
  app.use(express.static(frontendPath, { maxAge: '1d' }));

  // SPA fallback – any unknown GET goes to the React app
  app.get('*', (_req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
  });

  return app;
}
