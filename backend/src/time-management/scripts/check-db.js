const { MongoClient } = require('mongodb');

async function check() {
  const client = new MongoClient('mongodb://localhost:27017');
  await client.connect();
  const db = client.db('hr-system');
  
  const count = await db.collection('attendancerecords').countDocuments();
  console.log('Total attendance records:', count);
  
  const lateCount = await db.collection('attendancerecords').countDocuments({ isLate: true });
  console.log('Late records:', lateCount);
  
  const otCount = await db.collection('attendancerecords').countDocuments({ totalWorkMinutes: { $gt: 480 } });
  console.log('Overtime records (>480 min):', otCount);
  
  const excCount = await db.collection('timeexceptions').countDocuments();
  console.log('Time exceptions:', excCount);
  
  console.log('\nSample late records:');
  const sample = await db.collection('attendancerecords').find({ isLate: true }).limit(3).toArray();
  sample.forEach(r => console.log('  Date:', r.date, '| Late mins:', r.lateMinutes, '| Work:', r.totalWorkMinutes));
  
  await client.close();
}

check();
