import { Schema } from 'mongoose';

export const OffboardingChecklistSchema = new Schema(
  {
    employeeId: { type: Schema.Types.ObjectId, ref: 'Employee', required: true, index: true },
    exitType: {
      type: String,
      enum: ['resignation', 'termination', 'retirement', 'end_of_contract'],
      required: true,
    },
    exitDate: { type: Date, required: true },
    lastWorkingDate: { type: Date, required: true },
    tasks: [
      {
        title: { type: String, required: true },
        category: {
          type: String,
          enum: ['access_revocation', 'asset_return', 'documentation', 'final_settlement', 'other'],
        },
        assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
        status: {
          type: String,
          enum: ['pending', 'completed'],
          default: 'pending',
        },
        completedAt: { type: Date },
      },
    ],
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed'],
      default: 'pending',
      index: true,
    },
    initiatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    completedAt: { type: Date },
  },
  { timestamps: true, versionKey: false }
);

OffboardingChecklistSchema.index({ employeeId: 1 });
OffboardingChecklistSchema.index({ status: 1 });

