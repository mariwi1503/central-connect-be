import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { PaginationDto } from 'src/common/dtos';
import {
  GetClusterByIdHandler,
  GetClustersHandler,
  GetUnitsByClusterIdHandler,
} from './handlers';

@UseGuards(JwtGuard)
@ApiBearerAuth()
@ApiTags('Clusters and Units')
@Controller('clusters')
export class ClusterController {
  constructor(
    private readonly getClustersHandler: GetClustersHandler,
    private getClusterByIdHandler: GetClusterByIdHandler,
    private getUnitByClusterIdHandler: GetUnitsByClusterIdHandler,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get clusters' })
  getClusters(@Query() query: PaginationDto) {
    return this.getClustersHandler.main(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get Cluster by ID (ID from CIS)' })
  getClusterById(@Param('id') id: string) {
    return this.getClusterByIdHandler.main(id);
  }

  @Get(':id/units')
  @ApiOperation({ summary: 'Get all units under specific cluster' })
  getUnitByClusterId(@Param('id') id: string, @Query() query: PaginationDto) {
    return this.getUnitByClusterIdHandler.main(id, query);
  }
}
