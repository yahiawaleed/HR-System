const { MongoClient } = require('mongodb');

async function check() {
  const client = new MongoClient('mongodb://localhost:27017');
  await client.connect();
  const db = client.db('hr-system');
  
  // Check date range
  const startDate = new Date('2025-11-01');
  const endDate = new Date('2025-12-31');
  
  console.log('Query dates:');
  console.log('  Start:', startDate);
  console.log('  End:', endDate);
  
  // Get all records with dates
  const allRecords = await db.collection('attendancerecords').find({}).toArray();
  console.log('\nAll records count:', allRecords.length);
  
  // Check date range
  const inRange = allRecords.filter(r => {
    const d = new Date(r.date);
    return d >= startDate && d <= endDate;
  });
  console.log('In range (Nov-Dec 2025):', inRange.length);
  
  // Show some dates
  console.log('\nSample record dates:');
  allRecords.slice(0, 5).forEach(r => {
    console.log('  ', r.date, '| isLate:', r.isLate, '| work:', r.totalWorkMinutes);
  });
  
  // Query with MongoDB date operators
  const mongoQuery = await db.collection('attendancerecords').find({
    date: {
      $gte: startDate,
      $lte: endDate
    }
  }).toArray();
  console.log('\nMongoDB query result count:', mongoQuery.length);
  
  // Show late records specifically
  const lateRecords = await db.collection('attendancerecords').find({ isLate: true }).toArray();
  console.log('\nLate records:', lateRecords.length);
  if (lateRecords.length > 0) {
    console.log('First late record date:', lateRecords[0].date);
  }
  
  await client.close();
}

check();
