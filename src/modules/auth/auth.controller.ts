import { Body, Controller, Get, Post } from '@nestjs/common';
import {
  CreateNewPasswordHandler,
  ForgotPasswordHandler,
  ForgotPasswordOtpValidationHandler,
  LoginHandler,
  RegisterHandler,
} from './handlers';
import { ApiTags } from '@nestjs/swagger';
import { CreateNewPasswordDto, LoginDto, RegisterDto } from './dtos';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { GetOtpDto, OtpValidationDto } from 'src/common/dtos';

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  constructor(
    private registerHandler: RegisterHandler,
    private loginHandler: LoginHandler,
    private forgotPasswordHandler: ForgotPasswordHandler,
    private forgotPasswordOtpValidationHandler: ForgotPasswordOtpValidationHandler,
    private createNewPasswordHandler: CreateNewPasswordHandler,
  ) {}

  @Post('register')
  @ApiOperation({ summary: 'Register new account' })
  register(@Body() body: RegisterDto) {
    return this.registerHandler.main(body);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login' })
  login(@Body() body: LoginDto) {
    return this.loginHandler.main(body);
  }

  @Post('logout')
  @ApiOperation({ summary: 'Logout' })
  logout() {
    return 'Still in development';
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Get new access token' })
  refreshToken() {
    return 'Still in development';
  }

  @Post('forgot-password')
  @ApiOperation({ summary: 'Get forgot password OTP' })
  forgotPassword(@Body() body: GetOtpDto) {
    return this.forgotPasswordHandler.main(body);
  }

  @Post('forgot-password/validate')
  @ApiOperation({ summary: 'Get forgot password OTP' })
  forgotPasswordOtpValidation(@Body() body: OtpValidationDto) {
    return this.forgotPasswordOtpValidationHandler.main(body);
  }

  @Post('new-password')
  @ApiOperation({ summary: 'To set new password, need an forgot password OTP' })
  createNewPassword(@Body() body: CreateNewPasswordDto) {
    return this.createNewPasswordHandler.main(body);
  }
}
