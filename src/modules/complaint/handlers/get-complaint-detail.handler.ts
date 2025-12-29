import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/integrations/prisma-client/prisma.service';

@Injectable()
export class GetComplaintDetailHandler {
  constructor(private prisma: PrismaService) {}

  async main(id: string) {
    const complaint = await this.prisma.complaint.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            name: true,
          },
        },
        complaintCategory: {
          select: {
            label: true,
            description: true,
          },
        },
        unit: true,
      },
    });

    if (!complaint) throw new NotFoundException('Complaint not found');

    return complaint;
  }
}
