import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/integrations/prisma-client/prisma.service';
import { UpdateManagertDto } from '../dtos/update-manager.dto';
import { CisService } from 'src/integrations/cis/cis.service';

@Injectable()
export class UpdateManagerHandler {
  constructor(
    private prisma: PrismaService,
    private cisService: CisService,
  ) {}

  async main(userId: string, payload: UpdateManagertDto) {
    const {
      email,
      name,
      phone,
      imageUrl,
      // isResident,
      isDashboardAccessGranted,
      isReceiveEmergency,
      roleId,
      projectIds = [],
      complaintCategoryIds = [],
    } = payload;

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) throw new NotFoundException('User not found');

    if (email) {
      // check for duplicated email
      const exsitingEmail = await this.prisma.user.findFirst({
        where: { email: email.toLowerCase(), id: { not: userId } },
        select: { email: true, deletedAt: true },
      });
      if (exsitingEmail) throw new ConflictException('Email already exist');
    }

    if (roleId) {
      const role = await this.prisma.role.findUnique({
        where: { id: roleId },
        select: { id: true },
      });

      if (!role) throw new NotFoundException('Role not found');

      if (complaintCategoryIds.length) {
        const complaintCategories =
          await this.prisma.complaintCategory.findMany({
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
      }

      const projectLocalIds: string[] = [];
      if (projectIds.length) {
        for (const id of projectIds) {
          const projectFromCis = await this.cisService.getProjectById(
            String(id),
          );
          if (!projectFromCis)
            throw new InternalServerErrorException(
              `Project with id ${id} not found in CIS database`,
            );

          // synch project
          const upsertProjectInLocalDb = await this.prisma.project.upsert({
            where: { cisId: projectFromCis.id },
            create: {
              cisId: projectFromCis.id,
              name: projectFromCis.name,
              code: projectFromCis.code,
            },
            update: {
              name: projectFromCis.name,
              code: projectFromCis.code,
            },
          });

          projectLocalIds.push(upsertProjectInLocalDb.id);
        }
      }

      // update
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          email,
          name,
          phone,
          imageUrl,
          isDashboardAccessGranted,
          isReceiveEmergency,
          roleId,
          userComplaintCategories: complaintCategoryIds.length
            ? {
                deleteMany: {},
                create: complaintCategoryIds.map((id) => ({
                  complaintCategoryId: id,
                })),
              }
            : undefined,
          userManagedProjects: projectLocalIds.length
            ? {
                deleteMany: {},
                create: projectLocalIds.map((id) => ({ projectId: id })),
              }
            : undefined,
        },
      });
    }
  }
}
