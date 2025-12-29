import { Module } from '@nestjs/common';
import { CisModule } from 'src/integrations/cis/cis.module';
import { GetClusterByIdHandler, GetClustersHandler } from './handlers';
import { ClusterController } from './cluster.controller';
import { GetUnitsByClusterIdHandler } from './handlers/get-units-by-cluster-id.handler';

@Module({
  controllers: [ClusterController],
  imports: [CisModule],
  providers: [
    GetClustersHandler,
    GetClusterByIdHandler,
    GetUnitsByClusterIdHandler,
  ],
})
export class ClusterModule {}
