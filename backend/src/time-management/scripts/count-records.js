const { MongoClient } = require('mongodb');

async function test() {
  const client = new MongoClient('mongodb://localhost:27017');
  await client.connect();
  const db = client.db('hr-system');

  console.log('Total attendance records:', await db.collection('attendancerecords').countDocuments({}));
  console.log('Late records (isLate: true):', await db.collection('attendancerecords').countDocuments({ isLate: true }));

  const startDate = new Date('2025-11-01');
  const endDate = new Date('2025-12-31');
  console.log('\nDate range:', startDate, 'to', endDate);
  console.log('Records in date range with isLate: true:', 
    await db.collection('attendancerecords').countDocuments({ 
      date: { $gte: startDate, $lte: endDate }, 
      isLate: true 
    })
  );

  // Check if there might be a discrepancy in how the date is stored
  const sample = await db.collection('attendancerecords').findOne({ isLate: true });
  console.log('\nSample record date:', sample.date);
  console.log('Sample record date type:', typeof sample.date, sample.date instanceof Date);

  // Check collections that exist
  console.log('\n--- Collections in database ---');
  const collections = await db.listCollections().toArray();
  collections.forEach(c => console.log(' ', c.name));

  await client.close();
}

test().catch(console.error);
