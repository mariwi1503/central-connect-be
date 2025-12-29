import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString } from 'class-validator';
import { ComplaintStatus } from 'prisma/generated/enums';
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
    description: 'Format: YYYY-MM-DD',
  })
  startDate: string;

  @IsOptional()
  @IsDateString()
  @ApiProperty({
    required: false,
    description: 'Format: YYYY-MM-DD',
  })
  endDate: string;

  @IsOptional()
  @ApiProperty({
    required: false,
    enum: ComplaintStatus,
  })
  status: ComplaintStatus;

  // @IsOptional()
  // @IsString()
  // @ApiProperty({ required: false })
  // projectId: string;
}
