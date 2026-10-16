import type { Database } from '../../infrastructure/database/prisma.js';
import { NotFoundError } from '../../shared/errors/app-error.js';

export interface ModeratorAssignment {
  id: string;
  fullName: string;
  email: string;
}

export interface ModeratorNotifier {
  notifyUser(data: { userId: string; title: string; message: string; metadata?: unknown }): Promise<void>;
}

export class ModeratorsService {
  constructor(
    private readonly db: Database,
    private readonly notifier?: ModeratorNotifier,
  ) {}

  async listModerators(): Promise<ModeratorAssignment[]> {
    return this.db.user.findMany({
      where: { role: { name: 'MODERATOR' } },
      select: { id: true, fullName: true, email: true },
      orderBy: { fullName: 'asc' },
    });
  }

  // ── Major assignments ──────────────────────────────────────

  async getMajorModerators(majorId: string): Promise<ModeratorAssignment[]> {
    const major = await this.db.major.findUnique({ where: { id: majorId } });
    if (!major) throw new NotFoundError(`Major ${majorId} not found`);

    const user = await this.db.major.findUnique({
      where: { id: majorId },
      select: {
        moderators: {
          select: { id: true, fullName: true, email: true },
          orderBy: { fullName: 'asc' },
        },
      },
    });
    return user?.moderators ?? [];
  }

  async assignMajorModerator(majorId: string, userId: string): Promise<void> {
    const major = await this.db.major.findUnique({ where: { id: majorId } });
    if (!major) throw new NotFoundError(`Major ${majorId} not found`);

    const user = await this.db.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundError(`User ${userId} not found`);

    await this.db.major.update({
      where: { id: majorId },
      data: { moderators: { connect: { id: userId } } },
    });

    if (this.notifier) {
      this.notifier
        .notifyUser({
          userId,
          title: 'تعيين كمشرف جديد 🛡️',
          message: `تم تعيينك كمشرف على تخصص "${major.name}". يمكنك الآن مراجعة واعتماد الملفات المرفوعة لهذا التخصص.`,
          metadata: { type: 'MODERATOR_ASSIGNED', entityType: 'MAJOR', entityId: majorId },
        })
        .catch(() => undefined);
    }
  }

  async removeMajorModerator(majorId: string, userId: string): Promise<void> {
    const major = await this.db.major.findUnique({ where: { id: majorId } });
    if (!major) throw new NotFoundError(`Major ${majorId} not found`);

    await this.db.major.update({
      where: { id: majorId },
      data: { moderators: { disconnect: { id: userId } } },
    });
  }

  // ── Scholarship assignments ────────────────────────────────

  async getScholarshipModerators(scholarshipId: string): Promise<ModeratorAssignment[]> {
    const scholarship = await this.db.scholarship.findUnique({ where: { id: scholarshipId } });
    if (!scholarship) throw new NotFoundError(`Scholarship ${scholarshipId} not found`);

    const result = await this.db.scholarship.findUnique({
      where: { id: scholarshipId },
      select: {
        moderators: {
          select: { id: true, fullName: true, email: true },
          orderBy: { fullName: 'asc' },
        },
      },
    });
    return result?.moderators ?? [];
  }

  async assignScholarshipModerator(scholarshipId: string, userId: string): Promise<void> {
    const scholarship = await this.db.scholarship.findUnique({ where: { id: scholarshipId } });
    if (!scholarship) throw new NotFoundError(`Scholarship ${scholarshipId} not found`);

    const user = await this.db.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundError(`User ${userId} not found`);

    await this.db.scholarship.update({
      where: { id: scholarshipId },
      data: { moderators: { connect: { id: userId } } },
    });

    if (this.notifier) {
      this.notifier
        .notifyUser({
          userId,
          title: 'تعيين كمشرف جديد 🛡️',
          message: `تم تعيينك كمشرف على منحة "${scholarship.name}". يمكنك الآن مراجعة واعتماد الملفات المرتبطة بهذه المنحة.`,
          metadata: { type: 'MODERATOR_ASSIGNED', entityType: 'SCHOLARSHIP', entityId: scholarshipId },
        })
        .catch(() => undefined);
    }
  }

  async removeScholarshipModerator(scholarshipId: string, userId: string): Promise<void> {
    const scholarship = await this.db.scholarship.findUnique({ where: { id: scholarshipId } });
    if (!scholarship) throw new NotFoundError(`Scholarship ${scholarshipId} not found`);

    await this.db.scholarship.update({
      where: { id: scholarshipId },
      data: { moderators: { disconnect: { id: userId } } },
    });
  }

  // ── Course assignments ─────────────────────────────────────

  async getCourseModerators(courseId: string): Promise<ModeratorAssignment[]> {
    const course = await this.db.course.findUnique({ where: { id: courseId } });
    if (!course) throw new NotFoundError(`Course ${courseId} not found`);

    const result = await this.db.course.findUnique({
      where: { id: courseId },
      select: {
        moderators: {
          select: { id: true, fullName: true, email: true },
          orderBy: { fullName: 'asc' },
        },
      },
    });
    return result?.moderators ?? [];
  }

  async assignCourseModerator(courseId: string, userId: string): Promise<void> {
    const course = await this.db.course.findUnique({ where: { id: courseId } });
    if (!course) throw new NotFoundError(`Course ${courseId} not found`);

    const user = await this.db.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundError(`User ${userId} not found`);

    await this.db.course.update({
      where: { id: courseId },
      data: { moderators: { connect: { id: userId } } },
    });

    if (this.notifier) {
      const courseName = course.nameAr || course.name;
      this.notifier
        .notifyUser({
          userId,
          title: 'تعيين كمشرف جديد 🛡️',
          message: `تم تعيينك كمشرف على مساق "${courseName}". يمكنك الآن مراجعة واعتماد الملفات المرفوعة لهذا المساق.`,
          metadata: { type: 'MODERATOR_ASSIGNED', entityType: 'COURSE', entityId: courseId },
        })
        .catch(() => undefined);
    }
  }

  async removeCourseModerator(courseId: string, userId: string): Promise<void> {
    const course = await this.db.course.findUnique({ where: { id: courseId } });
    if (!course) throw new NotFoundError(`Course ${courseId} not found`);

    await this.db.course.update({
      where: { id: courseId },
      data: { moderators: { disconnect: { id: userId } } },
    });
  }

  // ── List entities ──────────────────────────────────────────

  async listMajors() {
    return this.db.major.findMany({
      where: { deletedAt: null },
      select: { id: true, name: true, slug: true },
      orderBy: { name: 'asc' },
    });
  }

  async listScholarships() {
    return this.db.scholarship.findMany({
      where: { deletedAt: null },
      select: { id: true, name: true, slug: true },
      orderBy: { name: 'asc' },
    });
  }

  async listCourses() {
    return this.db.course.findMany({
      select: { id: true, name: true, nameAr: true, code: true },
      orderBy: [{ year: 'asc' }, { code: 'asc' }],
    });
  }
}
