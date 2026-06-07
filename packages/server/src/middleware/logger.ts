import type { Request, Response, NextFunction } from 'express';
import pino from 'pino';
import { config } from '../config.js';

const logger = pino({ level: config.logLevel });

export function loggerMiddleware(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();
  res.on('finish', () => {
    if (req.url === '/api/health') return;
    const ms = Date.now() - start;
    const level = res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info';
    logger[level]({ method: req.method, url: req.url, status: res.statusCode, ms });
  });
  next();
}
