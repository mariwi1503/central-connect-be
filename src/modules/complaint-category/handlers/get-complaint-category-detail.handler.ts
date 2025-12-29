import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/integrations/prisma-client/prisma.service';

@Injectable()
export class GetComplaintCategoryDetailHandler {
  constructor(private prisma: PrismaService) {}

  async main(id: string) {
    // 1. Cari kategori berdasarkan ID
    const category = await this.prisma.complaintCategory.findUnique({
      where: { id },
      // Opsi: Jika ingin melihat daftar komplain di dalam kategori ini,
      // bisa tambahkan include di sini
      include: {
        _count: {
          select: { compaints: true }, // Menghitung jumlah komplain di kategori ini
        },
      },
    });

    // 2. Validasi keberadaan data dan status soft-delete
    if (!category || category.deletedAt) {
      throw new NotFoundException('Complaint category not found');
    }

    return category;
  }
}
