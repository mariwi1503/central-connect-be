import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString } from 'class-validator';
import { PaginationDto } from 'src/common/dtos';

export class GetComplaintsDto extends PaginationDto {
  @IsOptional()
  @IsString()
  @ApiProperty({ required: false, description: 'Searching based on title' })
  search: string;

  @IsOptional()
  @IsDateString()
  @ApiProperty({
    required: false,
    example: '2025-05-15',
    description: 'Format: YYYY-MM-DD',
  })
  startDate: string;

  @IsOptional()
  @IsDateString()
  @ApiProperty({
    required: false,
    example: '2025-12-15',
    description: 'Format: YYYY-MM-DD',
  })
  endDate: string;

  // @IsOptional()
  // @IsString()
  // @ApiProperty({ required: false })
  // projectId: string;
}
