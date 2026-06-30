import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CollegesService } from '../../src/modules/colleges/colleges.service.js';
import type { CollegesRepository } from '../../src/modules/colleges/colleges.repository.js';
import type { MajorsService } from '../../src/modules/majors/majors.service.js';
import { ConflictError, NotFoundError } from '../../src/shared/errors/app-error.js';
import { makeCollege, makeMajor } from '../fixtures/index.js';
import type { CollegeView } from '../../src/modules/colleges/colleges.types.js';
import type { MajorView } from '../../src/modules/majors/majors.types.js';

const collegeView = (over: Partial<CollegeView> = {}): CollegeView => {
  const c = makeCollege(over as never);
  return {
    id: c.id,
    slug: c.slug,
    name: c.name,
    description: c.description,
    isActive: c.isActive,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
    category: over.category ?? 'engineering',
    majors: over.majors ?? [],
  };
};

const majorView = (over: Partial<MajorView> = {}): MajorView => {
  const m = makeMajor(over as never);
  return {
    id: m.id,
    slug: m.slug,
    name: m.name,
    degree: over.degree ?? 'Bachelor',
    isActive: m.isActive,
    collegeId: m.collegeId,
    createdAt: m.createdAt,
    updatedAt: m.updatedAt,
  };
};

/** CollegesService unit tests — CRUD + College -> Majors. */
describe('CollegesService', () => {
  let repo: CollegesRepository;
  let majors: MajorsService;
  let service: CollegesService;

  beforeEach(() => {
    repo = {
      exists: vi.fn(),
      findById: vi.fn(),
      list: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    } as unknown as CollegesRepository;
    majors = {
      listByCollege: vi.fn().mockResolvedValue({ items: [], total: 0, page: 1, pageSize: 20, totalPages: 0 }),
    } as unknown as MajorsService;
    service = new CollegesService(repo, majors);
  });

  it('creates a college (description/isActive defaulted)', async () => {
    vi.mocked(repo.create).mockResolvedValue(collegeView());
    const result = await service.create({ slug: 'engineering', name: 'Engineering' });
    expect(repo.create).toHaveBeenCalledWith(
      expect.objectContaining({ slug: 'engineering', description: null, isActive: true }),
    );
    expect(result.name).toBe('Engineering');
  });

  it('gets a college by id', async () => {
    vi.mocked(repo.findById).mockResolvedValue(collegeView());
    expect((await service.getById('col_1')).slug).toBe('engineering');
  });

  it('throws NotFoundError for a missing college', async () => {
    vi.mocked(repo.findById).mockResolvedValue(null);
    await expect(service.getById('missing')).rejects.toBeInstanceOf(NotFoundError);
  });

  it('updates an existing college', async () => {
    vi.mocked(repo.findById).mockResolvedValue(collegeView());
    vi.mocked(repo.update).mockResolvedValue(collegeView({ name: 'Engineering & Tech' }));
    expect((await service.update('col_1', { name: 'Engineering & Tech' })).name).toBe(
      'Engineering & Tech',
    );
  });

  describe('listMajors (College -> Majors)', () => {
    it('returns the college majors via MajorsService', async () => {
      vi.mocked(repo.findById).mockResolvedValue(collegeView());
      vi.mocked(majors.listByCollege).mockResolvedValue({
        items: [majorView({ id: 'maj_civil', name: 'Civil Engineering', collegeId: 'col_1' })],
        total: 1,
        page: 1,
        pageSize: 20,
        totalPages: 1,
      });
      const { items, total } = await service.listMajors('col_1', 1, 20);
      expect(majors.listByCollege).toHaveBeenCalledWith('col_1', 1, 20);
      expect(total).toBe(1);
      expect(items[0]?.name).toBe('Civil Engineering');
    });

    it('404s when the college does not exist', async () => {
      vi.mocked(repo.findById).mockResolvedValue(null);
      await expect(service.listMajors('missing', 1, 20)).rejects.toBeInstanceOf(NotFoundError);
    });
  });

  describe('delete', () => {
    it('deletes a college with no majors', async () => {
      vi.mocked(repo.findById).mockResolvedValue(collegeView());
      vi.mocked(majors.listByCollege).mockResolvedValue({ items: [], total: 0, page: 1, pageSize: 20, totalPages: 0 });
      await service.delete('col_1');
      expect(repo.delete).toHaveBeenCalledWith('col_1');
    });

    it('refuses to delete a college that still has majors (ConflictError)', async () => {
      vi.mocked(repo.findById).mockResolvedValue(collegeView());
      vi.mocked(majors.listByCollege).mockResolvedValue({
        items: [majorView({ collegeId: 'col_1' })],
        total: 1,
        page: 1,
        pageSize: 20,
        totalPages: 1,
      });
      await expect(service.delete('col_1')).rejects.toBeInstanceOf(ConflictError);
      expect(repo.delete).not.toHaveBeenCalled();
    });
  });
});
