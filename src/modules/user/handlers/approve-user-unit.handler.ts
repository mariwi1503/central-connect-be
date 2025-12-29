import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { PrismaService } from 'src/integrations/prisma-client/prisma.service';

@Injectable()
export class ApproveUserUnitHandler {
  constructor(private prisma: PrismaService) {}

  async main(id: string) {
    const userUnit = await this.prisma.userUnit.findUnique({
      where: { id },
    });
    if (!userUnit) throw new NotFoundException('User unit not found');

    // update
    await this.prisma.userUnit.update({
      where: { id: userUnit.id },
      data: { isApproved: true },
    });
  }
}
