import { Injectable, NotFoundException } from '@nestjs/common';
import { GetOtpDto } from 'src/common/dtos';
import { PrismaService } from 'src/integrations/prisma-client/prisma.service';
import { randomInt } from 'crypto';
import { MailService } from 'src/integrations/mail/mail.service';

@Injectable()
export class ForgotPasswordHandler {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
  ) {}

  async main(payload: GetOtpDto) {
    const { email } = payload;
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user || user.deletedAt) throw new NotFoundException('Email not found');

    const now = new Date();
    const resetPasswordOtpExp = new Date(now.getTime() + 5 * 60000); // now + 5 menit
    const resetPasswordOtp = randomInt(100000, 999999).toString();

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordOtp,
        resetPasswordOtpExp,
      },
    });

    await this.mailService.resetPassword(email, resetPasswordOtp);
  }
}
