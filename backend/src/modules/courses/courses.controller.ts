import type { Request, Response } from 'express';
import { asyncHandler } from '../../shared/utils/async-handler.js';
import { ok } from '../../shared/utils/http-response.js';
import type { CoursesService } from './courses.service.js';

export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  getByMajor = asyncHandler(async (req: Request, res: Response) => {
    const majorId = req.params.majorId!;
    const courses = await this.coursesService.getCoursesByMajor(majorId);
    ok(res, courses);
  });
}
