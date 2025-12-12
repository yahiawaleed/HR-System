import { Schema, SchemaFactory, Prop } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type LatenessRuleDocument = HydratedDocument<LatenessRule>;

@Schema({ timestamps: true })
export class LatenessRule {
    @Prop({ required: true, unique: true })
    code: string; // Unique rule code

    @Prop({ required: true })
    name: string;

    @Prop()
    description?: string;

    @Prop({ default: 0 })
    gracePeriodMinutes: number; // Minutes allowed before marking as late

    @Prop({ default: 0 })
    deductionPerMinute: number; // Amount/percentage deducted per minute late

    @Prop({ default: false })
    isPercentage: boolean; // Whether deduction is percentage-based

    @Prop({ default: 0 })
    maxDeductionMinutes: number; // Maximum minutes to deduct for (0 = unlimited)

    @Prop({ default: 3 })
    warningThreshold: number; // Number of late arrivals before warning

    @Prop({ default: 5 })
    escalationThreshold: number; // Number of late arrivals before escalation

    @Prop({ default: 7 })
    periodDays: number; // Number of days to count for threshold (rolling window)

    @Prop({ default: false })
    autoDeduct: boolean; // Whether to auto-deduct from payroll

    @Prop({ default: true })
    active: boolean;
}

export const latenessRuleSchema = SchemaFactory.createForClass(LatenessRule);
