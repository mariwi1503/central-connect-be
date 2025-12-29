import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { PrismaService } from 'src/integrations/prisma-client/prisma.service';

@Injectable()
export class ApproveUserHandler {
  constructor(private prisma: PrismaService) {}

  async main(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true, status: true },
    });
    if (!user) throw new NotFoundException('User not found');
    if (user.status === 'REJECTED')
      throw new UnprocessableEntityException('Cannot approve a rejected user');

    // update user
    await this.prisma.user.update({
      where: { id: user.id },
      data: { status: 'APPROVED' },
    });
  }
}
