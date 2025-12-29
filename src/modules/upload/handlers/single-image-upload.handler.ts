import {
  BadRequestException,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Service } from 'src/integrations/aws-s3/s3.service';
import { generateS3Key } from 'src/utils';

@Injectable()
export class SingleImageUploadHandler {
  constructor(
    private s3Service: S3Service,
    private config: ConfigService,
  ) {}

  async main(file: Express.Multer.File) {
    const rawExt = file.originalname.split('.').pop();
    const fileExt = rawExt?.toLowerCase();

    if (!fileExt) {
      throw new UnprocessableEntityException('Cannot access file extension');
    }

    const allowedextension = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    if (!allowedextension.includes(fileExt))
      throw new BadRequestException(
        `Only ${allowedextension.join(', ')} allowed`,
      );

    const key = generateS3Key('IMG', fileExt);
    const bucketName = this.config.getOrThrow('AWS_S3_BUCKET_NAME');
    const region = this.config.getOrThrow('AWS_REGION');

    // Proses upload ke S3
    await this.s3Service.uploadFile(
      key,
      bucketName,
      file.buffer,
      file.mimetype,
    );

    return `https://${bucketName}.s3.${region}.amazonaws.com/${key}`;
  }
}
