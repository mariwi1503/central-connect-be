import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/integrations/prisma-client/prisma.service';

@Injectable()
export class GetRoleDetailHandler {
  constructor(private prisma: PrismaService) {}

  async main(id: string) {
    const role = await this.prisma.role.findUnique({
      where: { id },
      include: {
        roleFeatures: true,
        roleSubFeatures: true,
      },
    });

    return role;
  }
}
