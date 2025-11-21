import mongoose from 'mongoose';
import { AppraisalCycleSchema } from './models/appraisal-cycle.schema';
import { AppraisalTemplateSchema } from './models/appraisal-template.schema';
import { AppraisalTemplateType, AppraisalRatingScaleType, AppraisalCycleStatus } from './enums/performance.enums';

export async function seedPerformance(connection: mongoose.Connection, departments: any) {
  const AppraisalCycleModel = connection.model('AppraisalCycle', AppraisalCycleSchema);
  const AppraisalTemplateModel = connection.model('AppraisalTemplate', AppraisalTemplateSchema);

  console.log('Clearing Performance Data...');
  await AppraisalCycleModel.deleteMany({});
  await AppraisalTemplateModel.deleteMany({});

  console.log('Seeding Performance Data...');
  const template = await AppraisalTemplateModel.create({
    name: 'Annual Review Template 2025',
    description: 'Standard annual review template',
    templateType: AppraisalTemplateType.ANNUAL,
    isActive: true,
    ratingScale: {
      type: AppraisalRatingScaleType.FIVE_POINT,
      min: 1,
      max: 5,
      step: 1,
      labels: ['Poor', 'Fair', 'Good', 'Very Good', 'Excellent'],
    },
    sections: [
      {
        key: 'core_values',
        title: 'Core Values',
        weight: 50,
        criteria: [
          { key: 'integrity', title: 'Integrity', weight: 50 },
          { key: 'teamwork', title: 'Teamwork', weight: 50 },
        ],
      },
      {
        key: 'goals',
        title: 'Goals',
        weight: 50,
        criteria: [
          { key: 'goal_achievement', title: 'Goal Achievement', weight: 100 },
        ],
      },
    ],
  });

  await AppraisalCycleModel.create({
    name: '2025 Annual Review Cycle',
    description: 'Performance review for the year 2025',
    cycleType: AppraisalTemplateType.ANNUAL,
    startDate: new Date('2025-01-01'),
    endDate: new Date('2025-12-31'),
    status: AppraisalCycleStatus.PLANNED,
    templates: [
      {
        templateId: template._id,
        departmentIds: [departments.hrDept._id, departments.engDept._id, departments.salesDept._id],
      },
    ],
  });
  console.log('Performance Data seeded.');
}
