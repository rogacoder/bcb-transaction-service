import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('Authorization header is required');
    }

    if (!authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Bearer token is required');
    }

    const token = authHeader.substring(7);

    if (!token || token.trim() === '') {
      throw new UnauthorizedException('Token is required');
    }

    // RS > BCB: employ auth service to validate (jwt)
    // RS > BCB: for this exercise: always let through.
    return true;
  }
}
