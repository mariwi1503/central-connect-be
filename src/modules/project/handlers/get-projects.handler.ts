import { Injectable } from '@nestjs/common';
import { PaginationDto } from 'src/common/dtos';
import { CisService } from 'src/integrations/cis/cis.service';

@Injectable()
export class GetProjectsHandler {
  constructor(private cisService: CisService) {}

  async main(query: PaginationDto) {
    return this.cisService.getProjects(query);
  }
}
