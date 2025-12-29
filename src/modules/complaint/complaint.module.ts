import { Module } from '@nestjs/common';
import { ComplaintController } from './complaint.controller';
import { GetComplaintsHandler } from './handlers/get-compalints.handler';
import { CreateComplaintHandler, GetComplaintDetailHandler } from './handlers';
import { CisModule } from 'src/integrations/cis/cis.module';

@Module({
  imports: [CisModule],
  controllers: [ComplaintController],
  providers: [
    GetComplaintsHandler,
    GetComplaintDetailHandler,
    CreateComplaintHandler,
  ],
})
export class ComplaintModule {}
