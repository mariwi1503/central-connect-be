import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateNewPasswordDto {
  @IsNotEmpty()
  @IsEmail()
  @ApiProperty({ required: true, example: 'mariwi@yopmail.com' })
  email: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  @MaxLength(6)
  @ApiProperty({ required: true, example: '123456' })
  otp: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ required: true, example: '' })
  newPassword: string;
}
