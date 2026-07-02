import { NotFoundError } from '../../shared/errors/app-error.js';
import { CoursesRepository } from './courses.repository.js';

export class CoursesService {
  constructor(private readonly coursesRepo: CoursesRepository) {}

  async getCoursesByMajor(majorId: string) {
    return this.coursesRepo.findByMajorId(majorId);
  }

  async getCourseById(id: string) {
    const course = await this.coursesRepo.findById(id);
    if (!course) throw new NotFoundError(`Course ${id} not found`);
    return course;
  }
}
