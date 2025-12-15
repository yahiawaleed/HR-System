import { Schema } from 'mongoose';

export const OrgChangeRequestSchema = new Schema(
  {
    type: {
      type: String,
      enum: ['department', 'position', 'reporting_line'],
      required: true,
    },
    entityId: { type: Schema.Types.ObjectId, required: true },
    requestedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    changes: {
      type: Schema.Types.Mixed,
      required: true,
    },
    reason: { type: String },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
      index: true,
    },
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: { type: Date },
    reviewNotes: { type: String },
  },
  { timestamps: true, versionKey: false }
);

OrgChangeRequestSchema.index({ status: 1 });
OrgChangeRequestSchema.index({ requestedBy: 1 });

