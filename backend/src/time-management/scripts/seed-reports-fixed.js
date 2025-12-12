const { MongoClient, ObjectId } = require('mongodb');

async function seedReportData() {
  const client = new MongoClient('mongodb://localhost:27017');
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db('hr-system');
    
    // Get ACTUAL employees from the database (note: collection name has underscore)
    const employees = await db.collection('employee_profiles').find({}).toArray();
    console.log(`Found ${employees.length} employees in the database`);
    
    if (employees.length === 0) {
      console.log('ERROR: No employees found! Please seed employees first.');
      return;
    }
    
    // Show the employees we'll use
    console.log('Employees:');
    employees.forEach(e => console.log(`  ${e._id} - ${e.fullName}`));
    
    // Delete old test data (from my previous seed attempts)
    await db.collection('attendancerecords').deleteMany({});
    await db.collection('timeexceptions').deleteMany({});
    console.log('\nCleared old attendance and time exception data');
    
    // Generate attendance records for the past 30 days
    const attendanceRecords = [];
    const today = new Date();
    
    for (let dayOffset = 0; dayOffset < 30; dayOffset++) {
      const date = new Date(today);
      date.setDate(date.getDate() - dayOffset);
      date.setHours(0, 0, 0, 0);
      
      // Skip weekends
      if (date.getDay() === 0 || date.getDay() === 6) continue;
      
      for (const employee of employees) {
        const employeeId = employee._id;
        
        // Randomize attendance patterns
        const rand = Math.random();
        
        // Standard work times
        const scheduledCheckIn = new Date(date);
        scheduledCheckIn.setHours(9, 0, 0, 0);
        
        const scheduledCheckOut = new Date(date);
        scheduledCheckOut.setHours(17, 0, 0, 0);
        
        // Calculate actual times with some variation
        const actualCheckIn = new Date(scheduledCheckIn);
        const actualCheckOut = new Date(scheduledCheckOut);
        
        let lateMinutes = 0;
        let earlyDepartureMinutes = 0;
        let overtimeMinutes = 0;
        let isLate = false;
        let isEarlyDeparture = false;
        let isMissedPunch = false;
        
        // 30% chance of being late
        if (rand < 0.30) {
          lateMinutes = Math.floor(Math.random() * 60) + 5; // 5-65 minutes late
          actualCheckIn.setMinutes(actualCheckIn.getMinutes() + lateMinutes);
          isLate = true;
        } else if (rand < 0.35) {
          // 5% chance of early arrival
          actualCheckIn.setMinutes(actualCheckIn.getMinutes() - 15);
        }
        
        // 25% chance of overtime
        if (rand > 0.75) {
          overtimeMinutes = Math.floor(Math.random() * 120) + 30; // 30-150 minutes OT
          actualCheckOut.setMinutes(actualCheckOut.getMinutes() + overtimeMinutes);
        }
        
        // 10% chance of early departure
        if (rand > 0.45 && rand < 0.55) {
          earlyDepartureMinutes = Math.floor(Math.random() * 30) + 10; // 10-40 minutes early
          actualCheckOut.setMinutes(actualCheckOut.getMinutes() - earlyDepartureMinutes);
          isEarlyDeparture = true;
        }
        
        // 10% chance of missed punch
        if (rand > 0.40 && rand < 0.50) {
          isMissedPunch = true;
        }
        
        // Calculate worked minutes
        const workedMinutes = Math.floor((actualCheckOut - actualCheckIn) / 60000);
        
        attendanceRecords.push({
          employeeId: new ObjectId(employeeId),
          date: date,
          checkInTime: actualCheckIn,
          checkOutTime: isMissedPunch ? null : actualCheckOut,
          scheduledCheckIn: scheduledCheckIn,
          scheduledCheckOut: scheduledCheckOut,
          workedMinutes: isMissedPunch ? 0 : workedMinutes,
          lateMinutes: lateMinutes,
          earlyDepartureMinutes: earlyDepartureMinutes,
          overtimeMinutes: overtimeMinutes,
          isLate: isLate,
          isEarlyDeparture: isEarlyDeparture,
          isMissedPunch: isMissedPunch,
          status: isMissedPunch ? 'INCOMPLETE' : 'COMPLETE',
          source: 'SEED_DATA',
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
    }
    
    // Insert attendance records
    if (attendanceRecords.length > 0) {
      const result = await db.collection('attendancerecords').insertMany(attendanceRecords);
      console.log(`\nInserted ${result.insertedCount} attendance records`);
    }
    
    // Generate time exceptions
    const exceptionTypes = ['OVERTIME_REQUEST', 'LEAVE_EARLY', 'COME_LATE', 'WORK_FROM_HOME', 'MISSED_PUNCH'];
    const exceptionStatuses = ['PENDING', 'APPROVED', 'REJECTED'];
    const timeExceptions = [];
    
    for (let i = 0; i < 20; i++) {
      const employee = employees[Math.floor(Math.random() * employees.length)];
      const date = new Date(today);
      date.setDate(date.getDate() - Math.floor(Math.random() * 14));
      
      timeExceptions.push({
        employeeId: new ObjectId(employee._id),
        date: date,
        exceptionType: exceptionTypes[Math.floor(Math.random() * exceptionTypes.length)],
        status: exceptionStatuses[Math.floor(Math.random() * exceptionStatuses.length)],
        reason: 'Test exception for report generation',
        requestedAt: date,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
    
    if (timeExceptions.length > 0) {
      const result = await db.collection('timeexceptions').insertMany(timeExceptions);
      console.log(`Inserted ${result.insertedCount} time exceptions`);
    }
    
    // Summary
    const lateCount = await db.collection('attendancerecords').countDocuments({ isLate: true });
    const overtimeCount = await db.collection('attendancerecords').countDocuments({ overtimeMinutes: { $gt: 0 } });
    const missedCount = await db.collection('attendancerecords').countDocuments({ isMissedPunch: true });
    const exceptionsCount = await db.collection('timeexceptions').countDocuments({});
    
    console.log('\n=== Summary ===');
    console.log(`Total attendance records: ${attendanceRecords.length}`);
    console.log(`Late arrivals: ${lateCount}`);
    console.log(`Overtime records: ${overtimeCount}`);
    console.log(`Missed punches: ${missedCount}`);
    console.log(`Time exceptions: ${exceptionsCount}`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
    console.log('\nDisconnected from MongoDB');
  }
}

seedReportData();
