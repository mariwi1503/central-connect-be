import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
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
import { JwtGuard } from '../auth/guards/jwt.guard';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { GetUserInfo } from 'src/decorators';
import {
  AssignComplaintCategoryDto,
  AssignProjectDto,
  CreateResidentDto,
  CreateUserDto,
  GetManagersDto,
  GetResidentsDto,
  GetUsersDto,
  UpdateResidentDto,
  UpdateUserDto,
} from './dtos';
import { CreateManagertDto } from './dtos/create-manager.dto';

@UseGuards(JwtGuard)
@ApiBearerAuth()
@ApiTags('Users')
@Controller('users')
export class UserController {
  constructor(
    private createUserHandler: CreateUserHandler,
    private getUsersHandler: GetUsersHandler,
    private getProfileHandler: GetProfileHandler,
    private updateUserHandler: UpdateUserHandler,
    private approveUserHandler: ApproveUserHandler,
    private approveUserUnitHandler: ApproveUserUnitHandler,
    private createResidentHandler: CreateResidentHandler,
    private createManagertHandler: CreateManagertHandler,
    private assignComplaintCategoryHandler: AssignComplaintCategoryHandler,
    private assignProjectHandler: AssignProjectHandler,
    private updateResidentHandler: UpdateResidentHandler,
    private getResidentsHandler: GetResidentsHandler,
    private getManagersHandler: GetManagersHandler,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get users (search and filter supported' })
  getUsers(@Query() query: GetUsersDto) {
    return this.getUsersHandler.main(query);
  }

  @Post('resident')
  @ApiOperation({ summary: 'Create new resident' })
  createResident(@Body() body: CreateResidentDto) {
    return this.createResidentHandler.main(body);
  }

  @Get('resident')
  @ApiOperation({ summary: 'Get residents' })
  getResidents(@Query() query: GetResidentsDto) {
    return this.getResidentsHandler.main(query);
  }

  @Put('resident/:id')
  @ApiOperation({ summary: 'Update resident' })
  updateResident(@Param('id') id: string, @Body() body: UpdateResidentDto) {
    return this.updateResidentHandler.main(id, body);
  }

  @Post('manager')
  @ApiOperation({ summary: 'Create new manager' })
  createManagert(@Body() body: CreateManagertDto) {
    return this.createManagertHandler.main(body);
  }

  @Get('manager')
  @ApiOperation({ summary: 'Get managers' })
  getManagers(@Query() query: GetManagersDto) {
    return this.getManagersHandler.main(query);
  }

  @Put('unit/:id/approve')
  @ApiOperation({ summary: 'Approve user unit' })
  approveUserUnit(@Param('id') id: string) {
    return this.approveUserUnitHandler.main(id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  getProfile(@Param('id') id: string, @GetUserInfo() user: any) {
    return this.getProfileHandler.main(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update user detail' })
  updateUser(@Param('id') id: string, @Body() body: UpdateUserDto) {
    return this.updateUserHandler.main(id, body);
  }

  @Put(':id/approve')
  @ApiOperation({ summary: 'Update user status to APPROVED' })
  approveUser(@Param('id') id: string) {
    return this.approveUserHandler.main(id);
  }

  @Put(':id/assign/complaint-category')
  @ApiOperation({ summary: 'Assign user to a complaint category' })
  assignComplaintCategoryH(
    @Param('id') id: string,
    @Body() body: AssignComplaintCategoryDto,
  ) {
    return this.assignComplaintCategoryHandler.main(id, body);
  }

  @Put(':id/assign/project')
  @ApiOperation({ summary: 'Assign user to a project' })
  assignProject(@Param('id') id: string, @Body() body: AssignProjectDto) {
    return this.assignProjectHandler.main(id, body);
  }
}
