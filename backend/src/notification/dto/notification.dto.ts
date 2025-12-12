import { IsEnum, IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { NotificationType } from '../models/notification.schema';

export class CreateNotificationDto {
    @IsMongoId()
    @IsNotEmpty()
    recipientId: string;

    @IsEnum(NotificationType)
    @IsNotEmpty()
    type: NotificationType;

    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsNotEmpty()
    message: string;

    @IsString()
    @IsOptional()
    relatedEntityType?: string;

    @IsMongoId()
    @IsOptional()
    relatedEntityId?: string;

    @IsString()
    @IsOptional()
    actionUrl?: string;
}

export class MarkAsReadDto {
    @IsMongoId()
    @IsNotEmpty()
    notificationId: string;
}
