import { Injectable } from '@nestjs/common';
import { PaginationDto } from 'src/common/dtos';
import { CisService } from 'src/integrations/cis/cis.service';

@Injectable()
export class GetClusterByIdHandler {
  constructor(private cisService: CisService) {}

  main(id: string) {
    return this.cisService.getClusterById(id);
  }
}
