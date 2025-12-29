import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';
import { ComplaintStatus } from 'src/generated/prisma/enums';

export class SubmitComplaintResponseDto {
  @IsNotEmpty()
  @IsEnum(ComplaintStatus)
  @ApiProperty({ required: true, enum: ComplaintStatus })
  status: ComplaintStatus;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ required: true, example: 'Your response' })
  response: string;

  @IsOptional()
  @IsDateString(
    {},
    { message: 'Expected format for estimatedFinishAt: (YYYY-MM-DD)' },
  )
  @ApiProperty({
    required: true,
    example: '2025-04-30',
    description: 'Estimasi tanggal selesai dalam format YYYY-MM-DD',
  })
  estimatedFinishAt: string;

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
