import type { UsersRepository } from './users.repository.js';
import type { PasswordHasher } from '../auth/auth.types.js';
import type { CreateUserInput, UpdateUserInput, ListUsersQuery } from './users.validation.js';

import type { UserDto } from './users.dto.js';
import { ConflictError, NotFoundError } from '../../shared/errors/app-error.js';
import type { RoleName } from '@prisma/client';

export interface UserRoleNotifier {
  notifyUser(data: { userId: string; title: string; message: string; metadata?: unknown }): Promise<void>;
}

export class UsersService {
  constructor(
    private readonly repo: UsersRepository,
    private readonly hasher: PasswordHasher,
    private readonly notifier?: UserRoleNotifier,
  ) {}

  // ─── List ────────────────────────────────────────────────────

  async list(query: ListUsersQuery): Promise<{ items: UserDto[]; total: number; page: number; limit: number }> {
    const { items, total } = await this.repo.findAll({
      page:   query.page,
      limit:  query.limit,
      search: query.search,
      role:   query.role,
    });

    return {
      items: items.map(this.#toDto),
      total,
      page:  query.page,
      limit: query.limit,
    };
  }

  // ─── Get one ─────────────────────────────────────────────────

  async getById(id: string): Promise<UserDto> {
    const user = await this.repo.findById(id);
    if (!user) throw new NotFoundError(`User ${id} not found`);
    return this.#toDto(user);
  }

  // ─── Create ──────────────────────────────────────────────────

  async create(input: CreateUserInput): Promise<UserDto> {
    const existing = await this.repo.findByEmail(input.email);
    if (existing) throw new ConflictError('Email is already in use');

    const passwordHash = await this.hasher.hash(input.password);
    const user = await this.repo.create({
      email: input.email,
      passwordHash,
      fullName: input.fullName,
      roleId:   input.roleId,
    });

    return this.#toDto(user);
  }

  // ─── Update ──────────────────────────────────────────────────

  async update(id: string, input: UpdateUserInput): Promise<UserDto> {
    const existing = await this.repo.findById(id);
    if (!existing) throw new NotFoundError(`User ${id} not found`);

    const roleChanged = input.roleId && input.roleId !== existing.roleId;

    const user = await this.repo.update(id, {
      fullName: input.fullName,
      isActive: input.isActive,
      roleId:   input.roleId,
    });

    if (roleChanged && this.notifier) {
      const roleName = user.role.name;
      const title =
        roleName === 'MODERATOR'
          ? 'ترقية إلى مشرف '
          : roleName === 'ADMIN'
            ? 'ترقية إلى مسؤول '
            : 'تحديث الدور ';
      const message =
        roleName === 'MODERATOR'
          ? 'تمت ترقية حسابك إلى مشرف (Moderator). يمكنك الآن الإشراف على المحتوى الأكاديمي ومراجعة الملفات.'
          : roleName === 'ADMIN'
            ? 'تمت ترقية حسابك إلى مسؤول (Admin).'
            : `تم تعديل دور حسابك إلى ${roleName}.`;

      this.notifier
        .notifyUser({
          userId: id,
          title,
          message,
          metadata: { type: 'ROLE_CHANGED', newRole: roleName },
        })
        .catch(() => undefined);
    }

    return this.#toDto(user);
  }

  // ─── Delete ──────────────────────────────────────────────────

  async delete(id: string): Promise<void> {
    const existing = await this.repo.findById(id);
    if (!existing) throw new NotFoundError(`User ${id} not found`);
    await this.repo.delete(id);
  }

  // ─── Helpers ─────────────────────────────────────────────────

  #toDto(user: { id: string; email: string; fullName: string; role: { name: string }; isActive: boolean; createdAt: Date; updatedAt: Date }): UserDto {
    return {
      id:        user.id,
      email:     user.email,
      fullName:  user.fullName,
      role:      user.role.name as RoleName,
      isActive:  user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}