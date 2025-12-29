import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from '../dtos';
import { PrismaService } from 'src/integrations/prisma-client/prisma.service';
import { ConfigService } from '@nestjs/config';
import bcrypt from 'bcryptjs';
import { PlatformType } from 'src/common/enum';

@Injectable()
export class LoginHandler {
  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
    private config: ConfigService,
  ) {}

  async main(payload: LoginDto) {
    const { email, password, platform } = payload;
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        role: {
          include: {
            roleFeatures: {
              where: {
                feature: { type: platform },
              },
              include: {
                feature: {
                  include: { subFeatures: true },
                },
              },
            },
            roleSubFeatures: true,
          },
        },
        userComplaintCategories: {
          include: { complaintCategory: true },
        },
        userManagedProjects: {
          include: {
            project: true,
          },
        },
      },
    });

    if (!user)
      throw new UnauthorizedException('Email or password is not valid');

    if (!user.isDashboardAccessGranted && platform === PlatformType.WEB)
      throw new ForbiddenException(
        'Access denied. Dashboard permission is not granted for this account.',
      );
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid)
      throw new UnauthorizedException('Email or password is not valid');

    const managedComplaintCategories = user.userComplaintCategories.length
      ? user.userComplaintCategories.map((x) => ({
          complaintCategoryId: x.complaintCategoryId,
          complaintCategoryLabel: x.complaintCategory.label,
          complaintCategoryOrder: x.complaintCategory.order,
        }))
      : [];

    const managedProjects = user.userManagedProjects.length
      ? user.userManagedProjects.map((x) => ({
          projectId: x.id,
          projectCisId: x.project.cisId,
          projectName: x.project.name,
          projectCode: x.project.code,
        }))
      : [];

    const role = {
      id: user.roleId,
      name: user.role?.label,
      access: user.role?.access,
    };

    const tokenPayload = {
      userId: user.id,
      platform,
      isResident: user.isResident,
      role,
    };

    const accessToken: string = await this.jwtService.signAsync(tokenPayload, {
      // expiresIn: platform === PlatformType.MOBILE ? '30d' : '1h',
      expiresIn: '30d',
      secret: this.config.getOrThrow('ACCESS_TOKEN_SECRET'),
    });

    const refreshToken = await this.jwtService.signAsync(
      { userId: user.id, platform },
      {
        expiresIn: '30d',
        secret: this.config.getOrThrow('REFRESH_TOKEN_SECRET'),
      },
    );

    const token = {
      type: 'Bearer',
      expiresIn: 30 * 24 * 60 * 60,
      // expiresIn: platform === PlatformType.MOBILE ? 30 * 24 * 60 * 60 : 60 * 60,
      // 30 days for mobile and one hour for web
      accessToken,
      refreshToken,
    };

    const roleSubFeatureIds = (user.role?.roleSubFeatures ?? []).map(
      (x) => x.subFeatureId,
    );

    const features = user.role
      ? user.role.roleFeatures.map((x) => {
          const subFeatures = x.feature.subFeatures.filter((x) =>
            roleSubFeatureIds.includes(x.id),
          );
          return {
            ...x.feature,
            subFeatures,
          };
        })
      : [];

    return {
      profile: {
        ...user,
        password: undefined,
        role,
        userComplaintCategories: undefined,
        userManagedProjects: undefined,
        managedComplaintCategories,
        managedProjects,
      },
      features,
      token,
    };
  }
}
