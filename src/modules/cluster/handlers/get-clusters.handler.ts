import { Injectable } from '@nestjs/common';
import { PaginationDto } from 'src/common/dtos';
import { CisService } from 'src/integrations/cis/cis.service';

@Injectable()
export class GetClustersHandler {
  constructor(private cisService: CisService) {}

  main(query: PaginationDto) {
    return this.cisService.getClusters(query);
  }
}
