import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { PrismaService } from 'src/integrations/prisma-client/prisma.service';
import { UpdateUserDto } from '../dtos';
import bcrypt from 'bcryptjs';

@Injectable()
export class UpdateUserHandler {
  constructor(private prisma: PrismaService) {}

  async main(id: string, payload: UpdateUserDto) {
    const { email, name, phone, password, roleId, isActive, rating, imageUrl } =
      payload;

    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!user) throw new NotFoundException('User not found');

    // check for duplicated email
    if (email) {
      const exsitingEmail = await this.prisma.user.findFirst({
        where: { email: email.toLowerCase(), id: { not: user.id } },
        select: { email: true },
      });
      if (exsitingEmail) throw new ConflictException('Email already exist');
    }

    // hash password if it's provided
    let passwordHash: string | undefined;
    if (password) {
      passwordHash = await bcrypt.hash(password, 10);
    }

    // check role existence if id's provided
    if (roleId) {
      const role = await this.prisma.role.findUnique({ where: { id: roleId } });
      if (!role)
        throw new UnprocessableEntityException('Related role not found');
    }

    // update user's data
    await this.prisma.user.update({
      where: { id },
      data: {
        email: email ? email.toLowerCase() : undefined,
        name,
        phone,
        password: passwordHash,
        roleId,
        imageUrl,
        rating,
        isActive,
      },
    });
  }
}
