const mongoose = require('mongoose');

async function test() {
  await mongoose.connect('mongodb://localhost:27017/hr-system');
  console.log('Connected');

  const AttendanceSchema = new mongoose.Schema({
    employeeId: mongoose.Schema.Types.ObjectId,
    date: Date,
    totalWorkMinutes: Number,
    isLate: Boolean,
    lateMinutes: Number,
    hasMissedPunch: Boolean
  });

  const Attendance = mongoose.model('AttendanceRecord', AttendanceSchema);

  const start = new Date('2025-11-01');
  const end = new Date('2025-12-31');

  // Direct query count
  const count = await Attendance.countDocuments({ 
    date: { $gte: start, $lte: end } 
  });
  console.log('Count in date range:', count);

  // Sample records
  const records = await Attendance.find({ 
    date: { $gte: start, $lte: end } 
  }).limit(5);
  
  records.forEach(r => {
    console.log(`Date: ${r.date}, isLate: ${r.isLate}, lateMinutes: ${r.lateMinutes}, workMins: ${r.totalWorkMinutes}, missedPunch: ${r.hasMissedPunch}`);
  });

  // Stats
  const lateCount = await Attendance.countDocuments({ 
    date: { $gte: start, $lte: end },
    isLate: true 
  });
  const missedPunchCount = await Attendance.countDocuments({ 
    date: { $gte: start, $lte: end },
    hasMissedPunch: true 
  });
  const overtimeCount = await Attendance.countDocuments({ 
    date: { $gte: start, $lte: end },
    totalWorkMinutes: { $gt: 480 } 
  });

  console.log(`\nStats: Late=${lateCount}, MissedPunch=${missedPunchCount}, Overtime=${overtimeCount}`);

  await mongoose.disconnect();
}

test();
