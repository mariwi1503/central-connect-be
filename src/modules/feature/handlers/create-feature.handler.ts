import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/integrations/prisma-client/prisma.service';
import { generateKeyFromLabel } from 'src/utils';
import { CreateFeatureDto } from '../dtos';

@Injectable()
export class CreateFeatureHandler {
  constructor(private prisma: PrismaService) {}

  async main(payload: CreateFeatureDto) {
    const { label, imageUrl, type, subFeatures = [] } = payload;

    let key = generateKeyFromLabel(label);
    const order = payload.order;

    const [labelExist, keyExist] = await Promise.all([
      await this.prisma.feature.findFirst({
        where: { label: { equals: label, mode: 'insensitive' } },
        select: { id: true, type: true },
      }),
      await this.prisma.feature.findUnique({
        where: { key },
        select: { id: true },
      }),
    ]);
    if (labelExist && labelExist.type === type)
      throw new ConflictException(`Label ${label} already exist`);
    if (keyExist) {
      // try to add slug at the end of key
      key = `${key}_${new Date().getSeconds()}`;
    }

    await this.prisma.$transaction(async (t) => {
      const createFeature = await t.feature.create({
        data: {
          label,
          key,
          order,
          imageUrl,
          type,
        },
      });

      if (subFeatures.length > 0) {
        let order = 1;
        for (const sub of subFeatures) {
          let subKey = generateKeyFromLabel(sub.label);

          const [subLabelExist, subKeyExist] = await Promise.all([
            await t.subFeature.findFirst({
              where: { label: { equals: label, mode: 'insensitive' } },
              select: { id: true },
            }),
            await t.subFeature.findUnique({
              where: { key: subKey },
              select: { id: true },
            }),
          ]);
          if (subLabelExist)
            throw new ConflictException(
              `Label ${label} for sub feature already exist`,
            );
          if (subKeyExist) {
            // try to add slug at the end of key
            subKey = `${subKey}_${new Date().getSeconds()}`;
          }

          // create sub feature
          await t.subFeature.create({
            data: {
              label: sub.label,
              key: subKey,
              order,
              imageUrl: sub.imageUrl,
              featureId: createFeature.id,
            },
          });

          order += 1;
        }
      }
    });
  }
}
