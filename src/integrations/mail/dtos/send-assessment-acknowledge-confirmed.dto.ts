import { IsNotEmpty, IsString } from 'class-validator';

export class SendAssessmentAcknowledgeConfirmedDto {
  @IsNotEmpty()
  @IsString()
  assessorName: string;

  @IsNotEmpty()
  @IsString()
  keyPersonName: string;

  @IsNotEmpty()
  @IsString()
  appModuleFeUri: string;

  @IsNotEmpty()
  @IsString()
  assessmentTitle: string;
}
