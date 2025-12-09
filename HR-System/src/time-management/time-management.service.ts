// ============================================
// ⚙️ SERVICE - THIS IS WHERE YOU WRITE YOUR FUNCTIONS!
// ============================================
// Services contain business logic and database operations
// This is where you write functions to:
// - Create, Read, Update, Delete data (CRUD)
// - Process business logic
// - Calculate values
// - Interact with MongoDB
// ============================================

import { Injectable } from '@nestjs/common';
// To use database models, import:
// import { InjectModel } from '@nestjs/mongoose';
// import { Model } from 'mongoose';
// import { AttendanceRecord, AttendanceRecordDocument } from './models/attendance-record.schema';

// @Injectable decorator makes this class available for dependency injection
// This means the controller can use this service
@Injectable()
export class TimeManagementService {
  // ============================================
  // TO USE DATABASE MODELS, INJECT THEM IN CONSTRUCTOR:
  // ============================================
  // 
  // constructor(
  //   @InjectModel(AttendanceRecord.name) 
  //   private attendanceModel: Model<AttendanceRecordDocument>,
  //   @InjectModel(Shift.name) 
  //   private shiftModel: Model<ShiftDocument>,
  // ) {}
  // ============================================
  
  // ============================================
  // EXAMPLE FUNCTIONS YOU CAN WRITE:
  // ============================================
  //
  // // Get all records from database
  // async findAll() {
  //   return await this.attendanceModel.find().exec();
  // }
  //
  // // Get one record by ID
  // async findById(id: string) {
  //   return await this.attendanceModel.findById(id).exec();
  // }
  //
  // // Create new record
  // async create(data: any) {
  //   const newRecord = new this.attendanceModel(data);
  //   return await newRecord.save();
  // }
  //
  // // Update existing record
  // async update(id: string, data: any) {
  //   return await this.attendanceModel
  //     .findByIdAndUpdate(id, data, { new: true })
  //     .exec();
  // }
  //
  // // Delete record
  // async delete(id: string) {
  //   return await this.attendanceModel.findByIdAndDelete(id).exec();
  // }
  //
  // // Custom business logic - Calculate work hours
  // async calculateWorkHours(attendanceId: string) {
  //   const attendance = await this.attendanceModel.findById(attendanceId).exec();
  //   let totalMinutes = 0;
  //   // Your calculation logic here...
  //   return totalMinutes;
  // }
  // ============================================
}
