import { IsNotEmpty, IsString } from 'class-validator';

export class SendClientAssessmentAcknowledgeDto {
  @IsNotEmpty()
  @IsString()
  keyPersonName: string;

  @IsNotEmpty()
  @IsString()
  appModuleFeUri: string;

  @IsNotEmpty()
  @IsString()
  assessmentTitle: string;

  @IsNotEmpty()
  @IsString()
  service: string;
}
