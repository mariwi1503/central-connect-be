import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import {
  GetClustersByProjectIdHandler,
  GetProjectByIdHandler,
  GetProjectsHandler,
} from './handlers';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { PaginationDto } from 'src/common/dtos';

@UseGuards(JwtGuard)
@ApiBearerAuth()
@ApiTags('Projects')
@Controller('projects')
export class ProjectController {
  constructor(
    private getProjectsHandler: GetProjectsHandler,
    private readonly getProjectByIdHandler: GetProjectByIdHandler,
    private readonly getClustersByProjectIdHandler: GetClustersByProjectIdHandler,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get Projects' })
  getProjects(@Query() query: PaginationDto) {
    return this.getProjectsHandler.main(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get Projects By ID' })
  getProjectById(@Param('id') id: string) {
    return this.getProjectByIdHandler.main(id);
  }

  @Get(':id/clusters')
  @ApiOperation({ summary: 'Get clusters under specific project' })
  getClustersByProjectId(
    @Param('id') id: string,
    @Query() query: PaginationDto,
  ) {
    return this.getClustersByProjectIdHandler.main(id, query);
  }
}
