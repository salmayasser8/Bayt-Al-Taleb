import type { Request, Response } from 'express';
import { asyncHandler } from '../../shared/utils/async-handler.js';
import { ok, noContent } from '../../shared/utils/http-response.js';
import type { ModeratorsService } from './moderators.service.js';

export class ModeratorsController {
  constructor(private readonly service: ModeratorsService) {}

  // ── List all moderators ────────────────────────────────────
  listModerators = asyncHandler(async (_req: Request, res: Response) => {
    const list = await this.service.listModerators();
    ok(res, list);
  });

  // ── List entities ──────────────────────────────────────────
  listMajors = asyncHandler(async (_req: Request, res: Response) => {
    const list = await this.service.listMajors();
    ok(res, list);
  });

  listScholarships = asyncHandler(async (_req: Request, res: Response) => {
    const list = await this.service.listScholarships();
    ok(res, list);
  });

  listCourses = asyncHandler(async (_req: Request, res: Response) => {
    const list = await this.service.listCourses();
    ok(res, list);
  });

  // ── Major assignments ──────────────────────────────────────
  getMajorModerators = asyncHandler(async (req: Request, res: Response) => {
    const { majorId } = req.params as { majorId: string };
    const list = await this.service.getMajorModerators(majorId);
    ok(res, list);
  });

  assignMajorModerator = asyncHandler(async (req: Request, res: Response) => {
    const { majorId, userId } = req.params as { majorId: string; userId: string };
    await this.service.assignMajorModerator(majorId, userId);
    noContent(res);
  });

  removeMajorModerator = asyncHandler(async (req: Request, res: Response) => {
    const { majorId, userId } = req.params as { majorId: string; userId: string };
    await this.service.removeMajorModerator(majorId, userId);
    noContent(res);
  });

  // ── Scholarship assignments ────────────────────────────────
  getScholarshipModerators = asyncHandler(async (req: Request, res: Response) => {
    const { scholarshipId } = req.params as { scholarshipId: string };
    const list = await this.service.getScholarshipModerators(scholarshipId);
    ok(res, list);
  });

  assignScholarshipModerator = asyncHandler(async (req: Request, res: Response) => {
    const { scholarshipId, userId } = req.params as { scholarshipId: string; userId: string };
    await this.service.assignScholarshipModerator(scholarshipId, userId);
    noContent(res);
  });

  removeScholarshipModerator = asyncHandler(async (req: Request, res: Response) => {
    const { scholarshipId, userId } = req.params as { scholarshipId: string; userId: string };
    await this.service.removeScholarshipModerator(scholarshipId, userId);
    noContent(res);
  });

  // ── Course assignments ─────────────────────────────────────
  getCourseModerators = asyncHandler(async (req: Request, res: Response) => {
    const { courseId } = req.params as { courseId: string };
    const list = await this.service.getCourseModerators(courseId);
    ok(res, list);
  });

  assignCourseModerator = asyncHandler(async (req: Request, res: Response) => {
    const { courseId, userId } = req.params as { courseId: string; userId: string };
    await this.service.assignCourseModerator(courseId, userId);
    noContent(res);
  });

  removeCourseModerator = asyncHandler(async (req: Request, res: Response) => {
    const { courseId, userId } = req.params as { courseId: string; userId: string };
    await this.service.removeCourseModerator(courseId, userId);
    noContent(res);
  });
}
