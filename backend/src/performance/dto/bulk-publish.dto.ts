import { IsArray, IsMongoId, IsNotEmpty } from 'class-validator';

export class BulkPublishDto {
    @IsArray()
    @IsMongoId({ each: true })
    @IsNotEmpty()
    assignmentIds: string[];
}
