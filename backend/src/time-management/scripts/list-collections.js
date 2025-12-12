const { MongoClient } = require('mongodb');

async function checkDB() {
  const client = new MongoClient('mongodb://localhost:27017');
  await client.connect();
  const db = client.db('hr-system');
  
  const cols = await db.listCollections().toArray();
  console.log('Collections in hr-system:');
  for (const col of cols) {
    const count = await db.collection(col.name).countDocuments();
    console.log(`  ${col.name}: ${count} documents`);
  }
  
  await client.close();
}

checkDB();
