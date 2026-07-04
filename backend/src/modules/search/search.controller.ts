import type { Request, Response } from 'express';
import { asyncHandler } from '../../shared/utils/async-handler.js';
import { ok } from '../../shared/utils/http-response.js';
import type { SearchService } from './search.service.js';

export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  search = asyncHandler(async (req: Request, res: Response) => {
    const q = (req.query.q as string) || '';

    const results = await this.searchService.globalSearch(q);

    // Return it grouped so the frontend can easily split it into tabs!
    ok(res, {
      query: q,
      majors: results.majors,
      scholarships: results.scholarships,
      colleges: results.colleges,
      total: results.total,
    });
  });
}
