import type { Database } from '../../infrastructure/database/prisma.js';

export class SearchService {
  constructor(private readonly db: Database) {}

  async globalSearch(query: string) {
    if (!query || query.trim().length === 0) {
      return { majors: [], scholarships: [], colleges: [], total: 0 };
    }

    const searchTerm = query.trim();

    // Search Majors
    const majors = await this.db.major.findMany({
      where: {
        name: { contains: searchTerm, mode: 'insensitive' },
        deletedAt: null,
        isActive: true,
      },
      take: 20,
    });

    // Search Scholarships
    const scholarships = await this.db.scholarship.findMany({
      where: {
        name: { contains: searchTerm, mode: 'insensitive' },
        deletedAt: null,
        isActive: true,
      },
      take: 20,
    });

    const colleges = await this.db.college.findMany({
      where: {
        name: { contains: searchTerm, mode: 'insensitive' },
        isActive: true,
      },
      take: 20,
    });

    return {
      majors,
      scholarships,
      colleges,
      total: majors.length + scholarships.length + colleges.length,
    };
  }
}
