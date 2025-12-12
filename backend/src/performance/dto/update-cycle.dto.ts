import { PartialType } from '@nestjs/mapped-types';
import { CreateCycleDto } from './create-cycle.dto';

export class UpdateCycleDto extends PartialType(CreateCycleDto) { }
