import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/integrations/prisma-client/prisma.service';

@Injectable()
export class GetSubFeaturesHandler {
  constructor(private prisma: PrismaService) {}

  async main(featureId: string) {
    const feature = await this.prisma.feature.findUnique({
      where: { id: featureId },
      select: {
        id: true,
        subFeatures: true,
      },
    });

    if (!feature) throw new NotFoundException('Parent Feature not found');
    return feature.subFeatures;
  }
}
