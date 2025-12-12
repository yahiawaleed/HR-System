const { MongoClient, ObjectId } = require('mongodb');

async function check() {
  const client = new MongoClient('mongodb://localhost:27017');
  await client.connect();
  const db = client.db('hr-system');
  
  // Get a sample attendance record
  const attendance = await db.collection('attendancerecords').findOne({ isLate: true });
  console.log('Sample attendance record:');
  console.log('  Employee ID:', attendance.employeeId);
  console.log('  isLate:', attendance.isLate);
  console.log('  Date:', attendance.date);
  
  // Check if the employee exists
  const employee = await db.collection('employeeprofiles').findOne({ _id: attendance.employeeId });
  console.log('\nEmployee found:', employee ? employee.fullName : 'NOT FOUND');
  
  // Check if there's any mismatch in ObjectId formatting
  console.log('\nAll attendance employeeIds:');
  const allAtt = await db.collection('attendancerecords').find({}).limit(3).toArray();
  allAtt.forEach(a => console.log('  ', a.employeeId, typeof a.employeeId));
  
  // Check employee profiles
  console.log('\nEmployee profile _ids:');
  const emps = await db.collection('employeeprofiles').find({}).limit(3).toArray();
  emps.forEach(e => console.log('  ', e._id, e.fullName));
  
  await client.close();
}

check();
