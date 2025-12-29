import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { UserModule } from './modules/user/user.module';
import { ConfigModule } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TransformInterceptor } from './interceptors';
import { AuthModule } from './modules/auth/auth.module';
import { PrismaModule } from './integrations/prisma-client/prisma.module';
import { RoleModule } from './modules/role/role.module';
import { ProjectModule } from './modules/project/project.module';
import { ComplaintModule } from './modules/complaint/complaint.module';
import { FeatureModule } from './modules/feature/feature.module';
import { AxiosModule } from './integrations/axios/axios.module';
import { MailModule } from './integrations/mail/mail.module';
import { CisModule } from './integrations/cis/cis.module';
import { ClusterModule } from './modules/cluster/cluster.module';
import { ComplaintCategoryModule } from './modules/complaint-category/complaint-category.module';
import { UploadModule } from './modules/upload/upload.module';
import { S3Module } from './integrations/aws-s3/s3.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AxiosModule,
    CisModule,
    MailModule,
    PrismaModule,
    S3Module,
    AuthModule,
    UserModule,
    RoleModule,
    FeatureModule,
    ProjectModule,
    ClusterModule,
    ComplaintModule,
    ComplaintCategoryModule,
    UploadModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
  ],
})
export class AppModule {}
