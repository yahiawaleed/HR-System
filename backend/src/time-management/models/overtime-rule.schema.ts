import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type OvertimeRuleDocument = HydratedDocument<OvertimeRule>;

@Schema({ timestamps: true })
export class OvertimeRule {
    @Prop({ required: true, unique: true })
    code: string; // Unique rule code

    @Prop({ required: true })
    name: string;

    @Prop()
    description?: string;

    @Prop({ default: 480 })
    minMinutesBeforeOvertime: number; // Minutes worked before overtime kicks in (default 8 hours)

    @Prop({ default: 1.5 })
    weekdayMultiplier: number; // Overtime multiplier for weekdays (e.g., 1.5x)

    @Prop({ default: 2.0 })
    weekendMultiplier: number; // Overtime multiplier for weekends

    @Prop({ default: 2.5 })
    holidayMultiplier: number; // Overtime multiplier for holidays

    @Prop({ default: 1.25 })
    nightShiftMultiplier: number; // Additional multiplier for night shifts

    @Prop({ default: 0 })
    maxOvertimeMinutesPerDay: number; // Maximum OT per day (0 = unlimited)

    @Prop({ default: 0 })
    maxOvertimeMinutesPerWeek: number; // Maximum OT per week (0 = unlimited)

    @Prop({ default: 0 })
    maxOvertimeMinutesPerMonth: number; // Maximum OT per month (0 = unlimited)

    @Prop({ default: false })
    requiresPreApproval: boolean; // Whether overtime requires pre-approval

    @Prop({ default: true })
    active: boolean;

    @Prop({ default: false })
    approved: boolean; // Whether rule is approved for use
}

export const OvertimeRuleSchema = SchemaFactory.createForClass(OvertimeRule);
