import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/integrations/prisma-client/prisma.service';
import { CreateRoleDto } from '../dtos';
import { generateKeyFromLabel } from 'src/utils';

@Injectable()
export class PostNewRoleHandler {
  constructor(private prisma: PrismaService) {}

  async main(payload: CreateRoleDto) {
    const { label, access, featureIds, subFeatureIds } = payload;
    let key = `${generateKeyFromLabel(label)}`;

    // 1. Check uniqueness and existence of IDs in parallel to save time
    const [existingRole, existingKey, foundFeatures, foundSubFeatures] =
      await Promise.all([
        this.prisma.role.findFirst({
          where: { label: { equals: label, mode: 'insensitive' } },
        }),
        this.prisma.role.findUnique({
          where: { key },
          select: { label: true },
        }),
        featureIds?.length
          ? this.prisma.feature.findMany({
              where: { id: { in: featureIds } },
              select: { id: true },
            })
          : [],
        subFeatureIds?.length
          ? this.prisma.subFeature.findMany({
              where: { id: { in: subFeatureIds } },
              select: { id: true },
            })
          : [],
      ]);

    // 2. Validate Role uniqueness
    if (existingRole) {
      throw new ConflictException(`Role ${label} already exists`);
    }

    if (existingKey) {
      // try to add slug at the end of key
      key = `${key}_${new Date().getSeconds()}`;
    }

    // 3. Validate IDs count in one go
    this.validateIdentifiers(featureIds, foundFeatures, 'Features');
    this.validateIdentifiers(subFeatureIds, foundSubFeatures, 'Sub-features');

    // 4. Atomic Transaction with "connect" (Implicit/Explicit relation)
    return this.prisma.role.create({
      data: {
        label,
        access,
        key,
        roleFeatures: {
          create: featureIds?.map((id) => ({ featureId: id })),
        },
        roleSubFeatures: {
          create: subFeatureIds?.map((id) => ({ subFeatureId: id })),
        },
      },
    });
  }

  /**
   * Helper method to reduce code repetition for ID validation
   */
  private validateIdentifiers(
    requestedIds: string[],
    foundRecords: any[],
    context: string,
  ) {
    if (requestedIds?.length && foundRecords.length !== requestedIds.length) {
      const foundIds = foundRecords.map((r) => r.id);
      const missingIds = requestedIds.filter((id) => !foundIds.includes(id));
      throw new NotFoundException(
        `Some ${context} not found: ${missingIds.join(', ')}`,
      );
    }
  }
}
