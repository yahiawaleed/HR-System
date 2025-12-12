import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) { }

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    const normalizedUserRole = user.role.toLowerCase();
    const normalizedRequiredRoles = requiredRoles.map(role => role.toLowerCase());

    const hasRole = normalizedRequiredRoles.includes(normalizedUserRole);
    if (!hasRole) {
      throw new ForbiddenException(`User role ${user.role} does not have access to this resource`);
    }

    return true;
  }
}
