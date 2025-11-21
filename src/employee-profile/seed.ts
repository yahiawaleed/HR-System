import mongoose from 'mongoose';
import { EmployeeProfileSchema } from './models/employee-profile.schema';
import { EmployeeStatus, ContractType, WorkType, Gender, MaritalStatus } from './enums/employee-profile.enums';

export async function seedEmployeeProfile(connection: mongoose.Connection, departments: any, positions: any) {
  const EmployeeProfileModel = connection.model('EmployeeProfile', EmployeeProfileSchema);

  console.log('Clearing Employee Profiles...');
  await EmployeeProfileModel.deleteMany({});

  console.log('Seeding Employees...');
  const alice = await EmployeeProfileModel.create({
    firstName: 'Alice',
    lastName: 'Smith',
    fullName: 'Alice Smith',
    nationalId: 'NAT-ALICE-001',
    employeeNumber: 'EMP-001',
    dateOfHire: new Date('2020-01-01'),
    workEmail: 'alice@company.com',
    status: EmployeeStatus.ACTIVE,
    contractType: ContractType.FULL_TIME_CONTRACT,
    workType: WorkType.FULL_TIME,
    gender: Gender.FEMALE,
    maritalStatus: MaritalStatus.SINGLE,
    primaryPositionId: positions.hrManagerPos._id,
    primaryDepartmentId: departments.hrDept._id,
  });

  const bob = await EmployeeProfileModel.create({
    firstName: 'Bob',
    lastName: 'Jones',
    fullName: 'Bob Jones',
    nationalId: 'NAT-BOB-002',
    employeeNumber: 'EMP-002',
    dateOfHire: new Date('2021-05-15'),
    workEmail: 'bob@company.com',
    status: EmployeeStatus.ACTIVE,
    contractType: ContractType.FULL_TIME_CONTRACT,
    workType: WorkType.FULL_TIME,
    gender: Gender.MALE,
    maritalStatus: MaritalStatus.MARRIED,
    primaryPositionId: positions.softwareEngPos._id,
    primaryDepartmentId: departments.engDept._id,
  });

  const charlie = await EmployeeProfileModel.create({
    firstName: 'Charlie',
    lastName: 'Brown',
    fullName: 'Charlie Brown',
    nationalId: 'NAT-CHARLIE-003',
    employeeNumber: 'EMP-003',
    dateOfHire: new Date('2022-03-10'),
    workEmail: 'charlie@company.com',
    status: EmployeeStatus.ACTIVE,
    contractType: ContractType.PART_TIME_CONTRACT,
    workType: WorkType.PART_TIME,
    gender: Gender.MALE,
    maritalStatus: MaritalStatus.SINGLE,
    primaryPositionId: positions.salesRepPos._id,
    primaryDepartmentId: departments.salesDept._id,
  });
  console.log('Employees seeded.');

  return { alice, bob, charlie };
}
