import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsEmail()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.toLowerCase().trim() : value,
  )
  @ApiProperty({ required: false, example: 'abc@mail.com' })
  email: string;

  @IsOptional()
  @IsString()
  @MinLength(3)
  @ApiProperty({ required: false, example: 'Peter Parker' })
  name: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ required: false, example: '081234567890' })
  phone: string;

  @IsOptional()
  @IsString()
  @MinLength(6)
  @ApiProperty({ required: false, example: 'admin123' })
  password: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    required: false,
    example: '58b2f4ac-f8ed-4bf1-bf8e-d4b564ed2329',
  })
  roleId: string;

  @IsOptional()
  @IsBoolean()
  @ApiProperty({
    required: false,
    example: true,
  })
  isActive: boolean;

  @IsOptional()
  @IsInt()
  @ApiProperty({
    required: false,
    example: 5,
  })
  rating: number;

  @IsOptional()
  @IsString()
  @ApiProperty({
    required: false,
    example:
      'https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/1e/0c/03/1e0c0354-a008-f461-0727-5728e991951a/AppIcon-0-0-1x_U007emarketing-0-6-0-0-85-220.png/1200x630wa.jpg',
  })
  imageUrl: string;
}
