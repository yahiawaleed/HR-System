import { PartialType } from '@nestjs/swagger';
import { CreateLatenessRuleDto } from './create-lateness-rule.dto';

export class UpdateLatenessRuleDto extends PartialType(CreateLatenessRuleDto) { }
