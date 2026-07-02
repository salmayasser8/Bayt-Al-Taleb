import type { ScholarshipsRepository } from './scholarships.repository.js';
import type {
  CreateScholarshipInput,
  UpdateScholarshipInput,
  ListScholarshipsQuery,
} from './scholarships.validation.js';
import type { ScholarshipDto } from './scholarships.dto.js';
import { ConflictError, NotFoundError } from '../../shared/errors/app-error.js';
import type { Scholarship, ContentEntityType, FileOwnerType } from '@prisma/client';

export class ScholarshipsService {
  constructor(private readonly repo: ScholarshipsRepository) {}

  async list(
    query: ListScholarshipsQuery,
  ): Promise<{ items: ScholarshipDto[]; total: number; page: number; limit: number }> {
    const { items, total } = await this.repo.findAll({
      page: query.page,
      limit: query.limit,
      search: query.search,
    });
    return { items: items.map(this.#toDto), total, page: query.page, limit: query.limit };
  }

  async getById(id: string): Promise<ScholarshipDto> {
    const s = await this.repo.findById(id);
    if (!s) throw new NotFoundError(`Scholarship ${id} not found`);
    return this.#toDto(s);
  }

  async create(input: CreateScholarshipInput): Promise<ScholarshipDto> {
    const existing = await this.repo.findBySlug(input.slug);
    if (existing) throw new ConflictError(`Slug "${input.slug}" is already in use`);
    const s = await this.repo.create(input);
    return this.#toDto(s);
  }

  async update(id: string, input: UpdateScholarshipInput): Promise<ScholarshipDto> {
    const existing = await this.repo.findById(id);
    if (!existing) throw new NotFoundError(`Scholarship ${id} not found`);
    if (input.slug && input.slug !== existing.slug) {
      const slugTaken = await this.repo.findBySlug(input.slug);
      if (slugTaken) throw new ConflictError(`Slug "${input.slug}" is already in use`);
    }
    const s = await this.repo.update(id, input);
    return this.#toDto(s);
  }

  async delete(id: string, deletedById: string, deleteReason?: string): Promise<void> {
    const existing = await this.repo.findById(id);
    if (!existing) throw new NotFoundError(`Scholarship ${id} not found`);
    await this.repo.softDelete(id, deletedById, deleteReason);
  }

  async exists(entityType: ContentEntityType | string, id?: string): Promise<boolean> {
    if (id === undefined) {
      return (await this.repo.findById(entityType as string)) !== null;
    }
    if (entityType !== 'SCHOLARSHIP') return false;
    return (await this.repo.findById(id)) !== null;
  }

  async fileOwnerExists(ownerType: FileOwnerType, ownerId: string): Promise<boolean> {
    if (ownerType !== 'SCHOLARSHIP') return false;
    return (await this.repo.findById(ownerId)) !== null;
  }

  #toDto(s: Scholarship): ScholarshipDto {
    return {
      id: s.id,
      slug: s.slug,
      name: s.name,
      isActive: s.isActive,
      startDate: s.startDate,
      endDate: s.endDate,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
    };
  }
}
