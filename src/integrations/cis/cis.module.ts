import { Module } from '@nestjs/common';
import { CisService } from './cis.service';

@Module({
  providers: [CisService],
  exports: [CisService],
})
export class CisModule {}
