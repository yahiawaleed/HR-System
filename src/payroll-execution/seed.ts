import mongoose from 'mongoose';
import { payrollRuns } from './models/payrollRuns.schema';
import { employeePayrollDetailsSchema } from './models/employeePayrollDetails.schema';
import { employeePenaltiesSchema } from './models/employeePenalties.schema';
import { SchemaFactory } from '@nestjs/mongoose';
import { PayRollStatus, PayRollPaymentStatus, BankStatus } from './enums/payroll-execution-enum';

const payrollRunsSchema = SchemaFactory.createForClass(payrollRuns);

export async function seedPayrollExecution(connection: mongoose.Connection, employees: any) {
  const PayrollRunsModel = connection.model('payrollRuns', payrollRunsSchema);
  const EmployeePayrollDetailsModel = connection.model('employeePayrollDetails', employeePayrollDetailsSchema);
  const EmployeePenaltiesModel = connection.model('employeePenalties', employeePenaltiesSchema);

  console.log('Clearing Payroll Execution...');
  await PayrollRunsModel.deleteMany({});
  await EmployeePayrollDetailsModel.deleteMany({});
  await EmployeePenaltiesModel.deleteMany({});

  console.log('Seeding Payroll Runs...');
  const janRun = await PayrollRunsModel.create({
    runId: 'PR-2025-001',
    payrollPeriod: new Date('2025-01-31'),
    status: PayRollStatus.DRAFT,
    entity: 'Tech Corp',
    employees: 50,
    exceptions: 2,
    totalnetpay: 500000,
    payrollSpecialistId: employees.alice._id,
    paymentStatus: PayRollPaymentStatus.PENDING,
    payrollManagerId: employees.alice._id,
  });
  console.log('Payroll Runs seeded.');

  console.log('Seeding Employee Payroll Details...');
  await EmployeePayrollDetailsModel.create({
    employeeId: employees.bob._id,
    baseSalary: 15000,
    allowances: 3000,
    deductions: 1500,
    netSalary: 16500,
    netPay: 16500,
    bankStatus: BankStatus.VALID,
    payrollRunId: janRun._id,
  });
  console.log('Employee Payroll Details seeded.');

  console.log('Seeding Employee Penalties...');
  await EmployeePenaltiesModel.create({
    employeeId: employees.charlie._id,
    penalties: [
      { reason: 'Late Arrival', amount: 100 }
    ]
  });
  console.log('Employee Penalties seeded.');

  return { janRun };
}
