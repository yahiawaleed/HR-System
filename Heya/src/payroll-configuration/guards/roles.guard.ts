import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SystemRole } from '../../employee-profile/enums/employee-profile.enums';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: SystemRole[]) => SetMetadata(ROLES_KEY, roles);

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<SystemRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) {
      return true; // No roles required, allow access
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // TODO: In production, uncomment this to enforce authentication
    // if (!user) {
    //   throw new ForbiddenException('User not authenticated');
    // }

    // For development: if no user is set, allow access
    // In production, ensure authentication middleware sets request.user
    if (!user) {
      console.warn('⚠️  RolesGuard: No user found in request. Allowing access for development.');
      return true;
    }

    // Check if user has any of the required roles
    // Assuming user.roles is an array of SystemRole
    const userRoles = user.roles || [];
    const hasRole = requiredRoles.some((role) => userRoles.includes(role));

    if (!hasRole) {
      throw new ForbiddenException(
        `Access denied. Required roles: ${requiredRoles.join(', ')}. Your roles: ${userRoles.join(', ') || 'none'}`,
      );
    }

    return true;
  }
}

