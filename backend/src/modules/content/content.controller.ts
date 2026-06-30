import { Request, Response, NextFunction } from 'express';
import { EntityType } from './content.types.js';
import { createSectionSchema, createFaqSchema } from './content.validation.js';
import type { ContentService } from './content.service.js';

export class ContentController {
  constructor(private readonly service: ContentService) {}

  // ── Sections ────────────────────────────────────────────────
  getSections = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const entityType = req.params.entityType as EntityType;
      const entityId = req.params.entityId as string; // Only grab entityId
      const items = await this.service.getSections(entityType, entityId); // Hardcode MAJOR
      res.status(200).json({ success: true, data: items });
    } catch (err) {
      next(err);
    }
  };

  addSection = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const entityId = req.params.entityId as string;
      const entityType = req.params.entityType as EntityType;
      const data = createSectionSchema.parse(req.body);
      const item = await this.service.addSection(entityType, entityId, data);
      res.status(201).json({ success: true, data: item });
    } catch (err) {
      next(err);
    }
  };

  updateSection = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const data = createSectionSchema.partial().parse(req.body);
      const item = await this.service.editSection(id, data);
      res.status(200).json({ success: true, data: item });
    } catch (err) {
      next(err);
    }
  };

  deleteSection = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const { reason } = req.body;
      await this.service.removeSection(id, req.user?.id || 'system', reason);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  };

  // ── FAQs ─────────────────────────────────────────────────────
  getFaqs = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const entityId = req.params.entityId as string;
      const entityType = req.params.entityType as EntityType;
      const items = await this.service.getFaqs(entityType, entityId);
      res.status(200).json({ success: true, data: items });
    } catch (err) {
      next(err);
    }
  };

  addFaq = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const entityId = req.params.entityId as string;
      const entityType = req.params.entityType as EntityType;
      const data = createFaqSchema.parse(req.body);
      const item = await this.service.addFaq(entityType, entityId, data);
      res.status(201).json({ success: true, data: item });
    } catch (err) {
      next(err);
    }
  };

  updateFaq = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const data = createFaqSchema.partial().parse(req.body);
      const item = await this.service.editFaq(id, data);
      res.status(200).json({ success: true, data: item });
    } catch (err) {
      next(err);
    }
  };

  deleteFaq = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      await this.service.removeFaq(id, req.user?.id || 'system');
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  };
}
