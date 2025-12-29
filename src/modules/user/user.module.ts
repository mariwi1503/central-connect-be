import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import {
  ApproveUserHandler,
  ApproveUserUnitHandler,
  AssignComplaintCategoryHandler,
  AssignProjectHandler,
  CreateManagertHandler,
  CreateResidentHandler,
  CreateUserHandler,
  GetManagersHandler,
  GetProfileHandler,
  GetResidentsHandler,
  GetUsersHandler,
  UpdateResidentHandler,
  UpdateUserHandler,
} from './handlers';
import { CisModule } from 'src/integrations/cis/cis.module';

@Module({
  imports: [CisModule],
  controllers: [UserController],
  providers: [
    CreateUserHandler,
    GetProfileHandler,
    UpdateUserHandler,
    GetUsersHandler,
    ApproveUserHandler,
    ApproveUserUnitHandler,
    CreateResidentHandler,
    CreateManagertHandler,
    AssignComplaintCategoryHandler,
    AssignProjectHandler,
    UpdateResidentHandler,
    GetResidentsHandler,
    GetManagersHandler,
  ],
})
export class UserModule {}
