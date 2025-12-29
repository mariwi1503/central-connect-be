import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { PrismaService } from 'src/integrations/prisma-client/prisma.service';
import { CreateNewPasswordDto } from '../dtos';
import bcrypt from 'bcryptjs';

@Injectable()
export class CreateNewPasswordHandler {
  constructor(private prisma: PrismaService) {}

  async main(payload: CreateNewPasswordDto) {
    const { email, otp, newPassword } = payload;
    const now = new Date();

    const user = await this.prisma.user.findUnique({
      where: { email },
      select: { resetPasswordOtp: true, resetPasswordOtpExp: true },
    });

    if (!user) throw new NotFoundException('Account not found');
    if (user.resetPasswordOtp !== otp)
      throw new UnprocessableEntityException('Session Invalid');
    if (!user.resetPasswordOtpExp || now > user.resetPasswordOtpExp)
      throw new UnprocessableEntityException('Session Expired!');

    const password = await bcrypt.hash(newPassword, 10);

    await this.prisma.user.update({
      where: { email },
      data: { password, resetPasswordOtp: null, resetPasswordOtpExp: null },
    });
  }
}
