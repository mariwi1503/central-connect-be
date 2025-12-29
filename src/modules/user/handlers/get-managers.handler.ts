import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { PrismaService } from 'src/integrations/prisma-client/prisma.service';
import { createPaginator } from 'prisma-pagination';
import { GetManagersDto } from '../dtos';
import { Prisma } from '../../../generated/prisma/client';

@Injectable()
export class GetManagersHandler {
  constructor(private prisma: PrismaService) {}

  async main(query: GetManagersDto) {
    const { page = 1, perPage = 25, search, isActive, roleIds = [] } = query;

    const paginate = createPaginator({ perPage });

    const where: Prisma.UserWhereInput = {
      deletedAt: null,
    };

    // Feature: Search by Name or Email (Case-Insensitive)
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (isActive !== undefined) {
      where.isActive = isActive === 1;
    }

    const residentRole = await this.prisma.role.findFirst({
      where: { label: { equals: 'resident', mode: 'insensitive' } },
    });
    if (!residentRole)
      throw new UnprocessableEntityException('Role resident not found');

    if (roleIds.length) {
      where.AND = [
        { roleId: { not: residentRole.id } },
        { roleId: { in: roleIds } },
      ];
    } else {
      where.roleId = { not: residentRole.id };
    }

    const users = await paginate(
      this.prisma.user,
      {
        where,
        include: {
          role: {
            select: { id: true, label: true },
          },
          userUnits: {
            include: {
              unit: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
      {
        page,
      },
    );

    const mapingUser = users.data.map((x: any) => {
      const units = x.userUnits.map((y) => ({
        unitId: y.unitId,
        unitCisId: y.unit.cisId,
        unitName: y.unit.name,
        isApproved: y.isApproved,
      }));

      return {
        ...x,
        totalUnit: units.length ?? 0,
        password: undefined,
        userUnits: units,
      };
    });

    return {
      data: mapingUser,
      meta: users.meta,
    };
  }
}
