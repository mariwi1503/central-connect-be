import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/integrations/prisma-client/prisma.service';
import { CreateSubFeatureDto } from '../dtos';
import { generateKeyFromLabel } from 'src/utils';

@Injectable()
export class CreateSubFeatureHandler {
  constructor(private prisma: PrismaService) {}

  async main(payload: CreateSubFeatureDto) {
    const { label, imageUrl, featureId } = payload;

    let key = generateKeyFromLabel(label);
    let order = payload.order;

    const parentFeature = await this.prisma.feature.findUnique({
      where: { id: featureId },
      select: { id: true },
    });
    if (!parentFeature) throw new NotFoundException('Parent Feature Not found');

    const [labelExist, keyExist, lastOrder] = await Promise.all([
      await this.prisma.subFeature.findFirst({
        where: { label: { equals: label, mode: 'insensitive' } },
        select: { id: true, featureId: true },
      }),
      await this.prisma.subFeature.findUnique({
        where: { key },
        select: { id: true },
      }),
      await this.prisma.subFeature.findFirst({
        where: { featureId },
        orderBy: { order: 'desc' },
        select: { order: true },
      }),
    ]);

    if (labelExist && labelExist.featureId === featureId)
      throw new ConflictException(`Label ${label} already exist`);

    if (keyExist) {
      // try to add slug at the end of key
      key = `${key}_${new Date().getSeconds()}`;
    }

    if (!order) order = lastOrder ? lastOrder.order : 1;

    await this.prisma.subFeature.create({
      data: {
        label,
        key,
        order,
        imageUrl,
        featureId,
      },
    });
  }
}
