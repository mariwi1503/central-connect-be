import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {}

  async test() {
    try {
      await this.mailerService.sendMail({
        to: 'mariwidev@gmail.com',
        subject: 'Email Testing',
        html: 'This is an email testing!',
      });
    } catch (error) {
      console.error('🚀 ~ :17 ~ error:', error);
    }
  }

  async resetPassword(email: string, otp: string) {
    try {
      await this.mailerService.sendMail({
        to: email,
        subject: 'Reset Password OTP',
        template: 'reset-password',
        context: {
          otp,
        },
      });
    } catch (error) {
      throw error;
    }
  }

  async createNewUser(email: string, password: string, name: string) {
    try {
      await this.mailerService.sendMail({
        to: email,
        subject: 'Akun baru dibuat',
        template: 'create-new-user',
        context: {
          email,
          password,
          name,
        },
      });
    } catch (error) {
      throw error;
    }
  }
}
