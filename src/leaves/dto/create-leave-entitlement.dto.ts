import { IsNotEmpty, IsMongoId, IsNumber, Min } from 'class-validator';

export class CreateLeaveEntitlementDto {
    @IsMongoId()
    @IsNotEmpty()
    employeeId: string;

    @IsMongoId()
    @IsNotEmpty()
    leaveTypeId: string;

    @IsNumber()
    @Min(0)
    totalDays: number;
}
