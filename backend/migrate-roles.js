const { MongoClient } = require('mongodb');

async function migrate() {
    const client = new MongoClient('mongodb://localhost:27017/hr-system');
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db();
    const collection = db.collection('employee_system_roles');

    const mapping = {
        'department employee': 'Department Employee',
        'department head': 'Department Head',
        'hr manager': 'HR Manager',
        'hr employee': 'HR Employee',
        'payroll specialist': 'Payroll Specialist',
        'payroll manager': 'Payroll Manager',
        'system admin': 'System Admin',
        'legal & policy admin': 'Legal & Policy Admin',
        'recruiter': 'Recruiter',
        'finance staff': 'Finance Staff',
        'hr admin': 'HR Admin'
    };

    for (const [oldVal, newVal] of Object.entries(mapping)) {
        const result = await collection.updateMany(
            { roles: oldVal },
            { $set: { "roles.$[elem]": newVal } },
            { arrayFilters: [{ "elem": oldVal }] }
        );
        console.log(`Updated "${oldVal}" to "${newVal}": ${result.modifiedCount} matches`);
    }

    await client.close();
    console.log('Migration finished');
}

migrate().catch(console.error);
