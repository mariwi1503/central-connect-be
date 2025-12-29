import { Module } from '@nestjs/common';
import { RoleController } from './role.controller';
import {
  GetRoleDetailHandler,
  GetRolesHandler,
  PostNewRoleHandler,
  UpdateRoleHandler,
} from './handlers';

@Module({
  controllers: [RoleController],
  providers: [
    PostNewRoleHandler,
    GetRolesHandler,
    GetRoleDetailHandler,
    UpdateRoleHandler,
  ],
})
export class RoleModule {}
