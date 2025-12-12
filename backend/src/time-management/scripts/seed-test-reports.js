// Seed test data for reports: late arrivals, overtime, and exceptions
const { MongoClient, ObjectId } = require('mongodb');

const uri = 'mongodb://localhost:27017';
const dbName = 'hr-system';

// Employee IDs from the database
const employees = [
  { id: '6938bdfcc3927a84f5e3d679', name: 'Ahmed Hassan' },
  { id: '6938bdfcc3927a84f5e3d67e', name: 'Fatima Mohammed' },
  { id: '6938bdfdc3927a84f5e3d683', name: 'Samira Ali' },
  { id: '6938bdfdc3927a84f5e3d688', name: 'Karim Ibrahim' },
  { id: '6938bdfdc3927a84f5e3d68d', name: 'Mohamed Saleh' },
  { id: '6938bdfdc3927a84f5e3d692', name: 'Nour Khalil' },
  { id: '6938bdfdc3927a84f5e3d697', name: 'Layla Ahmed' },
];

async function seedData() {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db(dbName);
    const attendanceCol = db.collection('attendancerecords');
    const exceptionsCol = db.collection('timeexceptions');
    
    const attendanceRecords = [];
    const exceptions = [];
    
    // Generate attendance for last 30 days
    for (let dayOffset = 1; dayOffset <= 30; dayOffset++) {
      const date = new Date();
      date.setDate(date.getDate() - dayOffset);
      date.setHours(0, 0, 0, 0);
      
      // Skip weekends
      if (date.getDay() === 0 || date.getDay() === 6) continue;
      
      for (const emp of employees) {
        const random = Math.random();
        let isLate = false;
        let lateMinutes = 0;
        let totalWorkMinutes = 480; // 8 hours default
        let hasMissedPunch = false;
        
        // 30% chance of being late
        if (random < 0.3) {
          isLate = true;
          lateMinutes = Math.floor(Math.random() * 45) + 5; // 5-50 minutes late
        }
        
        // 20% chance of overtime (9-12 hours of work)
        if (random > 0.8) {
          totalWorkMinutes = 480 + Math.floor(Math.random() * 180) + 60; // 540-720 minutes
        }
        
        // 10% chance of missed punch
        if (random > 0.9) {
          hasMissedPunch = true;
        }
        
        // Create clock-in time (8:00 AM + late minutes)
        const clockIn = new Date(date);
        clockIn.setHours(8, lateMinutes, 0, 0);
        
        // Create clock-out time
        const clockOut = new Date(clockIn);
        clockOut.setMinutes(clockOut.getMinutes() + totalWorkMinutes);
        
        const record = {
          employeeId: new ObjectId(emp.id),
          date: date,
          punches: [
            { type: 'CLOCK_IN', time: clockIn },
            { type: 'CLOCK_OUT', time: clockOut }
          ],
          totalWorkMinutes,
          hasMissedPunch,
          isLate,
          lateMinutes,
          exceptionIds: [],
          finalisedForPayroll: true,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        attendanceRecords.push(record);
      }
    }
    
    // Insert attendance records
    if (attendanceRecords.length > 0) {
      // Delete old seeded records (keep today's clock-in/out)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      await attendanceCol.deleteMany({ date: { $lt: today } });
      
      const result = await attendanceCol.insertMany(attendanceRecords);
      console.log(`Inserted ${result.insertedCount} attendance records`);
    }
    
    // Create exceptions for some records with issues
    const recordsWithIssues = await attendanceCol.find({
      $or: [{ isLate: true }, { hasMissedPunch: true }]
    }).limit(20).toArray();
    
    for (const record of recordsWithIssues) {
      const exceptionType = record.hasMissedPunch ? 'MISSED_PUNCH' : 'LATE_ARRIVAL';
      const status = Math.random() > 0.5 ? 'OPEN' : 'RESOLVED';
      
      const exception = {
        employeeId: record.employeeId,
        type: exceptionType,
        attendanceRecordId: record._id,
        assignedTo: new ObjectId('6938bdfcc3927a84f5e3d67e'), // Fatima HR Manager
        status: status,
        reason: exceptionType === 'LATE_ARRIVAL' ? 'Traffic delay' : 'Forgot to clock out',
        createdAt: new Date(record.date),
        updatedAt: new Date()
      };
      
      exceptions.push(exception);
    }
    
    // Insert exceptions
    if (exceptions.length > 0) {
      await exceptionsCol.deleteMany({});
      const result = await exceptionsCol.insertMany(exceptions);
      console.log(`Inserted ${result.insertedCount} time exceptions`);
    }
    
    // Summary
    const lateCount = await attendanceCol.countDocuments({ isLate: true });
    const overtimeCount = await attendanceCol.countDocuments({ totalWorkMinutes: { $gt: 480 } });
    const missedPunchCount = await attendanceCol.countDocuments({ hasMissedPunch: true });
    const exceptionsCount = await exceptionsCol.countDocuments();
    
    console.log('\n=== SEEDED DATA SUMMARY ===');
    console.log(`Total Attendance Records: ${attendanceRecords.length}`);
    console.log(`Late Arrivals: ${lateCount}`);
    console.log(`Overtime Records (>8h): ${overtimeCount}`);
    console.log(`Missed Punches: ${missedPunchCount}`);
    console.log(`Time Exceptions: ${exceptionsCount}`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
    console.log('\nDone!');
  }
}

seedData();
