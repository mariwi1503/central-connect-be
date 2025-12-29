import { Module } from '@nestjs/common';
import { ComplaintCategoryController } from './complaint-category.controller';
import {
  CreateComplaintCategoryHandler,
  DeleteComplaintCategoryHandler,
  GetComplaintCategoriesHandler,
  GetComplaintCategoryDetailHandler,
  UpdateComplaintCategoryHandler,
} from './handlers';

@Module({
  controllers: [ComplaintCategoryController],
  providers: [
    CreateComplaintCategoryHandler,
    GetComplaintCategoriesHandler,
    GetComplaintCategoryDetailHandler,
    DeleteComplaintCategoryHandler,
    UpdateComplaintCategoryHandler,
  ],
})
export class ComplaintCategoryModule {}
