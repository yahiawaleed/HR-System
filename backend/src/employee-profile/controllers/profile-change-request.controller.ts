import { Controller, Get, Post, Body, Param, Patch, UseGuards, Request } from '@nestjs/common';
import { ProfileChangeRequestService } from '../services/profile-change-request.service';
import { CreateProfileChangeRequestDto, ReviewChangeRequestDto } from '../dto/profile-change-request.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('profile-change-requests')
@UseGuards(JwtAuthGuard)
export class ProfileChangeRequestController {
  constructor(
    private readonly profileChangeRequestService: ProfileChangeRequestService,
  ) {}

  @Post()
  async create(@Body() createDto: CreateProfileChangeRequestDto, @Request() req) {
    return this.profileChangeRequestService.create(createDto, req.user.userId);
  }

  @Get()
  async findAll() {
    return this.profileChangeRequestService.findAll();
  }

  @Get('pending')
  async findPending() {
    return this.profileChangeRequestService.findPending();
  }

  @Patch(':id/review')
  async review(
    @Param('id') id: string,
    @Body() reviewDto: ReviewChangeRequestDto,
    @Request() req,
  ) {
    return this.profileChangeRequestService.review(id, reviewDto, req.user.userId);
  }
}

