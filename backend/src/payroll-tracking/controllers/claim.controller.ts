import { Controller, Get, Post, Body, Param, Patch } from '@nestjs/common';
import { ClaimService } from '../services/claim.service';
import { CreateClaimDto } from '../dto/create-claim.dto';

@Controller('claims')
export class ClaimController {
  constructor(private readonly claimService: ClaimService) {}

  @Post()
  async create(@Body() createClaimDto: CreateClaimDto) {
    return this.claimService.create(createClaimDto);
  }

  @Get()
  async findAll() {
    return this.claimService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.claimService.findOne(id);
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() body: { status: string; approverId: string },
  ) {
    return this.claimService.updateStatus(id, body.status, body.approverId);
  }
}

