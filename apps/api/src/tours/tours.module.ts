import { Module } from '@nestjs/common';
import { ToursService } from './tours.service';
import { ToursController } from './tours.controller';
import { ReviewsService } from './reviews.service';
import { ReviewsController } from './reviews.controller';
@Module({
  providers: [ToursService, ReviewsService],
  controllers: [ToursController, ReviewsController],
  exports: [ToursService],
})
export class ToursModule {}
