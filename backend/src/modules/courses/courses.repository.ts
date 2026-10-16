import type { Database } from '../../infrastructure/database/prisma.js';

export class CoursesRepository {
  constructor(private readonly db: Database) {}

  async findByMajorId(majorId: string) {
    return this.db.course.findMany({
      where: { majorId },
      include: {
        moderators: {
          select: { id: true, fullName: true, email: true },
        },
      },
      orderBy: [{ year: 'asc' }, { code: 'asc' }],
    });
  }

  async findById(id: string) {
    return this.db.course.findUnique({ where: { id } });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async create(majorId: string, courseData: any) {
    return this.db.course.create({
      data: { ...courseData, majorId },
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async update(id: string, courseData: any) {
    return this.db.course.update({
      where: { id },
      data: courseData,
    });
  }

  async delete(id: string) {
    return this.db.course.delete({ where: { id } });
  }

  async findModerators() {
    return this.db.user.findMany({
      where: { role: { name: 'MODERATOR' } },
      select: { id: true, fullName: true, email: true },
    });
  }

  async assignModerator(courseId: string, userId: string) {
    return this.db.course.update({
      where: { id: courseId },
      data: { moderators: { connect: { id: userId } } },
    });
  }

  async revokeModerator(courseId: string, userId: string) {
    return this.db.course.update({
      where: { id: courseId },
      data: { moderators: { disconnect: { id: userId } } },
    });
  }
}
