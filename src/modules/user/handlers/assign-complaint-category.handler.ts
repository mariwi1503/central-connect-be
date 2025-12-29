import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { PrismaService } from 'src/integrations/prisma-client/prisma.service';
import { AssignComplaintCategoryDto } from '../dtos';

@Injectable()
export class AssignComplaintCategoryHandler {
  constructor(private prisma: PrismaService) {}

  async main(userId: string, payload: AssignComplaintCategoryDto) {
    const { complaintCategoryIds = [] } = payload;
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, isDashboardAccessGranted: true },
    });

    if (!user) throw new NotFoundException('User not found');
    if (!user.isDashboardAccessGranted)
      throw new UnprocessableEntityException(
        'Dashboard permission is not granted for this account.',
      );

    const complaintCategories = await this.prisma.complaintCategory.findMany({
      where: { id: { in: complaintCategoryIds } },
      select: { id: true },
    });

    let notExistCategories: string[] = [];
    const foundCategories = complaintCategories.map((x) => x.id);
    if (foundCategories.length !== complaintCategoryIds.length) {
      notExistCategories = complaintCategoryIds.filter(
        (x) => !foundCategories.includes(x),
      );
    }

    if (notExistCategories.length)
      throw new NotFoundException(
        `Category Ids [${notExistCategories.join(', ')}] not found`,
      );

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        userComplaintCategories: {
          // Hapus semua koneksi kategori lama untuk user ini
          deleteMany: {},
          // Buat koneksi kategori baru
          create: complaintCategoryIds.map((id) => ({
            complaintCategoryId: id,
          })),
        },
      },
    });

    // await this.prisma.$transaction(async (t) => {
    //   // delete existing
    //   await t.userComplaintCategory.deleteMany({
    //     where: { userId },
    //   });

    //   // create new record
    //   await t.userComplaintCategory.createMany({
    //     data: complaintCategoryIds.map((x) => ({
    //       userId,
    //       complaintCategoryId: x,
    //     })),
    //   });
    // });
  }
}
