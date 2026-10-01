import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Req } from '@nestjs/common';
import { z } from 'zod';
import { CreateTourReviewSchema } from '@tour/shared';
import { Public } from '../auth/guards';
import { AppRequest, ZodPipe } from '../common/http';
import { ReviewsService } from './reviews.service';

@Controller()
export class ReviewsController {
  constructor(private readonly reviews: ReviewsService) {}

  @Public()
  @Get('tours/:id/reviews')
  list(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.reviews.list(id);
  }

  @Post('tours/:id/reviews')
  upsert(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body(new ZodPipe(CreateTourReviewSchema)) body: z.infer<typeof CreateTourReviewSchema>,
    @Req() req: AppRequest,
  ) {
    return this.reviews.upsert(id, req.user!.id, body);
  }

  @Delete('tours/:id/reviews/mine')
  removeMine(@Param('id', new ParseUUIDPipe()) id: string, @Req() req: AppRequest) {
    return this.reviews.removeMine(id, req.user!.id);
  }
}
