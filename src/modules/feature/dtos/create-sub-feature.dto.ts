import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateSubFeatureDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ required: true, example: 'Sub Feature Label' })
  label: string;

  @IsOptional()
  @IsNumber()
  @ApiProperty({ required: true, example: 1 })
  order: number;

  @IsOptional()
  @IsString()
  @ApiProperty({
    required: false,
    example: 'https://example.com/main-icon.png',
  })
  imageUrl: string;

  @IsNotEmpty()
  @IsUUID()
  @ApiProperty({
    required: false,
    example: '58b2f4ac-f8ed-4bf1-bf8e-d4b564ed2329',
  })
  featureId: string;
}
