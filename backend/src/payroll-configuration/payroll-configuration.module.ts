import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PayrollConfigService } from './services/payroll-config.service';
import { PayrollConfigController } from './controllers/payroll-config.controller';
import { PayGradeSchema } from './schemas/pay-grade.schema';
import { AllowanceSchema } from './schemas/allowance.schema';
import { DeductionSchema } from './schemas/deduction.schema';
import { TaxRuleSchema } from './schemas/tax-rule.schema';
import { InsuranceRuleSchema } from './schemas/insurance-rule.schema';
import { SigningBonusSchema } from './schemas/signing-bonus.schema';
import { TerminationBenefitSchema } from './schemas/termination-benefit.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'PayGrade', schema: PayGradeSchema },
      { name: 'Allowance', schema: AllowanceSchema },
      { name: 'Deduction', schema: DeductionSchema },
      { name: 'TaxRule', schema: TaxRuleSchema },
      { name: 'InsuranceRule', schema: InsuranceRuleSchema },
      { name: 'SigningBonus', schema: SigningBonusSchema },
      { name: 'TerminationBenefit', schema: TerminationBenefitSchema },
    ]),
  ],
  controllers: [PayrollConfigController],
  providers: [PayrollConfigService],
  exports: [PayrollConfigService],
})
export class PayrollConfigurationModule {}

