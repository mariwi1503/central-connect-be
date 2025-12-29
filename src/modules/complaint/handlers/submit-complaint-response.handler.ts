import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/integrations/prisma-client/prisma.service';
import { SubmitComplaintResponseDto } from '../dtos';

@Injectable()
export class SubmitComplaintResponseHandler {
  constructor(private prisma: PrismaService) {}

  async main(
    userId: string,
    complaintId: string,
    payload: SubmitComplaintResponseDto,
  ) {
    const { status, imageUrls, estimatedFinishAt, response } = payload;
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: { id: true },
    });

    // complaint
    const complaint = await this.prisma.complaint.findUnique({
      where: { id: complaintId },
    });
    if (!complaint) throw new NotFoundException('Complaint not found');

    await this.prisma.$transaction(async (t) => {
      await t.complaint.update({
        where: { id: complaintId },
        data: {
          status,
          estimatedFinishAt,
        },
      });
    });
  }
}
