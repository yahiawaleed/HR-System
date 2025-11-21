import mongoose from 'mongoose';
import { payGradeSchema } from './models/payGrades.schema';
import { allowanceSchema } from './models/allowance.schema';
import { payrollPolicies } from './models/payrollPolicies.schema';
import { CompanyWideSettingsSchema } from './models/CompanyWideSettings.schema';
import { insuranceBracketsSchema } from './models/insuranceBrackets.schema';
import { payTypeSchema } from './models/payType.schema';
import { signingBonusSchema } from './models/signingBonus.schema';
import { taxRulesSchema } from './models/taxRules.schema';
import { terminationAndResignationBenefitsSchema } from './models/terminationAndResignationBenefits';
import { SchemaFactory } from '@nestjs/mongoose';
import { ConfigStatus, PolicyType, Applicability } from './enums/payroll-configuration-enums';

// Need to manually create schema for payrollPolicies since it's exported as class
const payrollPoliciesSchema = SchemaFactory.createForClass(payrollPolicies);

export async function seedPayrollConfiguration(connection: mongoose.Connection, employees: any) {
  const PayGradeModel = connection.model('payGrade', payGradeSchema);
  const AllowanceModel = connection.model('allowance', allowanceSchema);
  const PayrollPoliciesModel = connection.model('payrollPolicies', payrollPoliciesSchema);
  const CompanyWideSettingsModel = connection.model('CompanyWideSettings', CompanyWideSettingsSchema);
  const InsuranceBracketsModel = connection.model('insuranceBrackets', insuranceBracketsSchema);
  const PayTypeModel = connection.model('payType', payTypeSchema);
  const SigningBonusModel = connection.model('signingBonus', signingBonusSchema);
  const TaxRulesModel = connection.model('taxRules', taxRulesSchema);
  const TerminationBenefitsModel = connection.model('terminationAndResignationBenefits', terminationAndResignationBenefitsSchema);

  console.log('Clearing Payroll Configuration...');
  await PayGradeModel.deleteMany({});
  await AllowanceModel.deleteMany({});
  await PayrollPoliciesModel.deleteMany({});
  await CompanyWideSettingsModel.deleteMany({});
  await InsuranceBracketsModel.deleteMany({});
  await PayTypeModel.deleteMany({});
  await SigningBonusModel.deleteMany({});
  await TaxRulesModel.deleteMany({});
  await TerminationBenefitsModel.deleteMany({});

  console.log('Seeding Company Wide Settings...');
  await CompanyWideSettingsModel.create({
    payDate: new Date(),
    timeZone: 'Africa/Cairo',
    currency: 'EGP',
  });

  console.log('Seeding Pay Grades...');
  const juniorGrade = await PayGradeModel.create({
    grade: 'Junior',
    baseSalary: 8000,
    grossSalary: 10000,
    status: ConfigStatus.APPROVED,
    createdBy: employees.alice._id,
    approvedBy: employees.alice._id,
    approvedAt: new Date(),
  });

  const seniorGrade = await PayGradeModel.create({
    grade: 'Senior',
    baseSalary: 15000,
    grossSalary: 20000,
    status: ConfigStatus.APPROVED,
    createdBy: employees.alice._id,
    approvedBy: employees.alice._id,
    approvedAt: new Date(),
  });
  console.log('Pay Grades seeded.');

  console.log('Seeding Allowances...');
  const housingAllowance = await AllowanceModel.create({
    name: 'Housing Allowance',
    amount: 2000,
    status: ConfigStatus.APPROVED,
    createdBy: employees.alice._id,
    approvedBy: employees.alice._id,
    approvedAt: new Date(),
  });

  const transportAllowance = await AllowanceModel.create({
    name: 'Transport Allowance',
    amount: 1000,
    status: ConfigStatus.APPROVED,
    createdBy: employees.alice._id,
    approvedBy: employees.alice._id,
    approvedAt: new Date(),
  });
  console.log('Allowances seeded.');

  console.log('Seeding Insurance Brackets...');
  const socialInsurance = await InsuranceBracketsModel.create({
    name: 'Social Insurance',
    amount: 500,
    status: ConfigStatus.APPROVED,
    minSalary: 2000,
    maxSalary: 10000,
    employeeRate: 11,
    employerRate: 18.75,
    createdBy: employees.alice._id,
    approvedBy: employees.alice._id,
    approvedAt: new Date(),
  });
  console.log('Insurance Brackets seeded.');

  console.log('Seeding Pay Types...');
  const monthlyPayType = await PayTypeModel.create({
    type: 'Monthly Salary',
    amount: 6000, // Minimum allowed value
    status: ConfigStatus.APPROVED,
    createdBy: employees.alice._id,
    approvedBy: employees.alice._id,
    approvedAt: new Date(),
  });
  console.log('Pay Types seeded.');

  console.log('Seeding Signing Bonuses...');
  const seniorSigningBonus = await SigningBonusModel.create({
    positionName: 'Senior Developer',
    amount: 5000,
    status: ConfigStatus.APPROVED,
    createdBy: employees.alice._id,
    approvedBy: employees.alice._id,
    approvedAt: new Date(),
  });
  console.log('Signing Bonuses seeded.');

  console.log('Seeding Tax Rules...');
  const standardTax = await TaxRulesModel.create({
    name: 'Standard Income Tax',
    description: 'Standard income tax deduction',
    rate: 10,
    status: ConfigStatus.APPROVED,
    createdBy: employees.alice._id,
    approvedBy: employees.alice._id,
    approvedAt: new Date(),
  });
  console.log('Tax Rules seeded.');

  console.log('Seeding Termination Benefits...');
  const endOfService = await TerminationBenefitsModel.create({
    name: 'End of Service Gratuity',
    amount: 10000,
    terms: 'After 1 year of service',
    status: ConfigStatus.APPROVED,
    createdBy: employees.alice._id,
    approvedBy: employees.alice._id,
    approvedAt: new Date(),
  });
  console.log('Termination Benefits seeded.');

  console.log('Seeding Payroll Policies...');
  const taxPolicy = await PayrollPoliciesModel.create({
    policyName: 'Standard Tax Policy',
    policyType: PolicyType.DEDUCTION,
    description: 'Applies standard tax rules',
    effectiveDate: new Date('2025-01-01'),
    ruleDefinition: {
      percentage: 10,
      fixedAmount: 0,
      thresholdAmount: 5000,
    },
    applicability: Applicability.AllEmployees,
    status: ConfigStatus.APPROVED,
    createdBy: employees.alice._id,
    approvedBy: employees.alice._id,
    approvedAt: new Date(),
  });
  console.log('Payroll Policies seeded.');

  return {
    payGrades: { juniorGrade, seniorGrade },
    allowances: { housingAllowance, transportAllowance },
    policies: { taxPolicy },
    insurance: { socialInsurance },
    payTypes: { monthlyPayType },
    bonuses: { seniorSigningBonus },
    taxes: { standardTax },
    benefits: { endOfService }
  };
}
