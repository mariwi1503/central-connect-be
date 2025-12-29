import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/integrations/prisma-client/prisma.service';
import { UpdateComplaintCategoryDto } from '../dtos';

@Injectable()
export class UpdateComplaintCategoryHandler {
  constructor(private prisma: PrismaService) {}

  async main(id: string, payload: UpdateComplaintCategoryDto) {
    const { label, description, order } = payload;

    // 1. Pastikan kategori ada
    const category = await this.prisma.complaintCategory.findUnique({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException('Complaint category not found');
    }

    // 2. Jika label diubah, cek apakah label baru sudah dipakai kategori lain
    if (label && label !== category.label) {
      const duplicateLabel = await this.prisma.complaintCategory.findUnique({
        where: { label },
      });
      if (duplicateLabel) {
        throw new ConflictException('New label already exists');
      }
    }

    // 3. Update data
    return await this.prisma.complaintCategory.update({
      where: { id },
      data: {
        label,
        description,
        order,
      },
    });
  }
}
