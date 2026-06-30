import { beforeEach, describe, expect, it, vi } from 'vitest';
import { EntityType, type FaqView, type SectionView } from '../../src/modules/content/content.types.js';
import { ContentService } from '../../src/modules/content/content.service.js';
import type { ContentRepository } from '../../src/modules/content/content.repository.js';
import { NotFoundError } from '../../src/shared/errors/app-error.js';
import { makeSection, makeFaq } from '../fixtures/index.js';

describe('ContentService', () => {
  let repo: ContentRepository;
  let db: {
    major: { findFirst: ReturnType<typeof vi.fn> };
    scholarship: { findFirst: ReturnType<typeof vi.fn> };
    faq: { findFirst: ReturnType<typeof vi.fn> };
  };
  let service: ContentService;

  beforeEach(() => {
    repo = {
      findSections: vi.fn(),
      findSectionById: vi.fn(),
      createSection: vi.fn(),
      updateSection: vi.fn(),
      deleteSection: vi.fn(),
      findFaqs: vi.fn(),
      findFaqById: vi.fn(),
      createFaq: vi.fn(),
      updateFaq: vi.fn(),
      deleteFaq: vi.fn(),
    } as unknown as ContentRepository;

    db = {
      major: { findFirst: vi.fn() },
      scholarship: { findFirst: vi.fn() },
      faq: { findFirst: vi.fn() },
    };

    service = new ContentService(repo, db as any);
  });

  it('adds a section to a major', async () => {
    db.major.findFirst.mockResolvedValue({ id: 'maj_1' });
    vi.mocked(repo.createSection).mockResolvedValue(makeSection() as SectionView);

    const result = await service.addSection(EntityType.MAJOR, 'maj_1', {
      title: 'Overview',
      content: 'text',
    });

    expect(db.major.findFirst).toHaveBeenCalledWith({ where: { id: 'maj_1', deletedAt: null } });
    expect(repo.createSection).toHaveBeenCalledWith(EntityType.MAJOR, 'maj_1', {
      title: 'Overview',
      content: 'text',
    });
    expect(result.title).toBe('Overview');
  });

  it('adds a section to a scholarship', async () => {
    db.scholarship.findFirst.mockResolvedValue({ id: 'sch_1' });
    vi.mocked(repo.createSection).mockResolvedValue(
      makeSection({ entityType: 'SCHOLARSHIP', entityId: 'sch_1' }) as SectionView,
    );

    const result = await service.addSection(EntityType.SCHOLARSHIP, 'sch_1', {
      title: 'Eligibility',
      content: 'text',
    });

    expect(db.scholarship.findFirst).toHaveBeenCalledWith({ where: { id: 'sch_1', deletedAt: null } });
    expect(result.entityType).toBe(EntityType.SCHOLARSHIP);
  });

  it('rejects adding a section for a missing parent entity', async () => {
    db.major.findFirst.mockResolvedValue(null);

    await expect(
      service.addSection(EntityType.MAJOR, 'missing', { title: 't', content: 'c' }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it('gets sections for an existing owner', async () => {
    const section = makeSection();
    vi.mocked(repo.findSections).mockResolvedValue([section] as SectionView[]);

    const result = await service.getSections(EntityType.MAJOR, 'maj_1');

    expect(repo.findSections).toHaveBeenCalledWith(EntityType.MAJOR, 'maj_1');
    expect(result).toHaveLength(1);
  });

  it('edits an existing section', async () => {
    vi.mocked(repo.findSectionById).mockResolvedValue(makeSection() as SectionView);
    vi.mocked(repo.updateSection).mockResolvedValue(makeSection({ title: 'New' }) as SectionView);

    const updated = await service.editSection('sec_1', { title: 'New' });

    expect(repo.updateSection).toHaveBeenCalledWith('sec_1', { title: 'New' });
    expect(updated.title).toBe('New');
  });

  it('throws NotFoundError when editing a missing section', async () => {
    vi.mocked(repo.findSectionById).mockResolvedValue(null);
    await expect(service.editSection('sec_1', { title: 'New' })).rejects.toBeInstanceOf(NotFoundError);
  });

  it('removes an existing section', async () => {
    vi.mocked(repo.findSectionById).mockResolvedValue(makeSection() as SectionView);

    await service.removeSection('sec_1', 'admin_1', 'cleanup');

    expect(repo.deleteSection).toHaveBeenCalledWith('sec_1', 'admin_1', 'cleanup');
  });

  it('throws NotFoundError when removing a missing section', async () => {
    vi.mocked(repo.findSectionById).mockResolvedValue(null);
    await expect(service.removeSection('sec_1', 'admin_1')).rejects.toBeInstanceOf(NotFoundError);
  });

  it('adds, gets, edits, and removes FAQs', async () => {
    const faq = makeFaq();
    db.major.findFirst.mockResolvedValue({ id: 'maj_1' });
    vi.mocked(repo.createFaq).mockResolvedValue(faq as FaqView);
    vi.mocked(repo.findFaqs).mockResolvedValue([faq] as FaqView[]);
    vi.mocked(repo.findFaqById).mockResolvedValue(faq as FaqView);
    vi.mocked(repo.updateFaq).mockResolvedValue(makeFaq({ answer: 'B' }) as FaqView);

    const added = await service.addFaq(EntityType.MAJOR, 'maj_1', { question: 'Q?', answer: 'A' });
    expect(added.question).toBe('Q?');

    const list = await service.getFaqs(EntityType.MAJOR, 'maj_1');
    expect(list).toHaveLength(1);

    const updated = await service.editFaq('faq_1', { answer: 'B' });
    expect(updated.answer).toBe('B');

    db.faq.findFirst.mockResolvedValue({ id: 'faq_1' });
    await service.removeFaq('faq_1', 'admin_1', 'cleanup');
    expect(repo.deleteFaq).toHaveBeenCalledWith('faq_1', 'admin_1', 'cleanup');
  });
});
