import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TrackingModule } from './payroll/tracking/tracking.module';

@Module({
  imports: [
    // 1. Direct Database Connection (Synchronous)
    // Replaces the complex "useFactory" code.
    // Change the string below if you are using a cloud DB (Atlas).
    MongooseModule.forRoot('mongodb://127.0.0.1:27017/hr-system'),

    // 2. Your Subsystem
    TrackingModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
