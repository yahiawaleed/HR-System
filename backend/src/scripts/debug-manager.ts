
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { PerformanceService } from '../performance/performance.service';
import { getModelToken } from '@nestjs/mongoose';
import { EmployeeProfile } from '../employee-profile/models/employee-profile.schema';
import { AppraisalAssignment } from '../performance/models/appraisal-assignment.schema';

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule);

    const employeeModel = app.get(getModelToken(EmployeeProfile.name));
    const assignmentModel = app.get(getModelToken(AppraisalAssignment.name));

    console.log('--- Debugging Manager Appraisals ---');

    // 1. Find Ahmed Mohsen (Case Insensitive)
    const ahmed = await employeeModel.findOne({
        $or: [
            { firstName: { $regex: new RegExp('^Ahmed$', 'i') }, lastName: { $regex: new RegExp('^Mohsen$', 'i') } },
            { fullName: { $regex: new RegExp('^Ahmed Mohsen$', 'i') } }
        ]
    }).exec();

    if (!ahmed) {
        console.error('ERROR: Could not find employee "Ahmed Mohsen"');
        const allEmps = await employeeModel.find({}).select('firstName lastName fullName').exec();
        console.log('Available Employees:', allEmps.map(e => `${e.firstName} ${e.lastName}`));
        return;
    }

    console.log(`Found Manager: ${ahmed.firstName} ${ahmed.lastName}, ID: ${ahmed._id}`);

    // 2. Find Assignments for this Manager
    const assignments = await assignmentModel.find({ managerProfileId: ahmed._id }).exec();
    console.log(`Found ${assignments.length} assignments for Manager ID ${ahmed._id}`);

    if (assignments.length === 0) {
        console.log('--- All Assignments ---');
        const allAssignments = await assignmentModel.find().populate('managerProfileId').exec();
        allAssignments.forEach(a => {
            const mgr: any = a.managerProfileId; // populated
            console.log(`Assignment ${a._id}: Assigned to Manager ${mgr?.firstName} ${mgr?.lastName} (ID: ${mgr?._id})`);
        });
    } else {
        assignments.forEach(a => {
            console.log(`- Assignment ${a._id}: Status ${a.status}`);
        });
    }

    await app.close();
}

bootstrap();
