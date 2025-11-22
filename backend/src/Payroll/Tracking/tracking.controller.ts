import { Controller } from '@nestjs/common';
import { TrackingService } from './tracking.service';

@Controller('tracking')
export class TrackingController {
  constructor(private readonly trackingService: TrackingService) {}
  
  // You can leave this empty for Milestone 1, 
  // or add a simple test route if you want to see it work.
}