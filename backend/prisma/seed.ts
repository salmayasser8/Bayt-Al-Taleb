import { PrismaClient, RoleName } from '@prisma/client';
import { ROLE_PERMISSIONS, ALL_PERMISSIONS } from '../src/shared/rbac/permissions.js';

/**
 * Seeds the canonical roles and their permission grants.
 * Idempotent: safe to run repeatedly (upserts everything).
 *
 *   npx prisma db seed
 */
const prisma = new PrismaClient();

async function main() {
  // 1. Upsert every permission key.
  for (const key of ALL_PERMISSIONS) {
    await prisma.permission.upsert({
      where: { key },
      update: {},
      create: { key },
    });
  }

  // 2. Upsert each role and wire its permissions.
  for (const roleName of Object.values(RoleName)) {
    const role = await prisma.role.upsert({
      where: { name: roleName },
      update: {},
      create: { name: roleName },
    });

    const grantedKeys = ROLE_PERMISSIONS[roleName] ?? [];
    for (const key of grantedKeys) {
      const permission = await prisma.permission.findUniqueOrThrow({ where: { key } });
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: role.id, permissionId: permission.id } },
        update: {},
        create: { roleId: role.id, permissionId: permission.id },
      });
    }
  }

  // eslint-disable-next-line no-console
  console.log('✅ Seed complete: roles & permissions provisioned.');
}

main()
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
