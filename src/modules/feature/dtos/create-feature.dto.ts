import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsArray,
  IsOptional,
  IsNumber,
  IsUrl,
  ValidateNested,
  IsEnum,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { PlatformType } from 'prisma/generated/enums';

class SubFeatureDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: 'Sub Feature Label' })
  label: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ example: 'https://example.com/icon.png' })
  imageUrl: string;
}

export class CreateFeatureDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ required: true, example: 'Feature Label' })
  label: string;

  @IsNotEmpty()
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
  @IsEnum(PlatformType)
  @Transform(({ value }) =>
    typeof value === 'string' ? value.toUpperCase() : value,
  )
  @ApiProperty({
    required: true,
    enum: PlatformType,
    example: PlatformType.WEB,
  })
  type: PlatformType;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @ApiProperty({
    required: false,
    type: [SubFeatureDto],
  })
  @Type(() => SubFeatureDto)
  subFeatures: SubFeatureDto[];
}
