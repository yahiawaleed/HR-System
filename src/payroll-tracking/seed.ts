import mongoose from 'mongoose';
import { claimsSchema } from './models/claims.schema';
import { disputesSchema } from './models/disputes.schema';
import { refundsSchema } from './models/refunds.schema';
import { ClaimStatus, RefundStatus } from './enums/payroll-tracking-enum';

export async function seedPayrollTracking(connection: mongoose.Connection, employees: any) {
  const ClaimsModel = connection.model('claims', claimsSchema);
  const DisputesModel = connection.model('disputes', disputesSchema);
  const RefundsModel = connection.model('refunds', refundsSchema);

  console.log('Clearing Payroll Tracking...');
  await ClaimsModel.deleteMany({});
  await DisputesModel.deleteMany({});
  await RefundsModel.deleteMany({});

  console.log('Seeding Claims...');
  const medicalClaim = await ClaimsModel.create({
    claimId: 'CLAIM-001',
    description: 'Medical reimbursement for dental checkup',
    claimType: 'Medical',
    employeeId: employees.bob._id,
    amount: 500,
    status: ClaimStatus.UNDER_REVIEW,
  });
  console.log('Claims seeded.');

  console.log('Seeding Disputes...');
  // Note: Disputes usually require a payslipId, but we haven't seeded payslips yet in this simplified flow.
  // We'll skip creating a dispute linked to a payslip or create a dummy one if needed, 
  // but for now let's assume we can create one without a valid payslip ID or create a dummy ID if validation allows.
  // Looking at schema: payslipId is required. 
  // We will skip disputes for now to avoid foreign key errors unless we seed payslips first.
  console.log('Skipping Disputes (requires Payslip).');

  console.log('Seeding Refunds...');
  await RefundsModel.create({
    claimId: medicalClaim._id,
    refundDetails: {
      description: 'Approved Medical Claim',
      amount: 500
    },
    employeeId: employees.bob._id,
    financeStaffId: employees.alice._id,
    status: RefundStatus.PENDING
  });
  console.log('Refunds seeded.');

  return { medicalClaim };
}
