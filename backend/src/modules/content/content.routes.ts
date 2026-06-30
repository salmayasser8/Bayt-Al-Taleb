import { Router } from 'express';
import type { RequestHandler } from 'express';
import { ContentController } from './content.controller.js';

export function createContentRouter(
  contentController: ContentController,
  authenticate?: RequestHandler,
): Router {
  const router = Router();

  // Public GET routes (no auth needed to read sections/faqs)
  // router.get('/MAJOR/:entityId/sections', contentController.getSections);
  // router.get('/MAJOR/:entityId/faqs', contentController.getFaqs);
  // router.get('/SCHOLARSHIP/:entityId/sections', contentController.getSections);
  // router.get('/SCHOLARSHIP/:entityId/faqs', contentController.getFaqs);
  router.get('/:entityType/:entityId/sections', contentController.getSections);
  router.get('/:entityType/:entityId/faqs', contentController.getFaqs);
  // Protected POST/PATCH/DELETE routes (Admin only)
  if (authenticate) {
    router.post('/:entityType/:entityId/sections', authenticate, contentController.addSection);
    router.post('/:entityType/:entityId/faqs', authenticate, contentController.addFaq);
    router.patch('/sections/:id', authenticate, contentController.updateSection);
    router.delete('/sections/:id', authenticate, contentController.deleteSection);
    router.patch('/faqs/:id', authenticate, contentController.updateFaq);
    router.delete('/faqs/:id', authenticate, contentController.deleteFaq);
  }

  return router;
}
