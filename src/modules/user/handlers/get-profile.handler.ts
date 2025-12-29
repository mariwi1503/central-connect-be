import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/integrations/prisma-client/prisma.service';

@Injectable()
export class GetProfileHandler {
  constructor(private prisma: PrismaService) {}

  async main(id: string) {
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id } });
    return user;
  }
}
