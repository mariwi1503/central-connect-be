import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsArray,
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class UpdateResidentDto {
  @IsNotEmpty()
  @IsEmail()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.toLowerCase().trim() : value,
  )
  @ApiProperty({ required: false, example: 'abcd@yopmail.com' })
  email: string;

  @IsNotEmpty()
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
  @ApiProperty({
    required: false,
    example:
      'https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/1e/0c/03/1e0c0354-a008-f461-0727-5728e991951a/AppIcon-0-0-1x_U007emarketing-0-6-0-0-85-220.png/1200x630wa.jpg',
  })
  imageUrl: string;

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  @ApiProperty({
    required: true,
    example: [1],
  })
  unitCisIds: number[];
}
