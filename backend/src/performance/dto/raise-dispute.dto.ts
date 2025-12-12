import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class RaiseDisputeDto {
    @IsString()
    @IsNotEmpty()
    reason: string;

    @IsString()
    @IsOptional()
    details?: string;
}
