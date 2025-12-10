import { PartialType } from '@nestjs/swagger';
import { CreateOvertimeRuleDto } from './create-overtime-rule.dto';

export class UpdateOvertimeRuleDto extends PartialType(CreateOvertimeRuleDto) { }
