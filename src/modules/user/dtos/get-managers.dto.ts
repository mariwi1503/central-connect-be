import {
  IsOptional,
  IsString,
  IsInt,
  Min,
  IsBoolean,
  IsUUID,
  IsIn,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class GetManagersDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @ApiProperty({ required: false, example: 1 })
  page: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @ApiProperty({ required: false, example: 25 })
  perPage: number;

  @IsOptional()
  @IsString()
  @ApiProperty({ required: false })
  search: string;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  @ApiProperty({
    required: false,
  })
  roleIds: string[];

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsIn([0, 1], {
    message: 'isActive must be either 0 or 1',
  })
  @ApiProperty({
    required: false,
    enum: [0, 1],
    description: 'Use 1 for active, 0 for inactive',
  })
  isActive: number;
}
