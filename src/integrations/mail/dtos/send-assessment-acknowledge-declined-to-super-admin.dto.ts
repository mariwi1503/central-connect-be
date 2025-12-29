import { IsNotEmpty, IsString } from 'class-validator';

export class SendAssessmentAcknowledgeDeclinedToSuperAdminDto {
  @IsNotEmpty()
  @IsString()
  appModuleFeUri: string;

  @IsNotEmpty()
  @IsString()
  assessmentTitle: string;
}
