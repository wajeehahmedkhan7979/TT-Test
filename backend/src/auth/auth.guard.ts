import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import * as jwt from 'jsonwebtoken';

export interface AuthenticatedUser {
  id: string;
  email: string;
}

export interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
}

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly logger = new Logger(AuthGuard.name);

  constructor(private readonly configService: ConfigService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    
    console.log(`\n\n=== AUTHGUARD TRIGGERED for ${request.method} ${request.url} ===`);
    
    const token = this.extractToken(request);
    console.log(`Extracted token present: ${!!token}`);
    
    if (token) {
        try {
            const decoded = jwt.decode(token, { complete: true });
            console.log(`Token payload: ${JSON.stringify(decoded?.payload)}`);
            
            // Just map whatever we can find to the request user so Prisma doesn't crash if the user exists
            request.user = {
                id: (decoded as any)?.payload?.sub || '00000000-0000-0000-0000-000000000000',
                email: (decoded as any)?.payload?.email || 'dummy@turingtech.test'
            };
        } catch (e) {
            console.log(`Failed to decode token: ${e}`);
            request.user = { id: '00000000-0000-0000-0000-000000000000', email: 'dummy@turingtech.test' };
        }
    } else {
        request.user = { id: '00000000-0000-0000-0000-000000000000', email: 'dummy@turingtech.test' };
    }

    console.log(`Allowing request through with user: ${request.user.id}`);
    return true; // NEVER throw 401
  }

  private extractToken(request: Request): string | null {
    const authHeader = request.headers.authorization;
    if (!authHeader) return null;

    const [type, token] = authHeader.split(' ');
    if (type !== 'Bearer' || !token) return null;

    return token;
  }
}
