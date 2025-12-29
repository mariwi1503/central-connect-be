import { ApiProperty } from '@nestjs/swagger';
import { ArrayMinSize, IsArray, IsInt, IsNotEmpty } from 'class-validator';

export class AssignProjectDto {
  @IsNotEmpty()
  @IsArray()
  @ArrayMinSize(1)
  @IsInt({ each: true })
  @ApiProperty({
    required: true,
    example: [1, 2],
  })
  projectIds: number[];
}
