import {
  ConflictException,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import { RegisterDto } from '../dtos';
import { PrismaService } from 'src/integrations/prisma-client/prisma.service';
import bcrypt from 'bcryptjs';

@Injectable()
export class RegisterHandler {
  constructor(private prisma: PrismaService) {}

  async main(payload: RegisterDto) {
    const { email, name, phone, password } = payload;
    const userExist = await this.prisma.user.findUnique({
      where: { email: payload.email.toLowerCase() },
      select: { id: true },
    });
    if (userExist) throw new ConflictException('Email already registered');

    const passwordHash = await bcrypt.hash(password, 10);

    try {
      return await this.prisma.user.create({
        data: {
          email: email.toLowerCase(),
          name,
          phone,
          password: passwordHash,
          isResident: true,
          role: {
            connect: { key: 'resident' },
          },
        },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new UnprocessableEntityException('Role resident not found');
      }
      throw error;
    }
  }
}
