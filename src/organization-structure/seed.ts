import mongoose from 'mongoose';
import { DepartmentSchema } from './models/department.schema';
import { PositionSchema } from './models/position.schema';
import { PositionAssignmentSchema } from './models/position-assignment.schema';

export async function seedOrganizationStructure(connection: mongoose.Connection) {
  const DepartmentModel = connection.model('Department', DepartmentSchema);
  const PositionModel = connection.model('Position', PositionSchema);

  console.log('Clearing Organization Structure data...');
  await DepartmentModel.deleteMany({});
  await PositionModel.deleteMany({});
  
  // 1. Create Departments
  console.log('Seeding Departments...');
  const hrDept = await DepartmentModel.create({
    code: 'HR-001',
    name: 'Human Resources',
    description: 'Handles all HR related tasks',
    isActive: true,
  });

  const engDept = await DepartmentModel.create({
    code: 'ENG-001',
    name: 'Engineering',
    description: 'Software Development and Engineering',
    isActive: true,
  });

  const salesDept = await DepartmentModel.create({
    code: 'SALES-001',
    name: 'Sales',
    description: 'Sales and Marketing',
    isActive: true,
  });
  console.log('Departments seeded.');

  // 2. Create Positions
  console.log('Seeding Positions...');
  const hrManagerPos = await PositionModel.create({
    code: 'POS-HR-MGR',
    title: 'HR Manager',
    description: 'Manager of Human Resources',
    departmentId: hrDept._id,
    isActive: true,
  });

  const softwareEngPos = await PositionModel.create({
    code: 'POS-SWE',
    title: 'Software Engineer',
    description: 'Full Stack Developer',
    departmentId: engDept._id,
    isActive: true,
  });

  const salesRepPos = await PositionModel.create({
    code: 'POS-SALES-REP',
    title: 'Sales Representative',
    description: 'Sales Representative',
    departmentId: salesDept._id,
    isActive: true,
  });
  console.log('Positions seeded.');

  return {
    departments: { hrDept, engDept, salesDept },
    positions: { hrManagerPos, softwareEngPos, salesRepPos },
  };
}

export async function seedPositionAssignments(connection: mongoose.Connection, employees: any, positions: any, departments: any) {
  const PositionAssignmentModel = connection.model('PositionAssignment', PositionAssignmentSchema);
  
  console.log('Clearing Position Assignments...');
  await PositionAssignmentModel.deleteMany({});

  console.log('Seeding Position Assignments...');
  await PositionAssignmentModel.create({
    employeeProfileId: employees.alice._id,
    positionId: positions.hrManagerPos._id,
    departmentId: departments.hrDept._id,
    startDate: new Date('2020-01-01'),
  });

  await PositionAssignmentModel.create({
    employeeProfileId: employees.bob._id,
    positionId: positions.softwareEngPos._id,
    departmentId: departments.engDept._id,
    startDate: new Date('2021-05-15'),
  });

  await PositionAssignmentModel.create({
    employeeProfileId: employees.charlie._id,
    positionId: positions.salesRepPos._id,
    departmentId: departments.salesDept._id,
    startDate: new Date('2022-03-10'),
  });
  console.log('Position Assignments seeded.');
}
