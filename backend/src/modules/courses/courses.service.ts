import type { CoursesRepository } from './courses.repository.js';

export class CoursesService {
  constructor(private readonly repo: CoursesRepository) {}

  async getCoursesByMajor(majorId: string) {
    return this.repo.findByMajorId(majorId);
  }

  async findById(id: string) {
    return this.repo.findById(id);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async createCourse(majorId: string, courseData: any) {
    return this.repo.create(majorId, courseData);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async updateCourse(id: string, courseData: any) {
    return this.repo.update(id, courseData);
  }

  async deleteCourse(id: string) {
    return this.repo.delete(id);
  }

  async getModeratorsList() {
    return this.repo.findModerators();
  }

  async assignModerator(courseId: string, userId: string) {
    return this.repo.assignModerator(courseId, userId);
  }

  async revokeModerator(courseId: string, userId: string) {
    return this.repo.revokeModerator(courseId, userId);
  }
  async exists(_ownerType: string, ownerId: string): Promise<boolean> {
    const course = await this.repo.findById(ownerId);
    return course !== null;
  }
}
