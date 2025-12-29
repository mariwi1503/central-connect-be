import { Module } from '@nestjs/common';
import { FeatureController } from './feature.controller';
import {
  CreateFeatureHandler,
  CreateSubFeatureHandler,
  GetFeaturesHandler,
  GetSubFeaturesHandler,
} from './handlers';
import { SubFeatureController } from './sub-feature.controller';

@Module({
  controllers: [FeatureController],
  providers: [
    CreateSubFeatureHandler,
    CreateFeatureHandler,
    GetFeaturesHandler,
    GetSubFeaturesHandler
  ],
})
export class FeatureModule {}
