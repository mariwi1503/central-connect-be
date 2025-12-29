import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';

export class CreateComplaintDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ required: true, example: 'Complaint title' })
  title: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ required: true, example: 'Complaint content' })
  content: string;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({ required: true, example: 1 })
  unitId: number;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    required: true,
    example: '0143d32c-5def-4227-9135-739c15493002',
  })
  complaintCategoryId: string;

  @IsOptional()
  @IsArray()
  @IsUrl(
    { require_protocol: true },
    {
      each: true,
    },
  )
  @ApiProperty({
    required: false,
    example: [
      'https://central-batam-prod.s3.ap-southeast-1.amazonaws.com/zFt8TdTlK1gRBryIk4iuCJuBkrnnBMDx5BzLbYCx8oL4ndXY2A4gAa1RqLVG.jpg',
    ],
  })
  imageUrls: string[];
}
