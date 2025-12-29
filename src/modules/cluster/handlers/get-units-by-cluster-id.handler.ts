import { Injectable } from '@nestjs/common';
import { PaginationDto } from 'src/common/dtos';
import { CisService } from 'src/integrations/cis/cis.service';

@Injectable()
export class GetUnitsByClusterIdHandler {
  constructor(private cisService: CisService) {}

  main(id: string, query: PaginationDto) {
    return this.cisService.getUnitsByClusterId(id, query);
  }
}
