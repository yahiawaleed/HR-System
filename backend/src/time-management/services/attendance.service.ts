import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Document } from 'mongoose';

export interface Attendance extends Document {
  [key: string]: any;
}

export interface EmployeeShift extends Document {
  [key: string]: any;
}

@Injectable()
export class AttendanceService {
  constructor(
    @InjectModel('Attendance') private attendanceModel: Model<Attendance>,
    @InjectModel('EmployeeShift') private employeeShiftModel: Model<EmployeeShift>,
  ) {}

  async clockIn(employeeId: string, clockInTime: Date): Promise<Attendance> {
    const today = new Date(clockInTime);
    today.setHours(0, 0, 0, 0);

    // Get employee's active shift
    const activeShift = await this.employeeShiftModel
      .findOne({ employeeId, isActive: true })
      .populate('shiftId')
      .exec();

    let attendance = await this.attendanceModel.findOne({
      employeeId,
      date: today,
    }).exec();

    if (!attendance) {
      attendance = new this.attendanceModel({
        employeeId,
        date: today,
        shiftId: activeShift?.shiftId,
        clockIn: clockInTime,
        status: 'present',
      });
    } else {
      attendance.clockIn = clockInTime;
    }

    // Check for lateness if shift exists
    if (activeShift?.shiftId) {
      const shift = activeShift.shiftId as any;
      if (shift.startTime) {
        const [hours, minutes] = shift.startTime.split(':');
        const shiftStart = new Date(today);
        shiftStart.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        
        if (clockInTime > shiftStart) {
          const lateMinutes = Math.floor((clockInTime.getTime() - shiftStart.getTime()) / 60000);
          attendance.isLate = true;
          attendance.lateMinutes = lateMinutes;
          attendance.status = 'late';
        }
      }
    }

    return attendance.save();
  }

  async clockOut(employeeId: string, clockOutTime: Date): Promise<Attendance> {
    const today = new Date(clockOutTime);
    today.setHours(0, 0, 0, 0);

    const attendance = await this.attendanceModel.findOne({
      employeeId,
      date: today,
    }).exec();

    if (!attendance) {
      throw new NotFoundException('No attendance record found for clock out');
    }

    attendance.clockOut = clockOutTime;

    // Calculate hours worked
    if (attendance.clockIn) {
      const hoursWorked = (clockOutTime.getTime() - attendance.clockIn.getTime()) / (1000 * 60 * 60);
      attendance.hoursWorked = Math.round(hoursWorked * 100) / 100;
    }

    return attendance.save();
  }

  async findAll(filters?: any): Promise<Attendance[]> {
    const query = this.attendanceModel.find();
    if (filters?.employeeId) {
      query.where('employeeId').equals(filters.employeeId);
    }
    if (filters?.date) {
      query.where('date').equals(filters.date);
    }
    return query.populate('employeeId').populate('shiftId').exec();
  }

  async correctAttendance(id: string, correctionData: any, userId: string): Promise<Attendance> {
    const attendance = await this.attendanceModel.findByIdAndUpdate(
      id,
      { ...correctionData, correctedBy: userId, correctedAt: new Date() },
      { new: true },
    ).exec();
    if (!attendance) {
      throw new NotFoundException(`Attendance with ID ${id} not found`);
    }
    return attendance;
  }
}

