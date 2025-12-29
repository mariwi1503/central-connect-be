import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/integrations/prisma-client/prisma.service';

@Injectable()
export class GetComplaintCategoriesHandler {
  constructor(private prisma: PrismaService) {}

  async main() {
    return await this.prisma.complaintCategory.findMany();
  }
}
