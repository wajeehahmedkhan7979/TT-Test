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

  private publicKey: any = null;

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = this.extractToken(request);

    if (!token) {
      throw new UnauthorizedException('Missing authentication token');
    }

    try {
      this.logger.debug(`Incoming token: ${token.substring(0, 15)}...`);
      const key = await this.getPublicKey();
      
      // Verify the token locally using the Public Key and ES256 algorithm
      const payload = jwt.verify(token, key, {
        algorithms: ['ES256', 'RS256'], // Support common Supabase asymmetric algs
      }) as jwt.JwtPayload;

      if (!payload || !payload.sub) {
        this.logger.error('Token verification succeeded but payload is invalid');
        throw new UnauthorizedException('Invalid token payload');
      }

      this.logger.log(`Authentication successful for user: ${payload.email}`);
      request.user = {
        id: payload.sub as string,
        email: (payload.email as string) || 'no-email@supabase.local',
      };

      return true;
    } catch (error) {
      this.logger.warn(`Local ES256 verification failed: ${error.message}. Trying legacy fallback...`);
      // Fallback: If local verification fails, it might be an HS256 token (legacy)
      return this.verifyLegacy(token, request);
    }
  }

  private async getPublicKey() {
    if (this.publicKey) return this.publicKey;

    try {
      const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
      const response = await fetch(`${supabaseUrl}/auth/v1/.well-known/jwks.json`);
      const { keys } = await response.json();
      
      // Find the key used for signing (usually the first one or matches the 'kid' in header)
      const jwk = keys[0]; 
      
      const { createPublicKey } = await import('crypto');
      this.publicKey = createPublicKey({
        key: jwk,
        format: 'jwk',
      });
      
      this.logger.log('Successfully loaded Supabase Public Key for local verification');
      return this.publicKey;
    } catch (error) {
      this.logger.error(`Failed to fetch JWKS: ${error.message}`);
      throw error;
    }
  }

  private async verifyLegacy(token: string, request: any): Promise<boolean> {
    try {
      const jwtSecret = this.configService.get<string>('SUPABASE_JWT_SECRET');
      if (!jwtSecret) throw new Error('No legacy secret');

      const payload = jwt.verify(token, jwtSecret, { algorithms: ['HS256'] }) as jwt.JwtPayload;
      request.user = {
        id: payload.sub as string,
        email: (payload.email as string) || 'no-email@supabase.local',
      };
      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired authentication token');
    }
  }

  private extractToken(request: Request): string | null {
    const authHeader = request.headers.authorization;
    if (!authHeader) return null;

    const [type, token] = authHeader.split(' ');
    if (type !== 'Bearer' || !token) return null;

    return token;
  }
}
