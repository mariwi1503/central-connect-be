import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  GetRoleDetailHandler,
  GetRolesHandler,
  PostNewRoleHandler,
  UpdateRoleHandler,
} from './handlers';
import { CreateRoleDto, UpdateRoleDto } from './dtos';

@UseGuards(JwtGuard)
@ApiBearerAuth()
@ApiTags('Roles')
@Controller('roles')
export class RoleController {
  constructor(
    private postNewRoleHandler: PostNewRoleHandler,
    private getRolesHandler: GetRolesHandler,
    private getRoleDetailHandler: GetRoleDetailHandler,
    private updateRoleHandler: UpdateRoleHandler,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create new role' })
  postNewRole(@Body() body: CreateRoleDto) {
    return this.postNewRoleHandler.main(body);
  }

  @Get()
  @ApiOperation({ summary: 'Get all roles' })
  getRoles() {
    return this.getRolesHandler.main();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get role detail (by ID)' })
  getRoleDetail(@Param('id') id: string) {
    return this.getRoleDetailHandler.main(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update role' })
  updateRole(@Param('id') id: string, @Body() body: UpdateRoleDto) {
    return this.updateRoleHandler.main(id, body);
  }
}
