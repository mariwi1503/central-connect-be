import { Injectable } from '@nestjs/common';
import { CisService } from 'src/integrations/cis/cis.service';

@Injectable()
export class GetProjectByIdHandler {
  constructor(private cisService: CisService) {}

  async main(id: string) {
    return this.cisService.getProjectById(id);
  }
}
