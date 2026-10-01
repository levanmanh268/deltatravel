import { Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { z } from 'zod';
import { PaginationSchema } from '@tour/shared';
import { Public } from '../auth/guards';
import { ZodPipe } from '../common/http';
import { SchedulesService } from './schedules.service';

const PublicPaginationSchema = PaginationSchema.extend({
  contract: z.literal('v2').optional(),
}).strict();
const ScheduleContractSchema = z.object({ contract: z.literal('v2').optional() }).strict();

@Public()
@Controller()
export class SchedulesController {
  constructor(private readonly schedules: SchedulesService) {}
  @Get('tours/:id/schedules')
  list(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Query(new ZodPipe(PublicPaginationSchema)) q: z.infer<typeof PublicPaginationSchema>,
  ) {
    return this.schedules.list(id, q.page, q.pageSize, q.contract === 'v2');
  }
  @Get('schedules/:id/availability')
  get(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Query(new ZodPipe(ScheduleContractSchema)) q: z.infer<typeof ScheduleContractSchema>,
  ) {
    return this.schedules.get(id, q.contract === 'v2');
  }
}
