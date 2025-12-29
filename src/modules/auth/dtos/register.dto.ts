import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @IsNotEmpty()
  @IsEmail()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.toLowerCase().trim() : value,
  )
  @ApiProperty({ required: true, example: 'mariwi@yopmail.com' })
  email: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @ApiProperty({ required: true, example: 'Peter Parker' })
  name: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: true, example: '081234567890' })
  phone: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @ApiProperty({ required: true, example: 'Admin123' })
  password: string;

  // @IsBoolean()
  // @IsNotEmpty()
  // @ApiProperty({ required: true, example: true })
  // isResident: boolean;
}
