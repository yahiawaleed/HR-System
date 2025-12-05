import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Document } from 'mongoose';

export interface PayGrade extends Document {
  [key: string]: any;
}

export interface Allowance extends Document {
  [key: string]: any;
}

export interface Deduction extends Document {
  [key: string]: any;
}

export interface TaxRule extends Document {
  [key: string]: any;
}

export interface InsuranceRule extends Document {
  [key: string]: any;
}

@Injectable()
export class PayrollConfigService {
  constructor(
    @InjectModel('PayGrade') private payGradeModel: Model<PayGrade>,
    @InjectModel('Allowance') private allowanceModel: Model<Allowance>,
    @InjectModel('Deduction') private deductionModel: Model<Deduction>,
    @InjectModel('TaxRule') private taxRuleModel: Model<TaxRule>,
    @InjectModel('InsuranceRule') private insuranceRuleModel: Model<InsuranceRule>,
  ) {}

  // Pay Grade methods
  async createPayGrade(payGradeData: any): Promise<PayGrade> {
    const payGrade = new this.payGradeModel(payGradeData);
    return payGrade.save();
  }

  async findAllPayGrades(): Promise<PayGrade[]> {
    return this.payGradeModel.find({ isActive: true }).exec();
  }

  // Allowance methods
  async createAllowance(allowanceData: any): Promise<Allowance> {
    const allowance = new this.allowanceModel(allowanceData);
    return allowance.save();
  }

  async findAllAllowances(): Promise<Allowance[]> {
    return this.allowanceModel.find({ isActive: true }).exec();
  }

  // Deduction methods
  async createDeduction(deductionData: any): Promise<Deduction> {
    const deduction = new this.deductionModel(deductionData);
    return deduction.save();
  }

  async findAllDeductions(): Promise<Deduction[]> {
    return this.deductionModel.find({ isActive: true }).exec();
  }

  // Tax Rule methods
  async createTaxRule(taxRuleData: any, userId: string): Promise<TaxRule> {
    const taxRule = new this.taxRuleModel({
      ...taxRuleData,
      createdBy: userId,
    });
    return taxRule.save();
  }

  async findAllTaxRules(): Promise<TaxRule[]> {
    return this.taxRuleModel.find({ isActive: true }).exec();
  }

  // Insurance Rule methods
  async createInsuranceRule(insuranceRuleData: any): Promise<InsuranceRule> {
    const insuranceRule = new this.insuranceRuleModel(insuranceRuleData);
    return insuranceRule.save();
  }

  async findAllInsuranceRules(): Promise<InsuranceRule[]> {
    return this.insuranceRuleModel.find({ isActive: true }).exec();
  }
}

