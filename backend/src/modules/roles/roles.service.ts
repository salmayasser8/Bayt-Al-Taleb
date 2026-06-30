import type { RolesRepository } from './roles.repository.js';
import type { RoleName } from '@prisma/client';
import { NotFoundError } from '../../shared/errors/app-error.js';

export interface RoleWithPermissions {
  id: string;
  name: RoleName;
  description: string | null;
  permissions: string[];
  createdAt: Date;
}

export class RolesService {
  constructor(private readonly repo: RolesRepository) {}

  async listRoles(): Promise<RoleWithPermissions[]> {
    const roles = await this.repo.findAll();
    return roles.map(r => ({
      id:          r.id,
      name:        r.name,
      description: r.description,
      createdAt:   r.createdAt,
      permissions: (r as any).rolePermissions?.map((rp: any) => rp.permission.key) ?? [],
    }));
  }

  async list() {
    return this.listRoles();
  }

  async assignRole(userId: string, roleName: RoleName): Promise<void> {
    const role = await this.repo.findByName(roleName);
    if (!role) throw new NotFoundError(`Role ${roleName} not found`);
    await this.repo.assignRoleToUser(userId, roleName);
  }
}