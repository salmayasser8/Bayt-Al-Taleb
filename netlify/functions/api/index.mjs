/**
 * Netlify serverless function — wraps the Express app so the whole
 * backend runs on Netlify under /api/v1 (routed here by netlify.toml).
 *
 * The build command copies backend/dist and backend/node_modules
 * into this folder, so imports below resolve to the compiled code.
 */
import serverlessHttp from 'serverless-http';
import { createApp } from './dist/src/app.js';
import { env } from './dist/src/config/env.js';

const app = createApp();

// Netlify may hand us the internal lambda path (/.../api/...).
// Normalize it to the real API prefix so Express routes match.
const LAMBDA_MOUNT = '/.netlify/functions/api';

export const handler = serverlessHttp(app, {
  request(request, event) {
    const url = new URL(request.url ?? 'http://spaceholder/api', 'http://internal');
    let path = event?.path ?? url.pathname;
    if (path.startsWith(LAMBDA_MOUNT)) {
      path = env.API_PREFIX + path.slice(LAMBDA_MOUNT.length);
    }
    request.url = path + url.search;
  },
});
