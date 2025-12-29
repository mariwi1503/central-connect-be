import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/integrations/prisma-client/prisma.service';
import { GetComplaintsDto } from '../dtos';
import { createPaginator } from 'prisma-pagination';
import { Prisma } from 'src/generated/prisma/client';

@Injectable()
export class GetComplaintsHandler {
  constructor(private prisma: PrismaService) {}

  async main(query: GetComplaintsDto) {
    const {
      search,
      page = 1,
      perPage = 25,
      startDate,
      endDate,
      status,
    } = query;

    // 1. Inisialisasi object condition
    const where: Prisma.ComplaintWhereInput = {
      deletedAt: null, // Hanya ambil yang belum dihapus (soft delete)
    };

    // 2. Tambahkan filter search (jika ada)
    if (search) {
      where.OR = [{ title: { contains: search, mode: 'insensitive' } }];
    }

    // 3. Tambahkan filter Date Range (jika ada)
    if (startDate || endDate) {
      where.createdAt = {};

      if (startDate) {
        // Mulai dari jam 00:00:00 hari tersebut
        where.createdAt.gte = new Date(`${startDate}T00:00:00.000Z`);
      }

      if (endDate) {
        // Sampai jam 23:59:59 hari tersebut
        where.createdAt.lte = new Date(`${endDate}T23:59:59.999Z`);
      }
    }

    if (status) where.status = status;

    this.prisma.user.findMany({
      select: {
        id: true,
        name: true,
      },
    });

    // 4. Jalankan paginasi
    const paginate = createPaginator({ perPage });

    return paginate<any, Prisma.ComplaintFindManyArgs>(
      this.prisma.complaint,
      {
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
          complaintCategory: {
            select: {
              label: true,
              description: true,
            },
          },
          unit: true,
          complaintImages: {
            select: {
              url: true,
              complaintStatus: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      },
      { page },
    );
  }
}
