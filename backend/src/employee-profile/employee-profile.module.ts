import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EmployeeProfileController } from './employee-profile.controller';
import { EmployeeProfileService } from './employee-profile.service';
import { Candidate, CandidateSchema } from './models/candidate.schema';
import {
  EmployeeProfile,
  EmployeeProfileSchema,
} from './models/employee-profile.schema';
import {
  EmployeeSystemRole,
  EmployeeSystemRoleSchema,
} from './models/employee-system-role.schema';
import {
  EmployeeProfileChangeRequest,
  EmployeeProfileChangeRequestSchema,
} from './models/ep-change-request.schema';
import {
  EmployeeQualification,
  EmployeeQualificationSchema,
} from './models/qualification.schema';

import { AuthModule } from '../auth/auth.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { NotificationModule } from '../notification/notification.module';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Module({
  imports: [
    AuthModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key-change-this',
      signOptions: { expiresIn: '24h' },
    }),
    MongooseModule.forFeature([
      { name: Candidate.name, schema: CandidateSchema },
      { name: EmployeeProfile.name, schema: EmployeeProfileSchema },
      { name: EmployeeSystemRole.name, schema: EmployeeSystemRoleSchema },
      {
        name: EmployeeProfileChangeRequest.name,
        schema: EmployeeProfileChangeRequestSchema,
      },
      { name: EmployeeQualification.name, schema: EmployeeQualificationSchema },
    ]),
    NotificationModule,
    MulterModule.register({
      storage: diskStorage({
        destination: './uploads/profile-pictures',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          cb(null, `profile-${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|webp/;
        const mimeType = allowedTypes.test(file.mimetype);
        const extName = allowedTypes.test(extname(file.originalname).toLowerCase());

        if (mimeType && extName) {
          return cb(null, true);
        }
        cb(new Error('Only image files (JPEG, PNG, WebP) are allowed!'), false);
      },
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
    }),
  ],
  controllers: [EmployeeProfileController],
  providers: [EmployeeProfileService],
  exports: [
    EmployeeProfileService,
    MongooseModule, // Export for use by other modules that need to populate EmployeeProfile
  ],
})
export class EmployeeProfileModule { }
