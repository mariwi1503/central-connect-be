import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import {
  CreateFeatureHandler,
  CreateSubFeatureHandler,
  GetFeaturesHandler,
  GetSubFeaturesHandler,
} from './handlers';
import { FeatureType } from 'prisma/generated/enums';
import { CreateFeatureDto, CreateSubFeatureDto } from './dtos';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtGuard } from '../auth/guards/jwt.guard';

@UseGuards(JwtGuard)
@ApiTags('Features and Sub Features')
@Controller('features')
export class FeatureController {
  constructor(
    private createFeatureHandler: CreateFeatureHandler,
    private getFeaturesHandler: GetFeaturesHandler,
    private createSubFeatureHandler: CreateSubFeatureHandler,
    private getSubFeaturesHandler: GetSubFeaturesHandler,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create new Feature' })
  createFeature(@Body() body: CreateFeatureDto) {
    return this.createFeatureHandler.main(body);
  }

  @Post('sub')
  @ApiOperation({ summary: 'Create new Sub Feature' })
  createSubFeature(@Body() body: CreateSubFeatureDto) {
    return this.createSubFeatureHandler.main(body);
  }

  @Get('web')
  @ApiOperation({ summary: 'Get Web/Dashboard Features includes sub features' })
  getFeaturesWeb() {
    return this.getFeaturesHandler.main(FeatureType.WEB);
  }

  @Get('mobile')
  @ApiOperation({ summary: 'Get Mobile Features includes sub features' })
  getFeaturesMobile() {
    return this.getFeaturesHandler.main(FeatureType.MOBILE);
  }

  @Get(':id/sub')
  @ApiOperation({
    summary: 'Get all sub feature by under specific parent feature',
  })
  getSubFeatures(@Param('id') id: string) {
    return this.getSubFeaturesHandler.main(id);
  }
}
