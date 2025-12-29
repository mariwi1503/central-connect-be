import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  CreateComplaintCategoryHandler,
  DeleteComplaintCategoryHandler,
  GetComplaintCategoriesHandler,
  GetComplaintCategoryDetailHandler,
  UpdateComplaintCategoryHandler,
} from './handlers';
import { CreateComplaintCategoryDto, UpdateComplaintCategoryDto } from './dtos';
import { JwtGuard } from '../auth/guards/jwt.guard';

@UseGuards(JwtGuard)
@ApiBearerAuth()
@ApiTags('Complaint Category')
@Controller('complaint-categories')
export class ComplaintCategoryController {
  constructor(
    private createComplaintCategoryHandler: CreateComplaintCategoryHandler,
    private getComplaintCategoriesHandler: GetComplaintCategoriesHandler,
    private getComplaintCategoryDetailHandler: GetComplaintCategoryDetailHandler,
    private deleteComplaintCategoryHandler: DeleteComplaintCategoryHandler,
    private updateComplaintCategoryHandler: UpdateComplaintCategoryHandler,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all complaint categories' })
  getComplaintCategories() {
    return this.getComplaintCategoriesHandler.main();
  }

  @Post()
  @ApiOperation({ summary: 'Create new complaint category' })
  createComplaintCategory(@Body() body: CreateComplaintCategoryDto) {
    return this.createComplaintCategoryHandler.main(body);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get complaint categoriy detail' })
  getComplaintCategoryDetail(@Param('id') id: string) {
    return this.getComplaintCategoryDetailHandler.main(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update complaint category' })
  updateComplaintCategory(
    @Param('id') id: string,
    @Body() body: UpdateComplaintCategoryDto,
  ) {
    return this.updateComplaintCategoryHandler.main(id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete complaint category (soft delete)' })
  deleteComplaintCategory(@Param('id') id: string) {
    return this.deleteComplaintCategoryHandler.main(id);
  }
}
