import type { Request, Response } from 'express';
import type { SearchService } from './search.service.js';
import type { SearchQueryInput } from './search.validation.js';
import { ok } from '../../shared/utils/http-response.js';
import { asyncHandler } from '../../shared/utils/async-handler.js';

export class SearchController {
  constructor(private readonly service: SearchService) {}

  search = asyncHandler(async (req: Request, res: Response) => {
    const input = req.query as unknown as SearchQueryInput;
    const results = await this.service.search(input);
    ok(res, results);
  });
}