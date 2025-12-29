import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/integrations/prisma-client/prisma.service';
import { UpdateRoleDto } from '../dtos';

@Injectable()
export class UpdateRoleHandler {
  constructor(private prisma: PrismaService) {}

  async main(id: string, payload: UpdateRoleDto) {
    const { label, access = [], subFeatureIds = [], featureIds = [] } = payload;
    const role = await this.prisma.role.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!role) throw new NotFoundException('Role not found');

    await this.prisma.$transaction(async (t) => {
      if (label) {
        const existingRole = await this.prisma.role.findFirst({
          where: { label: { equals: label, mode: 'insensitive' } },
          select: { id: true },
        });

        if (existingRole && existingRole.id !== id)
          throw new ConflictException(`Role label ${label} already exists`);
      }

      // update role
      if (label || access.length > 0)
        await t.role.update({
          where: { id },
          data: {
            label,
            access: access.length > 0 ? access : undefined,
          },
        });

      if (subFeatureIds.length > 0) {
        // delete existing data
        await t.roleSubFeature.deleteMany({ where: { roleId: id } });

        // recreate
        await t.roleSubFeature.createMany({
          data: subFeatureIds.map((i) => ({ roleId: id, subFeatureId: i })),
        });
      }
      if (featureIds.length > 0) {
        // delete existing data
        await t.roleFeature.deleteMany({ where: { roleId: id } });

        // recreate
        await t.roleFeature.createMany({
          data: featureIds.map((i) => ({ roleId: id, featureId: i })),
        });
      }
    });
  }
}
