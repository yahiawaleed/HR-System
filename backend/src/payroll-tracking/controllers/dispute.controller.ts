import { Controller, Get, Post, Body, Param, Patch } from '@nestjs/common';
import { DisputeService } from '../services/dispute.service';
import { CreateDisputeDto } from '../dto/create-dispute.dto';

@Controller('disputes')
export class DisputeController {
  constructor(private readonly disputeService: DisputeService) {}

  @Post()
  async create(@Body() createDisputeDto: CreateDisputeDto) {
    return this.disputeService.create(createDisputeDto);
  }

  @Get()
  async findAll() {
    return this.disputeService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.disputeService.findOne(id);
  }

  @Patch(':id/status')
  async updateStatus(@Param('id') id: string, @Body() body: { status: string }) {
    return this.disputeService.updateStatus(id, body.status);
  }
}

