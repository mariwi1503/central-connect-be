import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/integrations/prisma-client/prisma.service';

@Injectable()
export class DeleteComplaintCategoryHandler {
  constructor(private prisma: PrismaService) {}

  async main(id: string) {
    // 1. Cek keberadaan data
    const category = await this.prisma.complaintCategory.findUnique({
      where: { id },
    });

    if (!category || category.deletedAt) {
      throw new NotFoundException('Complaint category not found or already deleted');
    }

    // 2. Lakukan Soft Delete (isi kolom deletedAt)
    return await this.prisma.complaintCategory.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
  }
}