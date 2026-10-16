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

  create = asyncHandler(async (req: Request, res: Response) => {
    const majorId = req.params.majorId!;
    const course = await this.coursesService.createCourse(majorId, req.body);
    ok(res, course);
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id!;
    const course = await this.coursesService.updateCourse(id, req.body);
    ok(res, course);
  });

  delete = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id!;
    await this.coursesService.deleteCourse(id);
    ok(res, null);
  });

  getModeratorsList = asyncHandler(async (_req: Request, res: Response) => {
    const list = await this.coursesService.getModeratorsList();
    ok(res, list);
  });

  assignModerator = asyncHandler(async (req: Request, res: Response) => {
    const courseId = req.params.id!;
    const userId = req.params.userId!;
    const result = await this.coursesService.assignModerator(courseId, userId);
    ok(res, result);
  });

  revokeModerator = asyncHandler(async (req: Request, res: Response) => {
    const courseId = req.params.id!;
    const userId = req.params.userId!;
    const result = await this.coursesService.revokeModerator(courseId, userId);
    ok(res, result);
  });
}
