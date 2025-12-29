import { Module } from '@nestjs/common';
import {
  GetClustersByProjectIdHandler,
  GetProjectByIdHandler,
  GetProjectsHandler,
} from './handlers';
import { ProjectController } from './project.controller';
import { CisModule } from 'src/integrations/cis/cis.module';

@Module({
  imports: [CisModule],
  controllers: [ProjectController],
  providers: [
    GetProjectsHandler,
    GetProjectByIdHandler,
    GetClustersByProjectIdHandler,
  ],
})
export class ProjectModule {}
