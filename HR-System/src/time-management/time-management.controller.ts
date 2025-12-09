// ============================================
// 🛣️ CONTROLLER - THIS IS WHERE YOU DEFINE ROUTES (API ENDPOINTS)
// ============================================
// Controllers handle incoming HTTP requests and return responses
// Think of this as the "front door" of your API
//
// Example routes you can add:
// GET    /time-management/attendance        → Get all attendance records
// GET    /time-management/attendance/:id    → Get one attendance by ID
// POST   /time-management/attendance        → Create new attendance
// PUT    /time-management/attendance/:id    → Update attendance
// DELETE /time-management/attendance/:id    → Delete attendance
// POST   /time-management/punch-in          → Record punch in
// ============================================

import { Controller } from '@nestjs/common';
// To add routes, import these decorators:
// import { Get, Post, Put, Delete, Param, Body, Query } from '@nestjs/common';
// import { TimeManagementService } from './time-management.service';

// @Controller decorator defines the base route for this controller
// All routes in this controller will start with '/time-management'
@Controller('time-management')
export class TimeManagementController {
  // ============================================
  // TO ADD ROUTES, FOLLOW THIS PATTERN:
  // ============================================
  // 
  // 1. Inject the service in constructor:
  //    constructor(private readonly timeManagementService: TimeManagementService) {}
  //
  // 2. Add route methods using decorators:
  //    @Get('attendance')
  //    getAllAttendance() {
  //      return this.timeManagementService.findAll();
  //    }
  //
  //    @Post('attendance')
  //    createAttendance(@Body() data: any) {
  //      return this.timeManagementService.create(data);
  //    }
  //
  //    @Get('attendance/:id')
  //    getOne(@Param('id') id: string) {
  //      return this.timeManagementService.findById(id);
  //    }
  // ============================================
}
