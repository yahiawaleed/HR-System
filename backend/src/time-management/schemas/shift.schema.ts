import { Schema } from 'mongoose';

export const ShiftSchema = new Schema(
  {
    name: { type: String, required: true },
    type: {
      type: String,
      enum: ['normal', 'split', 'overnight', 'rotational'],
      required: true,
    },
    startTime: { type: String, required: true }, // HH:mm format
    endTime: { type: String, required: true }, // HH:mm format
    breakDuration: { type: Number, default: 0 }, // minutes
    workingHours: { type: Number, required: true },
    isActive: { type: Boolean, default: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true, versionKey: false }
);

