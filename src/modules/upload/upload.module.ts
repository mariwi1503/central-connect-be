import { Module } from '@nestjs/common';
import { UploadController } from './upload.controller';
import { SingleDocUploadHandler, SingleImageUploadHandler } from './handlers';

@Module({
  imports: [],
  controllers: [UploadController],
  providers: [SingleImageUploadHandler, SingleDocUploadHandler],
})
export class UploadModule {}
