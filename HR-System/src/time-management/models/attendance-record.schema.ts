// ============================================
// 🗄️ DATABASE SCHEMA - DEFINES MONGODB COLLECTION STRUCTURE
// ============================================
// This file defines how your data is stored in MongoDB
// Think of it as creating a table structure in traditional databases
// MongoDB will create a collection called "attendancerecords"
// ============================================

import { Schema, SchemaFactory, Prop } from "@nestjs/mongoose";  // NestJS MongoDB decorators
import { Types } from "mongoose";                               // MongoDB data types
import { HydratedDocument } from "mongoose";                    // TypeScript type for documents
import { PunchType } from "./enums/index";

// ============================================
// SUBDOCUMENT TYPE - A nested object within the main document
// ============================================
export type Punch = {
    type: PunchType;    // Enum: 'IN' or 'OUT'
    time: Date;         // When the punch occurred
}

// TypeScript type for type safety when working with this model
export type AttendanceRecordDocument = HydratedDocument<AttendanceRecord>;

// ============================================
// @Schema() - Marks this class as a MongoDB schema
// ============================================
// This decorator tells NestJS to create a MongoDB collection from this class
@Schema()
export class AttendanceRecord{
    // ============================================
    // @Prop() DECORATOR - DEFINES A FIELD IN THE COLLECTION
    // ============================================
    // Each @Prop() creates a field in your MongoDB document
    
    // REFERENCE FIELD - Links to another collection (EmployeeProfile)
    // This is like a foreign key in SQL databases
    @Prop({type: Types.ObjectId, ref: 'EmployeeProfile', required: true})
    employeeId: Types.ObjectId;  // Stores the ID of an employee

    // ARRAY FIELD - Stores multiple Punch objects
    // default: [] means if no value provided, it will be an empty array
    @Prop({default: []})
    punches: Punch[];  // Array of punch in/out records

    // NUMBER FIELD with default value
    @Prop({ default: 0 }) // to be computed after creating an instance
    totalWorkMinutes: number;  // Total minutes worked

    // BOOLEAN FIELD with default value
    @Prop({ default: false }) // to be computed after creating an instance
    hasMissedPunch: boolean;  // True if employee forgot to punch in/out

    // ARRAY OF REFERENCES - Links to multiple TimeException documents
    @Prop({ type: Types.ObjectId, ref: 'TimeException', default: [] })
    exceptionIds: Types.ObjectId[];  // IDs of time exceptions for this record

    // BOOLEAN FIELD for payroll status
    @Prop({ default: true }) // should be set to false when there is an attendance correction request that is not yet resolved
    finalisedForPayroll: boolean;  // Ready for payroll calculation?
}

// ============================================
// CREATE SCHEMA - Converts the class into a Mongoose schema
// ============================================
// This line is required to actually create the schema that MongoDB will use
export const AttendanceRecordSchema = SchemaFactory.createForClass(AttendanceRecord);

// ============================================
// COMMON @Prop() OPTIONS:
// ============================================
// @Prop({ type: String })              → String field
// @Prop({ type: Number })              → Number field
// @Prop({ type: Boolean })             → Boolean field
// @Prop({ type: Date })                → Date field
// @Prop({ type: [String] })            → Array of strings
// @Prop({ required: true })            → Field is required
// @Prop({ default: 'value' })          → Default value
// @Prop({ unique: true })              → Must be unique
// @Prop({ enum: ['A', 'B'] })          → Only these values allowed
// @Prop({ type: Types.ObjectId, ref: 'ModelName' }) → Reference to another collection
// ============================================
