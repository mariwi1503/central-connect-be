import { Injectable } from '@nestjs/common';
import { FeatureType } from 'src/generated/prisma/enums';
import { PrismaService } from 'src/integrations/prisma-client/prisma.service';

@Injectable()
export class GetFeaturesHandler {
  constructor(private prisma: PrismaService) {}

  async main(type: FeatureType) {
    return await this.prisma.feature.findMany({
      where: { type },
      include: { subFeatures: true },
    });
  }
}
