import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { PlatformType } from 'src/common/enum';

export class LoginDto {
  @IsNotEmpty()
  @IsEmail()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.toLowerCase().trim() : value,
  )
  @ApiProperty({ required: true, example: 'mariwi@yopmail.com' })
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @ApiProperty({ required: true, example: 'Admin123' })
  password: string;

  @IsNotEmpty()
  @IsEnum(PlatformType)
  @Transform(({ value }) =>
    typeof value === 'string' ? value.toUpperCase() : value,
  )
  @ApiProperty({
    required: true,
    enum: PlatformType,
    example: PlatformType.MOBILE,
  })
  platform: PlatformType;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: true, example: '' })
  fcmToken: string;
}
