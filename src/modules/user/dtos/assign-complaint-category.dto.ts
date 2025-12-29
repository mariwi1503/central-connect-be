import { ApiProperty } from '@nestjs/swagger';
import { ArrayMinSize, IsArray, IsNotEmpty, IsUUID } from 'class-validator';

export class AssignComplaintCategoryDto {
  @IsNotEmpty()
  @IsArray()
  @ArrayMinSize(1)
  @IsUUID('4', { each: true })
  @ApiProperty({
    required: true,
    example: ['58b2f4ac-f8ed-4bf1-bf8e-d4b564ed2329'],
  })
  complaintCategoryIds: string[];
}
