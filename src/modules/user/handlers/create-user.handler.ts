import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { PrismaService } from 'src/integrations/prisma-client/prisma.service';
import { CreateUserDto } from '../dtos';
import bcrypt from 'bcryptjs';
import { CisService } from 'src/integrations/cis/cis.service';

@Injectable()
export class CreateUserHandler {
  constructor(
    private prisma: PrismaService,
    private cisService: CisService,
  ) {}

  async main(payload: CreateUserDto) {
    const { email, name, phone, roleId, imageUrl, isResident, unitId } =
      payload;

    const { data: units } = await this.cisService.getUnits({
      page: 1,
      perPage: 10000,
    });

    const unitFromCis = units.find((u) => u.id == unitId);
    if (!unitFromCis)
      throw new NotFoundException('Unit not found in CIS database');

    // check cluster
    const clusterFromCis = await this.cisService.getClusterById(
      unitFromCis.cluster_id,
    );
    if (!clusterFromCis)
      throw new InternalServerErrorException(
        'Cluster not found in CIS database',
      );

    // check project
    const projectFromCis = await this.cisService.getProjectById(
      clusterFromCis.project_id,
    );
    if (!projectFromCis)
      throw new InternalServerErrorException(
        'Project not found in CIS database',
      );

    // synch project
    const upsertProjectInLocalDb = await this.prisma.project.upsert({
      where: { cisId: projectFromCis.id },
      create: {
        cisId: projectFromCis.id,
        name: projectFromCis.name,
        code: projectFromCis.code,
      },
      update: {
        name: projectFromCis.name,
        code: projectFromCis.code,
      },
    });

    // synch cluster
    const upsertClusterInLocalDb = await this.prisma.cluster.upsert({
      where: { cisId: clusterFromCis.id },
      create: {
        cisId: clusterFromCis.id,
        name: clusterFromCis.name,
        cisProjectId: clusterFromCis.project_id,
        projectId: upsertProjectInLocalDb.id,
      },
      update: {
        name: clusterFromCis.name,
        projectId: upsertProjectInLocalDb.id,
      },
    });

    // synch unit
    const upsertUnitInLocalDb = await this.prisma.unit.upsert({
      where: { cisId: unitId },
      create: {
        cisId: unitId,
        cisClusterId: unitFromCis.cluster_id,
        name: unitFromCis.name,
        state: unitFromCis.state,
        buildingType: unitFromCis.building_type,
        unitType: unitFromCis.unit_type,
        lb: unitFromCis.lb,
        lt: unitFromCis.lt,
        internalBastbDate: unitFromCis.internal_bastb_date
          ? `${unitFromCis.internal_bastb_date.split(' ')[0]}T08:00:00.000Z`
          : undefined,
        clusterId: upsertClusterInLocalDb.id,
      },
      update: {
        cisClusterId: unitFromCis.cluster_id,
        name: unitFromCis.name,
        state: unitFromCis.state,
        buildingType: unitFromCis.building_type,
        unitType: unitFromCis.unit_type,
        lb: unitFromCis.lb,
        lt: unitFromCis.lt,
        internalBastbDate: unitFromCis.internal_bastb_date
          ? `${unitFromCis.internal_bastb_date.split(' ')[0]}T08:00:00.000Z`
          : undefined,
        clusterId: upsertClusterInLocalDb.id,
      },
    });

    // check for duplicated email
    const exsitingEmail = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: { email: true },
    });
    if (exsitingEmail) throw new ConflictException('Email already exist');

    if (!isResident && !roleId)
      throw new BadRequestException('Role ID is needed');

    // check role existence if id's provided
    if (roleId) {
      const role = await this.prisma.role.findUnique({ where: { id: roleId } });
      if (!role)
        throw new UnprocessableEntityException('Related role not found');
    }

    const defaultRole = roleId
      ? null
      : await this.prisma.role.findUnique({
          where: { key: 'resident' },
          select: { id: true },
        });

    if (!roleId && !defaultRole)
      throw new UnprocessableEntityException('No role provided');

    const randomPassword = this.generateRandomPassword(6);
    const password = await bcrypt.hash(randomPassword, 10);

    // check unit from cis

    // create user
    await this.prisma.user.create({
      data: {
        email: email.toLowerCase(),
        name,
        phone,
        roleId: roleId ?? defaultRole?.id,
        imageUrl,
        isResident,
        password,
        userUnits: {
          create: {
            unitId: upsertUnitInLocalDb.id,
          },
        },
      },
    });
  }

  private generateRandomPassword = (length: number = 8): string => {
    // Ensure the length is at least 6
    const pwdLength = length < 6 ? 6 : length;

    const charset = {
      uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
      lowercase: 'abcdefghijklmnopqrstuvwxyz',
      numbers: '0123456789',
      all: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
    };

    let password = '';

    // 1. Guarantee at least one of each required category
    password += charset.uppercase.charAt(
      Math.floor(Math.random() * charset.uppercase.length),
    );
    password += charset.lowercase.charAt(
      Math.floor(Math.random() * charset.lowercase.length),
    );
    password += charset.numbers.charAt(
      Math.floor(Math.random() * charset.numbers.length),
    );

    // 2. Fill the rest of the password length with random characters from all sets
    for (let i = password.length; i < pwdLength; i++) {
      password += charset.all.charAt(
        Math.floor(Math.random() * charset.all.length),
      );
    }

    return password;
  };
}
