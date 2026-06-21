import type { Request, Response } from 'express';
import { asyncHandler } from '../../shared/utils/async-handler.js';
import { paginated } from '../../shared/utils/http-response.js';
import type { AuditService } from './audit.service.js';
import type { AuditLogFilter } from './audit.types.js';
import type { ListAuditQuery } from './audit.validation.js';

export class AuditController {
  constructor(private readonly service: AuditService) {}

  list = asyncHandler(async (req: Request, res: Response) => {
    const { entityType, entityId, action, userId, page, pageSize } =
      req.query as unknown as ListAuditQuery;

    const filter: AuditLogFilter = {};
    if (entityType != null) filter.entityType = entityType;
    if (entityId != null) filter.entityId = entityId;
    if (action != null) filter.action = action;
    if (userId != null) filter.userId = userId;

    const result = await this.service.list(filter, page, pageSize);
    paginated(res, result);
  });
}
