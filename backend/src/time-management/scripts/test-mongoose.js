const mongoose = require('mongoose');

async function test() {
  await mongoose.connect('mongodb://localhost:27017/hr-system');
  console.log('Connected to MongoDB via Mongoose');

  // Define the schema similar to the NestJS one
  const attendanceSchema = new mongoose.Schema({
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'EmployeeProfile' },
    date: Date,
    isLate: Boolean,
    lateMinutes: Number,
    checkIn: Date,
    checkOut: Date,
    totalMinutesWorked: Number,
    status: String,
  }, { timestamps: true });

  const AttendanceRecord = mongoose.model('AttendanceRecord', attendanceSchema);

  // Test the same query as the service
  const startDate = new Date('2025-11-01');
  const endDate = new Date('2025-12-31');

  console.log('\nQuery parameters:');
  console.log('  startDate:', startDate);
  console.log('  endDate:', endDate);
  console.log('  isLate: true');

  const query = {
    date: {
      $gte: startDate,
      $lte: endDate,
    },
    isLate: true,
  };

  console.log('\nQuery object:', JSON.stringify(query, null, 2));

  const records = await AttendanceRecord.find(query).limit(5);
  console.log('\nRecords found:', records.length);

  if (records.length > 0) {
    console.log('First record:');
    console.log('  _id:', records[0]._id);
    console.log('  employeeId:', records[0].employeeId);
    console.log('  date:', records[0].date);
    console.log('  isLate:', records[0].isLate);
  }

  // Also try just finding ANY record
  const anyRecord = await AttendanceRecord.findOne({});
  console.log('\nAny record in collection:', anyRecord ? 'YES' : 'NO');
  if (anyRecord) {
    console.log('  _id:', anyRecord._id);
    console.log('  date:', anyRecord.date);
    console.log('  isLate:', anyRecord.isLate);
  }

  // Check the collection name Mongoose is using
  console.log('\nCollection name:', AttendanceRecord.collection.name);

  await mongoose.disconnect();
}

test().catch(console.error);
