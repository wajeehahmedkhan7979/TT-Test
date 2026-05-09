import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthenticatedUser } from './auth.guard';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Ensures a user record exists in our database, synced from Supabase Auth.
   * Creates the user if they don't exist yet (first login).
   */
  async ensureUser(authUser: AuthenticatedUser) {
    const existing = await this.prisma.user.findUnique({
      where: { id: authUser.id },
    });

    if (existing) {
      return existing;
    }

    this.logger.log(`Creating new user record for ${authUser.email}`);

    return this.prisma.user.create({
      data: {
        id: authUser.id,
        email: authUser.email,
      },
    });
  }

  async getUser(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
    });
  }
}
