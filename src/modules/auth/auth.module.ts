import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import {
  CreateNewPasswordHandler,
  ForgotPasswordHandler,
  ForgotPasswordOtpValidationHandler,
  LoginHandler,
  RegisterHandler,
} from './handlers';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [JwtModule.register({})],
  controllers: [AuthController],
  providers: [
    JwtStrategy,
    RegisterHandler,
    LoginHandler,
    ForgotPasswordHandler,
    ForgotPasswordOtpValidationHandler,
    CreateNewPasswordHandler,
  ],
})
export class AuthModule {}
