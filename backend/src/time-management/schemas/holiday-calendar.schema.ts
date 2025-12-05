import { Schema } from 'mongoose';

export const HolidayCalendarSchema = new Schema(
  {
    name: { type: String, required: true },
    year: { type: Number, required: true },
    holidays: [
      {
        date: { type: Date, required: true },
        name: { type: String, required: true },
        type: {
          type: String,
          enum: ['national', 'company', 'regional'],
          default: 'national',
        },
      },
    ],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true, versionKey: false }
);

HolidayCalendarSchema.index({ year: 1, isActive: 1 });

