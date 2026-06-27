import { Router } from 'express';
import type { SearchController } from './search.controller.js';
import { validate } from '../../infrastructure/http/middlewares/validate.js';
import { searchQuerySchema } from './search.validation.js';

/**
 * Search routes — mounted at /api/v1/search
 *
 *   GET /?q=term&types=major,scholarship&page=1&pageSize=20   public
 */
export function createSearchRouter(controller: SearchController): Router {
  const router = Router();

  router.get('/', validate({ query: searchQuerySchema }), controller.search);

  return router;
}