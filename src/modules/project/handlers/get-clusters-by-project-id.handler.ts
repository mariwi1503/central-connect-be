import { Injectable } from '@nestjs/common';
import { PaginationDto } from 'src/common/dtos';
import { CisService } from 'src/integrations/cis/cis.service';

@Injectable()
export class GetClustersByProjectIdHandler {
  constructor(private cisService: CisService) {}

  async main(projectId: string, query: PaginationDto) {
    return this.cisService.getClustersByProjectId(projectId, query);
  }
}
