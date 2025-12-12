import mongoose from 'mongoose';
import { ShiftTypeSchema } from './models/shift-type.schema';
import { ShiftSchema } from './models/shift.schema';
import { HolidaySchema } from './models/holiday.schema';
import { latenessRuleSchema } from './models/lateness-rule.schema';
import { OvertimeRuleSchema } from './models/overtime-rule.schema';
import { ScheduleRuleSchema } from './models/schedule-rule.schema';
import { ShiftAssignmentSchema } from './models/shift-assignment.schema';
import { PunchPolicy, HolidayType, ShiftAssignmentStatus, ShiftTypeCategory } from './models/enums/index';

export async function seedTimeManagement(connection: mongoose.Connection, employees: any, departments: any, positions: any) {
  const ShiftTypeModel = connection.model('ShiftType', ShiftTypeSchema);
  const ShiftModel = connection.model('Shift', ShiftSchema);
  const HolidayModel = connection.model('Holiday', HolidaySchema);
  const LatenessRuleModel = connection.model('LatenessRule', latenessRuleSchema);
  const OvertimeRuleModel = connection.model('OvertimeRule', OvertimeRuleSchema);
  const ScheduleRuleModel = connection.model('ScheduleRule', ScheduleRuleSchema);
  const ShiftAssignmentModel = connection.model('ShiftAssignment', ShiftAssignmentSchema);

  console.log('Clearing Time Management...');
  await ShiftTypeModel.deleteMany({});
  await ShiftModel.deleteMany({});
  await HolidayModel.deleteMany({});
  await LatenessRuleModel.deleteMany({});
  await OvertimeRuleModel.deleteMany({});
  await ScheduleRuleModel.deleteMany({});
  await ShiftAssignmentModel.deleteMany({});

  // ==================== SHIFT TYPES (Enhanced) ====================
  console.log('Seeding Shift Types...');
  
  const morningShiftType = await ShiftTypeModel.create({
    code: 'DAY-001',
    name: 'Standard Day Shift',
    category: ShiftTypeCategory.NORMAL,
    startTime: '09:00',
    endTime: '17:00',
    totalDurationMinutes: 480,
    breakDurationMinutes: 60,
    isNightShift: false,
    isWeekendShift: false,
    graceMinutesIn: 15,
    graceMinutesOut: 10,
    description: 'Standard 9 AM to 5 PM office shift with 1 hour lunch break',
    active: true,
  });

  const nightShiftType = await ShiftTypeModel.create({
    code: 'NIGHT-001',
    name: 'Night Shift',
    category: ShiftTypeCategory.OVERNIGHT,
    startTime: '22:00',
    endTime: '06:00',
    totalDurationMinutes: 480,
    breakDurationMinutes: 60,
    isNightShift: true,
    isWeekendShift: false,
    graceMinutesIn: 15,
    graceMinutesOut: 15,
    description: 'Night shift with night differential pay',
    active: true,
  });

  const splitShiftType = await ShiftTypeModel.create({
    code: 'SPLIT-001',
    name: 'Split Shift (Morning/Evening)',
    category: ShiftTypeCategory.SPLIT,
    totalDurationMinutes: 480,
    breakDurationMinutes: 180,
    splitParts: [
      { startTime: '07:00', endTime: '11:00' },
      { startTime: '16:00', endTime: '20:00' }
    ],
    isNightShift: false,
    isWeekendShift: false,
    graceMinutesIn: 10,
    graceMinutesOut: 10,
    description: 'Split shift for peak hours coverage',
    active: true,
  });

  const flexibleShiftType = await ShiftTypeModel.create({
    code: 'FLEX-001',
    name: 'Flexible Hours',
    category: ShiftTypeCategory.FLEXIBLE,
    startTime: '06:00',
    endTime: '22:00',
    totalDurationMinutes: 480,
    breakDurationMinutes: 60,
    isNightShift: false,
    isWeekendShift: false,
    graceMinutesIn: 30,
    graceMinutesOut: 30,
    description: 'Flexible working hours - clock in any time between 6 AM and 10 AM',
    active: true,
  });

  const rotationalShiftType = await ShiftTypeModel.create({
    code: 'ROT-001',
    name: 'Rotational 3-Shift',
    category: ShiftTypeCategory.ROTATIONAL,
    totalDurationMinutes: 480,
    breakDurationMinutes: 60,
    isNightShift: false,
    isWeekendShift: true,
    graceMinutesIn: 15,
    graceMinutesOut: 15,
    description: 'Rotational shift for 24/7 operations',
    active: true,
  });

  const weekendShiftType = await ShiftTypeModel.create({
    code: 'WKND-001',
    name: 'Weekend Shift',
    category: ShiftTypeCategory.NORMAL,
    startTime: '10:00',
    endTime: '18:00',
    totalDurationMinutes: 480,
    breakDurationMinutes: 60,
    isNightShift: false,
    isWeekendShift: true,
    graceMinutesIn: 20,
    graceMinutesOut: 15,
    description: 'Weekend shift with weekend premium pay',
    active: true,
  });

  console.log('Shift Types seeded: 6 types');

  // ==================== SHIFTS ====================
  console.log('Seeding Shifts...');
  const standardMorningShift = await ShiftModel.create({
    name: 'Standard Morning (9-5)',
    shiftType: morningShiftType._id,
    startTime: '09:00',
    endTime: '17:00',
    punchPolicy: PunchPolicy.FIRST_LAST,
    graceInMinutes: 15,
    graceOutMinutes: 15,
    requiresApprovalForOvertime: true,
    active: true,
  });

  const standardNightShift = await ShiftModel.create({
    name: 'Standard Night (10PM-6AM)',
    shiftType: nightShiftType._id,
    startTime: '22:00',
    endTime: '06:00',
    punchPolicy: PunchPolicy.FIRST_LAST,
    graceInMinutes: 15,
    graceOutMinutes: 15,
    requiresApprovalForOvertime: true,
    active: true,
  });

  const splitShift = await ShiftModel.create({
    name: 'Customer Service Split',
    shiftType: splitShiftType._id,
    startTime: '07:00',
    endTime: '20:00',
    punchPolicy: PunchPolicy.MULTIPLE,
    graceInMinutes: 10,
    graceOutMinutes: 10,
    requiresApprovalForOvertime: true,
    active: true,
  });

  const flexShift = await ShiftModel.create({
    name: 'IT Flexible Hours',
    shiftType: flexibleShiftType._id,
    startTime: '06:00',
    endTime: '22:00',
    punchPolicy: PunchPolicy.MULTIPLE,
    graceInMinutes: 30,
    graceOutMinutes: 30,
    requiresApprovalForOvertime: false,
    active: true,
  });

  console.log('Shifts seeded: 4 shifts');

  // ==================== HOLIDAYS ====================
  console.log('Seeding Holidays...');
  const holidays = [
    { type: HolidayType.NATIONAL, startDate: new Date('2025-01-01'), name: 'New Year\'s Day', active: true },
    { type: HolidayType.NATIONAL, startDate: new Date('2025-01-20'), name: 'Martin Luther King Jr. Day', active: true },
    { type: HolidayType.NATIONAL, startDate: new Date('2025-02-17'), name: 'Presidents Day', active: true },
    { type: HolidayType.NATIONAL, startDate: new Date('2025-05-26'), name: 'Memorial Day', active: true },
    { type: HolidayType.NATIONAL, startDate: new Date('2025-07-04'), name: 'Independence Day', active: true },
    { type: HolidayType.NATIONAL, startDate: new Date('2025-09-01'), name: 'Labor Day', active: true },
    { type: HolidayType.NATIONAL, startDate: new Date('2025-11-27'), name: 'Thanksgiving Day', active: true },
    { type: HolidayType.NATIONAL, startDate: new Date('2025-11-28'), name: 'Day After Thanksgiving', active: true },
    { type: HolidayType.NATIONAL, startDate: new Date('2025-12-25'), name: 'Christmas Day', active: true },
    { type: HolidayType.NATIONAL, startDate: new Date('2025-12-26'), name: 'Boxing Day', active: true },
    { type: HolidayType.ORGANIZATIONAL, startDate: new Date('2025-03-15'), name: 'Company Foundation Day', active: true },
    { type: HolidayType.ORGANIZATIONAL, startDate: new Date('2025-06-15'), name: 'Annual Company Picnic', active: true },
    { type: HolidayType.WEEKLY_REST, startDate: new Date('2025-01-04'), name: 'Saturday', active: true },
    { type: HolidayType.WEEKLY_REST, startDate: new Date('2025-01-05'), name: 'Sunday', active: true },
  ];
  await HolidayModel.insertMany(holidays);
  console.log('Holidays seeded: 14 holidays');

  // ==================== LATENESS RULES (Enhanced) ====================
  console.log('Seeding Lateness Rules...');
  const latenessRules = [
    {
      code: 'LATE-STD',
      name: 'Standard Lateness Policy',
      description: 'Standard policy with 15-minute grace period',
      gracePeriodMinutes: 15,
      deductionPerMinute: 0.5,
      isPercentage: false,
      maxDeductionMinutes: 60,
      warningThreshold: 3,
      escalationThreshold: 5,
      periodDays: 30,
      autoDeduct: false,
      active: true,
    },
    {
      code: 'LATE-STRICT',
      name: 'Strict Lateness Policy',
      description: 'Strict policy for customer-facing roles',
      gracePeriodMinutes: 5,
      deductionPerMinute: 1.0,
      isPercentage: false,
      maxDeductionMinutes: 120,
      warningThreshold: 2,
      escalationThreshold: 3,
      periodDays: 14,
      autoDeduct: true,
      active: true,
    },
    {
      code: 'LATE-FLEX',
      name: 'Flexible Lateness Policy',
      description: 'Lenient policy for flexible work arrangements',
      gracePeriodMinutes: 30,
      deductionPerMinute: 0,
      isPercentage: false,
      maxDeductionMinutes: 0,
      warningThreshold: 5,
      escalationThreshold: 10,
      periodDays: 60,
      autoDeduct: false,
      active: true,
    },
    {
      code: 'LATE-PCT',
      name: 'Percentage-Based Deduction',
      description: 'Deduction as percentage of daily wage',
      gracePeriodMinutes: 10,
      deductionPerMinute: 0.1,
      isPercentage: true,
      maxDeductionMinutes: 120,
      warningThreshold: 3,
      escalationThreshold: 5,
      periodDays: 30,
      autoDeduct: true,
      active: true,
    },
  ];
  await LatenessRuleModel.insertMany(latenessRules);
  console.log('Lateness Rules seeded: 4 rules');

  // ==================== OVERTIME RULES (Enhanced) ====================
  console.log('Seeding Overtime Rules...');
  const overtimeRules = [
    {
      code: 'OT-STD',
      name: 'Standard Overtime',
      description: 'Standard overtime policy - 1.5x for weekday, 2x for weekend',
      minMinutesBeforeOvertime: 480,
      weekdayMultiplier: 1.5,
      weekendMultiplier: 2.0,
      holidayMultiplier: 2.5,
      nightShiftMultiplier: 1.25,
      maxOvertimeMinutesPerDay: 240,
      maxOvertimeMinutesPerWeek: 600,
      maxOvertimeMinutesPerMonth: 2400,
      requiresPreApproval: false,
      active: true,
      approved: true,
    },
    {
      code: 'OT-PREM',
      name: 'Premium Overtime',
      description: 'Premium overtime for critical projects',
      minMinutesBeforeOvertime: 480,
      weekdayMultiplier: 2.0,
      weekendMultiplier: 2.5,
      holidayMultiplier: 3.0,
      nightShiftMultiplier: 1.5,
      maxOvertimeMinutesPerDay: 360,
      maxOvertimeMinutesPerWeek: 1200,
      maxOvertimeMinutesPerMonth: 3600,
      requiresPreApproval: true,
      active: true,
      approved: true,
    },
    {
      code: 'OT-PART',
      name: 'Part-Time Overtime',
      description: 'Overtime for part-time employees after 4 hours',
      minMinutesBeforeOvertime: 240,
      weekdayMultiplier: 1.25,
      weekendMultiplier: 1.5,
      holidayMultiplier: 2.0,
      nightShiftMultiplier: 1.1,
      maxOvertimeMinutesPerDay: 120,
      maxOvertimeMinutesPerWeek: 480,
      maxOvertimeMinutesPerMonth: 1200,
      requiresPreApproval: false,
      active: true,
      approved: true,
    },
    {
      code: 'OT-NIGHT',
      name: 'Night Shift Overtime',
      description: 'Special overtime rules for night shift workers',
      minMinutesBeforeOvertime: 480,
      weekdayMultiplier: 1.75,
      weekendMultiplier: 2.25,
      holidayMultiplier: 3.0,
      nightShiftMultiplier: 1.0,
      maxOvertimeMinutesPerDay: 180,
      maxOvertimeMinutesPerWeek: 720,
      maxOvertimeMinutesPerMonth: 2160,
      requiresPreApproval: true,
      active: true,
      approved: true,
    },
  ];
  await OvertimeRuleModel.insertMany(overtimeRules);
  console.log('Overtime Rules seeded: 4 rules');

  // ==================== SCHEDULE RULES ====================
  console.log('Seeding Schedule Rules...');
  const scheduleRules = [
    { name: 'Standard Week (Mon-Fri)', pattern: 'Mon,Tue,Wed,Thu,Fri', active: true },
    { name: 'Full Week (Mon-Sat)', pattern: 'Mon,Tue,Wed,Thu,Fri,Sat', active: true },
    { name: 'Weekend Shift (Sat-Sun)', pattern: 'Sat,Sun', active: true },
    { name: 'Alternating Weekends', pattern: 'Mon,Tue,Wed,Thu,Fri,Alt-Sat,Alt-Sun', active: true },
    { name: '4-Day Week', pattern: 'Mon,Tue,Wed,Thu', active: true },
    { name: 'Compressed Week (4x10)', pattern: 'Mon,Tue,Wed,Thu (10-hour days)', active: true },
  ];
  await ScheduleRuleModel.insertMany(scheduleRules);
  console.log('Schedule Rules seeded: 6 rules');

  // ==================== SHIFT ASSIGNMENTS ====================
  console.log('Seeding Shift Assignments...');
  const startDate = new Date();
  const endDate = new Date();
  endDate.setMonth(endDate.getMonth() + 12); // 1 year assignment

  const assignmentsCreated: any[] = [];
  
  // Assign shifts to available employees
  if (employees) {
    const employeeKeys = Object.keys(employees);
    const shiftOptions = [standardMorningShift, standardNightShift, splitShift, flexShift];
    
    for (let i = 0; i < employeeKeys.length && i < 10; i++) {
      const emp = employees[employeeKeys[i]];
      if (emp && emp._id) {
        const assignment = await ShiftAssignmentModel.create({
          employeeId: emp._id,
          shiftId: shiftOptions[i % shiftOptions.length]._id,
          startDate: startDate,
          endDate: endDate,
          status: ShiftAssignmentStatus.APPROVED,
        });
        assignmentsCreated.push(assignment as any);
      }
    }
  }
  console.log(`Shift Assignments seeded: ${assignmentsCreated.length} assignments`);

  return {
    shiftTypes: { morningShiftType, nightShiftType, splitShiftType, flexibleShiftType, rotationalShiftType, weekendShiftType },
    shifts: { standardMorningShift, standardNightShift, splitShift, flexShift },
    assignments: assignmentsCreated,
  };
}
