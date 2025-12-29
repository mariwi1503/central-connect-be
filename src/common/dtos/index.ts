import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class PaginationDto {
  @IsOptional()
  @IsNumberString()
  @ApiProperty({ required: false })
  page?: number;

  @IsOptional()
  @IsNumberString()
  @ApiProperty({ required: false })
  perPage?: number;
}

export class GetOtpDto {
  @IsNotEmpty()
  @IsEmail()
  @ApiProperty({ required: false, example: 'mariwi@yopmail.com' })
  email: string;
}

export class OtpValidationDto {
  @IsNotEmpty()
  @IsEmail()
  @ApiProperty({ required: false, example: 'mariwi@yopmail.com' })
  email: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  @MaxLength(6)
  @ApiProperty({ required: false, example: '123456' })
  otp: string;
}
