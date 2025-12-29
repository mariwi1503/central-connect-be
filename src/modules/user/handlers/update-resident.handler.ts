import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/integrations/prisma-client/prisma.service';
import { UpdateResidentDto } from '../dtos';
import { CisService } from 'src/integrations/cis/cis.service';

@Injectable()
export class UpdateResidentHandler {
  constructor(
    private prisma: PrismaService,
    private cisService: CisService,
  ) {}

  async main(userId: string, payload: UpdateResidentDto) {
    const { email, name, phone, imageUrl, unitCisIds = [] } = payload;
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) throw new NotFoundException('User not found');

    if (email) {
      const existingEmail = await this.prisma.user.findUnique({
        where: { email: email.toLowerCase() },
        select: { id: true },
      });
      if (existingEmail) throw new ConflictException('Email already used');
    }

    const unitLocalUuids: string[] = [];
    await this.prisma.$transaction(async (t) => {
      for (const id of unitCisIds) {
        const unitFromCis = await this.cisService.getUnitById(String(id));
        // check unit in local database
        const unitLocal = await this.prisma.unit.findUnique({
          where: { cisId: id },
        });

        if (unitLocal) {
          unitLocalUuids.push(unitLocal.id);
        } else {
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
              cisId: id,
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

          unitLocalUuids.push(createUnitInLocalDb.id);
        }
      }

      await t.user.update({
        where: { id: userId },
        data: {
          email,
          name,
          phone,
          imageUrl,
          userUnits: unitCisIds.length
            ? {
                deleteMany: {},
                create: unitLocalUuids.map((id) => ({ unitId: id })),
              }
            : undefined,
        },
      });
    });
  }
}
