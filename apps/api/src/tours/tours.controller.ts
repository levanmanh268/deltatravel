import { Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { z } from 'zod';
import { TourQuerySchema } from '@tour/shared';
import { Public } from '../auth/guards';
import { ZodPipe } from '../common/http';
import { ToursService } from './tours.service';

const PublicTourQuerySchema = TourQuerySchema.extend({
  contract: z.literal('v2').optional(),
}).strict();
const TourContractSchema = z.object({ contract: z.literal('v2').optional() }).strict();

@Public()
@Controller('tours')
export class ToursController {
  constructor(private readonly tours: ToursService) {}
  @Get()
  list(@Query(new ZodPipe(PublicTourQuerySchema)) q: z.infer<typeof PublicTourQuerySchema>) {
    return this.tours.list(q, false, q.contract === 'v2');
  }
  @Get(':id')
  get(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Query(new ZodPipe(TourContractSchema)) q: z.infer<typeof TourContractSchema>,
  ) {
    return this.tours.get(id, q.contract === 'v2');
  }
}
