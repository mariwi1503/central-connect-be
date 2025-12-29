import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/integrations/prisma-client/prisma.service';
import { CisService } from 'src/integrations/cis/cis.service';
import { CreateComplaintDto } from '../dtos';

@Injectable()
export class CreateComplaintHandler {
  constructor(
    private prisma: PrismaService,
    private cisService: CisService,
  ) {}

  async main(userId: string, payload: CreateComplaintDto) {
    const { title, content, unitId, complaintCategoryId, imageUrls } = payload;

    const category = await this.prisma.complaintCategory.findUnique({
      where: { id: complaintCategoryId },
    });
    if (!category) throw new NotFoundException('Complaint Category not found');

    // get unit in cis database
    const unitFromCis = await this.cisService.getUnitById(String(unitId));

    let localUnitId: string;
    // check unit in local database
    const unitLocal = await this.prisma.unit.findUnique({
      where: { cisId: unitId },
    });

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

      // create complaint
      const createComplaint = await t.complaint.create({
        data: {
          userId,
          title,
          content,
          complaintCategoryId,
          unitId: localUnitId,
        },
      });

      // save image url if it's proovided
      if (imageUrls?.length) {
        await t.complaintImage.createMany({
          data: imageUrls.map((url) => ({
            url,
            complaintId: createComplaint.id,
            complaintStatus: createComplaint.status,
          })),
        });
      }
    });
  }
}
