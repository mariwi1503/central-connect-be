import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { ReadStream } from 'fs';

@Injectable()
export class S3Service {
  s3: S3Client;
  constructor(private config: ConfigService) {
    this.s3 = new S3Client({
      region: this.config.getOrThrow('AWS_REGION'),
      credentials: {
        accessKeyId: this.config.getOrThrow('AWS_ACCESS_KEY_ID')!,
        secretAccessKey: this.config.getOrThrow('AWS_SECRET_ACCESS_KEY')!,
      },
    });
  }

  async uploadFile(
    key: string,
    bucket: string,
    object: Buffer | ReadStream,
    contentType?: string,
  ) {
    const params = {
      Bucket: bucket,
      Key: key,
      Body: object,
      ContentType: contentType ? contentType : undefined,
    };
    await this.s3.send(new PutObjectCommand(params));
  }

  async getPresignedUrl(Key: string, Bucket: string) {
    const command = new GetObjectCommand({ Bucket, Key });
    const url = await getSignedUrl(this.s3, command, { expiresIn: 60 });
    return url;
  }

  async getFile(Key: string, Bucket: string) {
    const command = new GetObjectCommand({ Bucket, Key });
    return await this.s3.send(command);
  }
}
