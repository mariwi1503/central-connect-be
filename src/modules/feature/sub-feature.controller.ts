import { Body, Controller, Post } from '@nestjs/common';
import { CreateFeatureHandler } from './handlers';
import { CreateFeatureDto } from './dtos/create-feature.dto';
import { ApiTags } from '@nestjs/swagger';

@Controller('sub-features')
export class SubFeatureController {
  constructor(private createFeatureHandler: CreateFeatureHandler) {}

  @Post()
  createFeature(@Body() body: CreateFeatureDto) {
    return this.createFeatureHandler.main(body);
  }
}
