import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsArray,
  IsOptional,
  IsUUID,
  Matches,
  IsIn,
} from 'class-validator';
import { roleAccess } from 'src/common/constants';

const validAccessKeys = roleAccess.map((r) => r.key);

export class UpdateRoleDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ required: true, example: 'New Role' })
  label: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @IsIn(validAccessKeys, {
    each: true,
    message: `Invalid access key`,
  })
  @ApiProperty({ required: false, example: ['approver'] })
  access: string[];

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  @ApiProperty({
    required: false,
    example: ['58b2f4ac-f8ed-4bf1-bf8e-d4b564ed2329'],
  })
  featureIds: string[];

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  @ApiProperty({
    required: false,
    example: ['58b2f4ac-f8ed-4bf1-bf8e-d4b564ed2329'],
  })
  subFeatureIds: string[];
}
