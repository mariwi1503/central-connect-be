import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInt, IsNotEmpty, IsString, Min, MinLength } from 'class-validator';

export class CreateComplaintCategoryDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @ApiProperty({
    required: true,
    example: 'Kelistrikan',
    description: 'Nama kategori keluhan',
  })
  label: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(10)
  @ApiProperty({
    required: true,
    example: 'Masalah terkait instalasi listrik dan lampu',
    description: 'Penjelasan singkat kategori',
  })
  description: string;

  @IsNotEmpty()
  @IsInt()
  @Min(0)
  @ApiProperty({
    required: true,
    example: 1,
    description: 'Urutan tampilan kategori',
  })
  order: number;
}
