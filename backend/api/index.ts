/**
 * Vercel serverless entry — reuses the SAME Express application.
 * Vercel sends the original request path (/api/v1/...), so the
 * Express router matches without any path rewriting.
 */
import type { RequestHandler } from 'express';
import { createApp } from '../src/app.js';

const app = createApp();

const handler: RequestHandler = (req, res, next) => {
  app(req, res, next);
};

export default handler;
