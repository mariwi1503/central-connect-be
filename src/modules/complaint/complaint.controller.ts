import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  CreateComplaintHandler,
  GetComplaintDetailHandler,
  GetComplaintsHandler,
} from './handlers';
import { CreateComplaintDto, GetComplaintsDto } from './dtos';
import { GetCurrentUserId } from 'src/decorators';
import { JwtGuard } from '../auth/guards/jwt.guard';

@UseGuards(JwtGuard)
@ApiBearerAuth()
@ApiTags('Complaints')
@Controller('complaints')
export class ComplaintController {
  constructor(
    private getComplaintsHandler: GetComplaintsHandler,
    private getComplaintDetailHandler: GetComplaintDetailHandler,
    private createComplaintHandler: CreateComplaintHandler,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all complaints' })
  getComplaints(@Query() query: GetComplaintsDto) {
    return this.getComplaintsHandler.main(query);
  }

  @Post()
  @ApiOperation({ summary: 'Create new complaint' })
  createComplaint(
    @Body() body: CreateComplaintDto,
    @GetCurrentUserId() userId: string,
  ) {
    return this.createComplaintHandler.main(userId, body);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get Complaint Detail by ID' })
  getComplaintDetail(@Param('id') id: string) {
    return this.getComplaintDetailHandler.main(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'update complaints' })
  updateComplaints() {
    return 'updateComplaints';
  }
}
