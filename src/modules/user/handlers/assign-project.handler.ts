import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { PrismaService } from 'src/integrations/prisma-client/prisma.service';
import { AssignProjectDto } from '../dtos';
import { CisService } from 'src/integrations/cis/cis.service';

@Injectable()
export class AssignProjectHandler {
  constructor(
    private prisma: PrismaService,
    private cisService: CisService,
  ) {}

  async main(userId: string, payload: AssignProjectDto) {
    const { projectIds } = payload;
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, isDashboardAccessGranted: true },
    });

    if (!user) throw new NotFoundException('User not found');
    if (!user.isDashboardAccessGranted)
      throw new UnprocessableEntityException(
        'Dashboard permission is not granted for this account.',
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

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        userManagedProjects: {
          deleteMany: {},
          create: projectLocalIds.map((id) => ({ projectId: id })),
        },
      },
    });
  }
}
