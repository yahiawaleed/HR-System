/**
 * Seed script to insert realistic attendance data for reports
 * Run with: npx ts-node src/time-management/scripts/seed-reports-data.ts
 */

import mongoose from 'mongoose';
import { AttendanceRecordSchema } from '../models/attendance-record.schema';
import { TimeExceptionSchema } from '../models/time-exception.schema';
import { TimeExceptionType, TimeExceptionStatus, PunchType } from '../models/enums';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/hr-system';

// Employee IDs from the system (from employee_profiles collection)
const employeeIds = [
  '6938bda5cd3b72ce6617d314', // Ahmed Hassan
  '6938bda5cd3b72ce6617d319', // Fatima Mohammed
  '6938bda5cd3b72ce6617d31e', // Samira Ali
  '6938bda5cd3b72ce6617d323', // Karim Ibrahim
  '6938bda5cd3b72ce6617d328', // Mohamed Saleh
  '6938bda5cd3b72ce6617d32d', // Nour Khalil
  '6938bda5cd3b72ce6617d332', // Layla Ahmed
  '6938bda6cd3b72ce6617d337', // Khaled Hassan
  '6938bda6cd3b72ce6617d33c', // Dina Mustafa
  '6938bda6cd3b72ce6617d341', // Amira Shawky
  '6938bda6cd3b72ce6617d346', // Wael Karim
];

async function seedReportsData() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const AttendanceRecord = mongoose.model('AttendanceRecord', AttendanceRecordSchema);
    const TimeException = mongoose.model('TimeException', TimeExceptionSchema);

    // Clear existing data
    await AttendanceRecord.deleteMany({});
    await TimeException.deleteMany({});
    console.log('Cleared existing attendance and exception data');

    const attendanceRecords: any[] = [];
    const timeExceptions: any[] = [];

    // Generate 30 days of attendance data for each employee
    const today = new Date();
    
    for (let dayOffset = 0; dayOffset < 30; dayOffset++) {
      const date = new Date(today);
      date.setDate(date.getDate() - dayOffset);
      date.setHours(0, 0, 0, 0);
      
      // Skip weekends
      if (date.getDay() === 0 || date.getDay() === 6) continue;

      for (const empId of employeeIds) {
        // Random scenarios
        const scenario = Math.random();
        
        let clockInHour = 8;
        let clockInMinute = 0;
        let clockOutHour = 17;
        let clockOutMinute = 0;
        let isLate = false;
        let lateMinutes = 0;
        let hasMissedPunch = false;
        let totalWorkMinutes = 540; // 9 hours default

        if (scenario < 0.1) {
          // 10% chance: Late arrival (15-60 minutes)
          lateMinutes = Math.floor(Math.random() * 46) + 15;
          clockInMinute = lateMinutes;
          isLate = true;
          totalWorkMinutes = 540 - lateMinutes;
        } else if (scenario < 0.15) {
          // 5% chance: Missed punch out
          hasMissedPunch = true;
          clockOutHour = 0;
          clockOutMinute = 0;
          totalWorkMinutes = 0;
        } else if (scenario < 0.25) {
          // 10% chance: Overtime (1-3 hours)
          const overtimeHours = Math.floor(Math.random() * 3) + 1;
          clockOutHour = 17 + overtimeHours;
          totalWorkMinutes = 540 + (overtimeHours * 60);
        } else if (scenario < 0.3) {
          // 5% chance: Early leave
          clockOutHour = 15;
          totalWorkMinutes = 420; // 7 hours
        } else {
          // 70% chance: Normal day with slight variations
          clockInMinute = Math.floor(Math.random() * 10);
          clockOutMinute = Math.floor(Math.random() * 30);
          totalWorkMinutes = ((clockOutHour - clockInHour) * 60) + clockOutMinute - clockInMinute;
        }

        const clockInTime = new Date(date);
        clockInTime.setHours(clockInHour, clockInMinute, 0, 0);

        const clockOutTime = new Date(date);
        clockOutTime.setHours(clockOutHour, clockOutMinute, 0, 0);

        const punches = [
          { type: PunchType.IN, time: clockInTime, location: 'Office HQ' }
        ];

        if (!hasMissedPunch) {
          punches.push({ type: PunchType.OUT, time: clockOutTime, location: 'Office HQ' });
        }

        const record = {
          employeeId: new mongoose.Types.ObjectId(empId),
          date: date,
          punches: punches,
          totalWorkMinutes: Math.max(0, totalWorkMinutes),
          hasMissedPunch,
          isLate,
          lateMinutes,
          finalisedForPayroll: !hasMissedPunch && dayOffset > 3,
          exceptionIds: [],
        };

        const savedRecord = await AttendanceRecord.create(record);
        attendanceRecords.push(savedRecord);

        // Create exceptions for problematic records
        if (hasMissedPunch) {
          const exception = await TimeException.create({
            employeeId: new mongoose.Types.ObjectId(empId),
            type: TimeExceptionType.MISSED_PUNCH,
            attendanceRecordId: savedRecord._id,
            assignedTo: new mongoose.Types.ObjectId(employeeIds[1]), // HR Manager
            status: dayOffset > 5 ? TimeExceptionStatus.RESOLVED : TimeExceptionStatus.OPEN,
            reason: 'System did not record clock out',
          });
          timeExceptions.push(exception);
          
          // Update record with exception ID
          await AttendanceRecord.findByIdAndUpdate(savedRecord._id, {
            $push: { exceptionIds: exception._id }
          });
        }

        if (isLate && lateMinutes > 30) {
          const exception = await TimeException.create({
            employeeId: new mongoose.Types.ObjectId(empId),
            type: TimeExceptionType.LATE,
            attendanceRecordId: savedRecord._id,
            assignedTo: new mongoose.Types.ObjectId(employeeIds[1]), // HR Manager
            status: dayOffset > 7 ? TimeExceptionStatus.RESOLVED : TimeExceptionStatus.PENDING,
            reason: `Late by ${lateMinutes} minutes`,
          });
          timeExceptions.push(exception);
          
          await AttendanceRecord.findByIdAndUpdate(savedRecord._id, {
            $push: { exceptionIds: exception._id }
          });
        }
      }
    }

    // Add some repeated lateness exceptions
    const repeatedLatenessEmployees = employeeIds.slice(3, 6);
    for (const empId of repeatedLatenessEmployees) {
      const firstRecord = await AttendanceRecord.findOne({ 
        employeeId: new mongoose.Types.ObjectId(empId) 
      });
      
      if (firstRecord) {
        const exception = await TimeException.create({
          employeeId: new mongoose.Types.ObjectId(empId),
          type: TimeExceptionType.REPEATED_LATENESS,
          attendanceRecordId: firstRecord._id,
          assignedTo: new mongoose.Types.ObjectId(employeeIds[0]), // System Admin
          status: TimeExceptionStatus.ESCALATED,
          reason: 'Multiple lateness incidents in the past 30 days',
        });
        timeExceptions.push(exception);
      }
    }

    // Add some overtime request exceptions
    for (let i = 0; i < 5; i++) {
      const empId = employeeIds[Math.floor(Math.random() * employeeIds.length)];
      const record = await AttendanceRecord.findOne({ 
        employeeId: new mongoose.Types.ObjectId(empId),
        totalWorkMinutes: { $gt: 540 }
      });
      
      if (record) {
        const exception = await TimeException.create({
          employeeId: new mongoose.Types.ObjectId(empId),
          type: TimeExceptionType.OVERTIME_REQUEST,
          attendanceRecordId: record._id,
          assignedTo: new mongoose.Types.ObjectId(employeeIds[4]), // Dept Head
          status: i < 3 ? TimeExceptionStatus.APPROVED : TimeExceptionStatus.PENDING,
          reason: 'Overtime for project deadline',
        });
        timeExceptions.push(exception);
      }
    }

    console.log(`\n=== SEED DATA SUMMARY ===`);
    console.log(`Attendance Records: ${attendanceRecords.length}`);
    console.log(`Time Exceptions: ${timeExceptions.length}`);
    
    // Report summary stats
    const lateRecords = attendanceRecords.filter(r => r.isLate);
    const missedPunchRecords = attendanceRecords.filter(r => r.hasMissedPunch);
    const overtimeRecords = attendanceRecords.filter(r => r.totalWorkMinutes > 540);
    
    console.log(`\n--- Attendance Breakdown ---`);
    console.log(`Late arrivals: ${lateRecords.length}`);
    console.log(`Missed punches: ${missedPunchRecords.length}`);
    console.log(`Overtime records: ${overtimeRecords.length}`);
    
    const exceptionsByType = timeExceptions.reduce((acc, e) => {
      acc[e.type] = (acc[e.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    console.log(`\n--- Exceptions by Type ---`);
    Object.entries(exceptionsByType).forEach(([type, count]) => {
      console.log(`${type}: ${count}`);
    });

    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
    console.log('Reports data seeding complete!');

  } catch (error) {
    console.error('Error seeding reports data:', error);
    process.exit(1);
  }
}

seedReportsData();
