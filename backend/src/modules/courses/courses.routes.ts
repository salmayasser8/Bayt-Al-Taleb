import { Router } from 'express';
import type { CoursesController } from './courses.controller.js';

export function createCoursesRouter(controller: CoursesController): Router {
  const router = Router();

  // Public route: Get all courses for a specific major
  router.get('/majors/:majorId/courses', controller.getByMajor.bind(controller));

  return router;
}
