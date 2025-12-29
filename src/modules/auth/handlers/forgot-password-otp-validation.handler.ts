import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { OtpValidationDto } from 'src/common/dtos';
import { PrismaService } from 'src/integrations/prisma-client/prisma.service';

@Injectable()
export class ForgotPasswordOtpValidationHandler {
  constructor(private prisma: PrismaService) {}

  async main(payload: OtpValidationDto) {
    const { email, otp } = payload;
    const now = new Date();

    const user = await this.prisma.user.findUnique({
      where: { email },
      select: { resetPasswordOtp: true, resetPasswordOtpExp: true },
    });

    if (!user) throw new NotFoundException('Account not found');
    if (user.resetPasswordOtp !== otp)
      throw new UnprocessableEntityException('Invalid OTP');
    if (!user.resetPasswordOtpExp || now > user.resetPasswordOtpExp)
      throw new UnprocessableEntityException('OTP Expired!');

    const resetPasswordOtpExp = new Date(now.getTime() + 2 * 60000); // now + 2 menit

    await this.prisma.user.update({
      where: { email },
      data: { resetPasswordOtpExp },
    });

    return {
      otp: user.resetPasswordOtp,
      isValid: true,
    };
  }
}
