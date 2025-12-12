import { IsNotEmpty, IsString } from 'class-validator';

export class ResolveDisputeDto {
    @IsString()
    @IsNotEmpty()
    resolutionSummary: string;
}
