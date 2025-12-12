// Integration Services Index
// Export all integration services for easy importing

// Services
export { PayrollIntegrationService } from './payroll-integration.service';
export { LeavesIntegrationService } from './leaves-integration.service';
export { OrgStructureIntegrationService } from './org-structure-integration.service';
export { NotificationIntegrationService } from './notification-integration.service';
export { PerformanceIntegrationService } from './performance-integration.service';

// Types - exported separately for isolatedModules compatibility
export type { PayrollDailyPayload, PayrollException, PayrollSyncResult } from './payroll-integration.service';
export type { LeaveInfo, DayLeaveStatus } from './leaves-integration.service';
export { LeaveType, LeaveStatus } from './leaves-integration.service';
export type { DepartmentInfo, EmployeeOrgInfo, PositionInfo } from './org-structure-integration.service';
export { NotificationType, NotificationPriority, NotificationChannel } from './notification-integration.service';
export type { NotificationPayload, NotificationResult } from './notification-integration.service';
export type { DisciplinaryCase, LatenessStats } from './performance-integration.service';
