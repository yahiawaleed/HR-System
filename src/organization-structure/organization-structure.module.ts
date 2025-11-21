import { Module } from '@nestjs/common';
import { OrganizationStructureController } from './organization-structure.controller';

@Module({
  controllers: [OrganizationStructureController],
})
export class OrganizationStructureModule {}
