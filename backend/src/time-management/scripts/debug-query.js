const { MongoClient } = require('mongodb');

async function debugQuery() {
  const client = new MongoClient('mongodb://localhost:27017');
  await client.connect();
  const db = client.db('hr-system');
  
  // Check what data looks like
  const sample = await db.collection('attendancerecords').findOne({ isLate: true });
  console.log('Sample late attendance record:');
  console.log(JSON.stringify(sample, null, 2));
  
  // Check date range
  const startDate = new Date('2025-11-01');
  const endDate = new Date('2025-12-31');
  
  console.log('\nQuery dates:');
  console.log('  Start:', startDate);
  console.log('  End:', endDate);
  
  // Try the exact same query that the service uses
  const query = {
    date: {
      $gte: startDate,
      $lte: endDate
    },
    isLate: true
  };
  
  const count = await db.collection('attendancerecords').countDocuments(query);
  console.log('\nMongoClient query result count:', count);
  
  // Check sample date from record
  if (sample && sample.date) {
    console.log('\nSample record date:', sample.date);
    console.log('  Type:', typeof sample.date);
    console.log('  Is between?', sample.date >= startDate && sample.date <= endDate);
  }
  
  await client.close();
}

debugQuery();
