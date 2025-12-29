import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/integrations/prisma-client/prisma.service';
import { CreateComplaintCategoryDto } from '../dtos'; // Pastikan DTO ini sudah dibuat

@Injectable()
export class CreateComplaintCategoryHandler {
  constructor(private prisma: PrismaService) {}

  async main(payload: CreateComplaintCategoryDto) {
    const { label, description, order } = payload;

    // 1. Cek duplikasi label (karena di model @unique)
    const existingCategory = await this.prisma.complaintCategory.findUnique({
      where: { label },
    });

    if (existingCategory) {
      throw new ConflictException('Category label already exists');
    }

    // 2. Create data
    return await this.prisma.complaintCategory.create({
      data: {
        label,
        description,
        order,
      },
    });
  }
}
