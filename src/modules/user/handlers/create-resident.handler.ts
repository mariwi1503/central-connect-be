import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { PrismaService } from 'src/integrations/prisma-client/prisma.service';
import { CreateResidentDto } from '../dtos';
import { CisService } from 'src/integrations/cis/cis.service';
import bcrypt from 'bcryptjs';
import { generateRandomPassword } from 'src/utils';
import { MailService } from 'src/integrations/mail/mail.service';

@Injectable()
export class CreateResidentHandler {
  constructor(
    private prisma: PrismaService,
    private cisService: CisService,
    private mailService: MailService,
  ) {}

  async main(payload: CreateResidentDto) {
    const { name, email, imageUrl, unitId, phone } = payload;

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

    // get unit in cis database
    const unitFromCis = await this.cisService.getUnitById(String(unitId));

    let localUnitId: string;
    // check unit in local database
    const unitLocal = await this.prisma.unit.findUnique({
      where: { cisId: unitId },
    });

    const randomPassword = generateRandomPassword(6);
    const password = await bcrypt.hash(randomPassword, 10);

    await this.prisma.$transaction(async (t) => {
      if (!unitLocal) {
        // check cluster
        const clusterFromCis = await this.cisService.getClusterById(
          unitFromCis.cluster.id,
        );
        if (!clusterFromCis)
          throw new InternalServerErrorException(
            'Cluster not found in CIS database',
          );

        // check project
        const projectFromCis = await this.cisService.getProjectById(
          clusterFromCis.project_id,
        );
        if (!projectFromCis)
          throw new InternalServerErrorException(
            'Project not found in CIS database',
          );

        // synch project
        const upsertProjectInLocalDb = await t.project.upsert({
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

        // synch cluster
        const upsertClusterInLocalDb = await t.cluster.upsert({
          where: { cisId: clusterFromCis.id },
          create: {
            cisId: clusterFromCis.id,
            name: clusterFromCis.name,
            cisProjectId: clusterFromCis.project_id,
            projectId: upsertProjectInLocalDb.id,
          },
          update: {
            name: clusterFromCis.name,
            projectId: upsertProjectInLocalDb.id,
          },
        });

        // synch unit
        const createUnitInLocalDb = await t.unit.create({
          data: {
            cisId: unitId,
            cisClusterId: unitFromCis.cluster.id,
            name: unitFromCis.name,
            state: unitFromCis.state,
            buildingType: unitFromCis.building_type?.name.toUpperCase(),
            unitType: unitFromCis.unit_type?.name,
            lb: unitFromCis.unit_type?.lb,
            lt: unitFromCis.unit_type?.lt,
            internalBastbDate: unitFromCis.internal_bastb_date
              ? `${unitFromCis.internal_bastb_date.split(' ')[0]}T08:00:00.000Z`
              : undefined,
            clusterId: upsertClusterInLocalDb.id,
          },
        });

        localUnitId = createUnitInLocalDb.id;
      } else {
        // update local unit
        await t.unit.update({
          where: { cisId: unitId },
          data: {
            name: unitFromCis.name,
            state: unitFromCis.state,
            buildingType: unitFromCis.building_type?.name.toUpperCase(),
            unitType: unitFromCis.unit_type?.name,
            lb: unitFromCis.unit_type?.lb,
            lt: unitFromCis.unit_type?.lt,
            internalBastbDate: unitFromCis.internal_bastb_date
              ? `${unitFromCis.internal_bastb_date.split(' ')[0]}T08:00:00.000Z`
              : undefined,
          },
        });

        localUnitId = unitLocal.id;
      }

      const defaultRole = await t.role.findUnique({
        where: { key: 'resident' },
        select: { id: true },
      });

      await t.user.create({
        data: {
          email: email.toLowerCase(),
          password,
          phone,
          name,
          imageUrl,
          isResident: true,
          roleId: defaultRole ? defaultRole.id : undefined,
          userUnits: {
            create: {
              unitId: localUnitId,
            },
          },
        },
      });

      await this.mailService.createNewUser(email, randomPassword, name);
    });
  }
}
