import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/integrations/prisma-client/prisma.service';

@Injectable()
export class GetRolesHandler {
  constructor(private prisma: PrismaService) {}

  async main() {
    const roles = await this.prisma.role.findMany();
    return roles;
  }
}
