import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { PrismaService } from 'src/integrations/prisma-client/prisma.service';
import { CreateManagertDto } from '../dtos/create-manager.dto';
import { CisService } from 'src/integrations/cis/cis.service';
import { generateRandomPassword } from 'src/utils';
import bcrypt from 'bcryptjs';
import { MailService } from 'src/integrations/mail/mail.service';

@Injectable()
export class CreateManagertHandler {
  constructor(
    private prisma: PrismaService,
    private cisService: CisService,
    private mailService: MailService,
  ) {}

  async main(payload: CreateManagertDto) {
    const {
      email,
      name,
      phone,
      imageUrl,
      isResident,
      isDashboardAccessGranted,
      isReceiveEmergency,
      roleId,
      projectIds = [],
      complaintCategoryIds = [],
    } = payload;

    // check for duplicated email
    const exsitingEmail = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: { email: true, deletedAt: true },
    });
    if (exsitingEmail) {
      if (exsitingEmail.deletedAt)
        throw new UnprocessableEntityException('Please reactivate the account');
      throw new ConflictException('Email already exist');
    }

    const role = await this.prisma.role.findUnique({
      where: { id: roleId },
      select: { id: true },
    });

    if (!role) throw new NotFoundException('Role not found');

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

    const projectLocalIds: string[] = [];
    for (const id of projectIds) {
      const projectFromCis = await this.cisService.getProjectById(String(id));
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

    const randomPassword = generateRandomPassword(6);
    const password = await bcrypt.hash(randomPassword, 10);

    await this.prisma.$transaction(async (t) => {
      const createUser = await t.user.create({
        data: {
          email,
          name,
          phone,
          imageUrl,
          isResident,
          isDashboardAccessGranted,
          isReceiveEmergency,
          roleId,
          password,
        },
      });

      await t.userComplaintCategory.createMany({
        data: complaintCategoryIds.map((x) => ({
          userId: createUser.id,
          complaintCategoryId: x,
        })),
      });

      await t.userManagedProject.createMany({
        data: projectLocalIds.map((x) => ({
          userId: createUser.id,
          projectId: x,
        })),
      });

      await this.mailService.createNewUser(email, randomPassword, name);
    });
  }
}
