import { Controller, Get, Patch, Delete, Param, Query, Req, UseGuards } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('api/notifications')
@UseGuards(JwtAuthGuard)
export class NotificationController {
    constructor(private readonly notificationService: NotificationService) { }

    @Get()
    async getNotifications(
        @Req() req: any,
        @Query('page') page: string = '1',
        @Query('limit') limit: string = '10',
        @Query('onlyUnread') onlyUnread: string = 'false',
    ) {
        const userId = req.user?.userId;
        return this.notificationService.getNotifications(
            userId,
            parseInt(page, 10),
            parseInt(limit, 10),
            onlyUnread === 'true',
        );
    }

    @Patch(':id/read')
    async markAsRead(@Param('id') id: string) {
        return this.notificationService.markAsRead(id);
    }

    @Patch('read-all')
    async markAllAsRead(@Req() req: any) {
        const userId = req.user?.userId;
        return this.notificationService.markAllAsRead(userId);
    }

    @Delete(':id')
    async deleteNotification(@Param('id') id: string) {
        await this.notificationService.deleteNotification(id);
        return { message: 'Notification deleted successfully' };
    }
}
