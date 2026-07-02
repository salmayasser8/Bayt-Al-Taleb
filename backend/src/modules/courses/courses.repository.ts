import type { Database } from '../../infrastructure/database/prisma.js';

export class CoursesRepository {
  constructor(private readonly db: Database) {}

  async findByMajorId(majorId: string) {
    return this.db.course.findMany({
      where: { majorId },
      orderBy: [{ year: 'asc' }, { code: 'asc' }],
    });
  }

  async findById(id: string) {
    return this.db.course.findUnique({ where: { id } });
  }
}
