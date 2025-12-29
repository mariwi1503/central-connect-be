import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/integrations/prisma-client/prisma.service';
import { GetUsersDto } from '../dtos';
import { createPaginator } from 'prisma-pagination';
import { Prisma, User } from 'prisma/generated/client';

@Injectable()
export class GetUsersHandler {
  constructor(private prisma: PrismaService) {}

  async main(query: GetUsersDto) {
    const {
      page = 1,
      perPage = 25,
      search,
      roleId,
      isActive,
      isResident,
    } = query;

    // 1. Define pagination function with desired limit
    const paginate = createPaginator({ perPage });

    // 2. Build dynamic filter (where clause)
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

    // Filters: Role, Status, and Residency
    if (roleId) where.roleId = roleId;
    if (isActive !== undefined) {
      where.isActive = isActive === 1;
    }

    if (isResident !== undefined) {
      where.isResident = isResident === 1;
    }

    // 3. Execute paginated query
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
