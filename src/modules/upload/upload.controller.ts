import {
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { SingleDocUploadHandler, SingleImageUploadHandler } from './handlers';
import { JwtGuard } from '../auth/guards/jwt.guard';

@UseGuards(JwtGuard)
@ApiTags('Upload File')
@Controller('uploads')
export class UploadController {
  constructor(
    private singleImageUploadHandler: SingleImageUploadHandler,
    private singleDocUploadHandler: SingleDocUploadHandler,
  ) {}

  @Post('image')
  @UseInterceptors(FileInterceptor('image'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['image'],
      properties: {
        // Nama property 'file' harus sama dengan argumen di FileInterceptor
        image: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  singleImageUpload(@UploadedFile() file: Express.Multer.File) {
    return this.singleImageUploadHandler.main(file);
  }

  @Post('doc')
  @UseInterceptors(FileInterceptor('doc'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file'],
      properties: {
        // Nama property 'file' harus sama dengan argumen di FileInterceptor
        doc: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  singleDocUpload(@UploadedFile() file: Express.Multer.File) {
    return this.singleDocUploadHandler.main(file);
  }
}
