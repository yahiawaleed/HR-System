import { Schema, Prop, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";
import { ShiftTypeCategory } from "./enums";

export type ShiftTypeDocument = HydratedDocument<ShiftType>;

// Split part definition for SPLIT shift types
export class SplitPart {
    @Prop({ required: true })
    startTime: string; // HH:mm format

    @Prop({ required: true })
    endTime: string; // HH:mm format
}

@Schema({ timestamps: true })
export class ShiftType {
    @Prop({ required: true, unique: true })
    code: string; // Unique shift code e.g., "DAY-001", "NIGHT-002"

    @Prop({ required: true })
    name: string; // Display name

    @Prop({ type: String, enum: ShiftTypeCategory, default: ShiftTypeCategory.NORMAL })
    category: ShiftTypeCategory; // NORMAL, SPLIT, OVERNIGHT, ROTATIONAL, FLEXIBLE

    @Prop()
    startTime?: string; // HH:mm format - primary start time

    @Prop()
    endTime?: string; // HH:mm format - primary end time

    @Prop({ default: 0 })
    totalDurationMinutes: number; // Total work duration in minutes

    @Prop({ default: 0 })
    breakDurationMinutes: number; // Total break time in minutes

    @Prop({ type: [{ startTime: String, endTime: String }], default: [] })
    splitParts: SplitPart[]; // For SPLIT shifts - array of work periods

    @Prop({ default: false })
    isNightShift: boolean; // Flag for night differential calculations

    @Prop({ default: false })
    isWeekendShift: boolean; // Flag for weekend premium calculations

    @Prop({ default: 0 })
    graceMinutesIn: number; // Grace period for late arrival

    @Prop({ default: 0 })
    graceMinutesOut: number; // Grace period for early departure

    @Prop()
    description?: string; // Optional description

    @Prop({ default: true })
    active: boolean;
}

export const ShiftTypeSchema = SchemaFactory.createForClass(ShiftType);
