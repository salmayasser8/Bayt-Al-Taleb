import type { Request, Response } from 'express';
import type { DashboardService } from './dashboard.service.js';
import { ok } from '../../shared/utils/http-response.js';
import { asyncHandler } from '../../shared/utils/async-handler.js';

export class DashboardController {
  constructor(private readonly service: DashboardService) {}

  getStats = asyncHandler(async (_req: Request, res: Response) => {
    const stats = await this.service.getStats();
    ok(res, stats);
  });

  getRecentActivity = asyncHandler(async (_req: Request, res: Response) => {
    const activity = await this.service.getRecentActivity();
    ok(res, activity);
  });
}