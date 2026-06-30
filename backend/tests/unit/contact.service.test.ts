import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ContactService } from '../../src/modules/contact/contact.service.js';
import type { ContactRepository } from '../../src/modules/contact/contact.repository.js';
import { NotFoundError } from '../../src/shared/errors/app-error.js';

/** ContactService unit tests — submit, list, mark handled. */
describe('ContactService', () => {
  let repo: ContactRepository;
  let service: ContactService;
  const audit = { log: vi.fn() } as const;

  const msg = (over = {}) => ({
    id: 'c1',
    name: 'Sara',
    email: 'sara@example.com',
    subject: 'Hi',
    body: 'Hello there',
    isHandled: false,
    createdAt: new Date(),
    ...over,
  });

  beforeEach(() => {
    repo = {
      create: vi.fn(),
      findById: vi.fn(),
      list: vi.fn(),
      markHandled: vi.fn(),
    } as unknown as ContactRepository;
    service = new ContactService(repo, audit as any);
  });

  it('submits a contact message', async () => {
    vi.mocked(repo.create).mockResolvedValue(msg() as never);
    const result = await service.submit({
      name: 'Sara',
      email: 'sara@example.com',
    
      subject: 'Hi',
      body: 'Hello there',
    });
    expect(result.isHandled).toBe(false);
    expect(repo.create).toHaveBeenCalledOnce();
  });

  it('lists messages with pagination passthrough', async () => {
    vi.mocked(repo.list).mockResolvedValue({ items: [msg() as never], total: 1 });
    const result = await service.list({ page: 1, pageSize: 20 });
    expect(result.total).toBe(1);
    expect(result.items).toHaveLength(1);
  });

  it('marks a message handled', async () => {
    vi.mocked(repo.findById).mockResolvedValue(msg() as never);
    vi.mocked(repo.markHandled).mockResolvedValue(msg({ isHandled: true }) as never);
    const result = await service.markHandled('c1');
    expect(result.isHandled).toBe(true);
  });

  it('throws NotFoundError when marking a missing message', async () => {
    vi.mocked(repo.findById).mockResolvedValue(null);
    await expect(service.markHandled('missing')).rejects.toBeInstanceOf(NotFoundError);
  });
});
