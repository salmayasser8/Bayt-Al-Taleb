import { OAuth2Client } from 'google-auth-library';
import type { AuthRepository } from './auth.repository.js';
import { RoleName } from '@prisma/client';

interface GoogleProfile {
  sub: string;
  email: string;
  name?: string;
  picture?: string;
}

export class GoogleAuthService {
  private readonly client: OAuth2Client;
  private readonly clientId: string;

  constructor(
    clientId: string,
    clientSecret: string,
    callbackUrl: string,
    private readonly repo: AuthRepository,
  ) {
    this.clientId = clientId;
    this.client = new OAuth2Client(clientId, clientSecret, callbackUrl);
  }

  getAuthorizationUrl(): string {
    return this.client.generateAuthUrl({
      access_type: 'online',
      scope: ['openid', 'email', 'profile'],
      prompt: 'select_account',
    });
  }

  async handleCallback(code: string): Promise<{ id: string; email: string; fullName: string; role: string }> {
    const { tokens } = await this.client.getToken(code);
    const idToken = tokens.id_token;
    if (!idToken) throw new Error('No id_token returned from Google');

    const ticket = await this.client.verifyIdToken({
      idToken,
      audience: this.clientId,
    });

    const profile = ticket.getPayload() as GoogleProfile | undefined;
    if (!profile) throw new Error('Invalid Google profile');
    if (!profile.sub || !profile.email) throw new Error('Invalid Google profile');

    const googleId = profile.sub;
    const email = profile.email;
    const fullName: string = profile.name ?? email.split('@')[0] ?? '';

    let user = await this.repo.findUserByGoogleId(googleId);

    if (!user) {
      const existingByEmail = await this.repo.findUserByEmail(email);
      if (existingByEmail) {
        user = await this.repo.updateUser(existingByEmail.id, { googleId });
      }
    }

    if (!user) {
      const memberRole = await this.repo.findRoleByName(RoleName.MEMBER);
      if (!memberRole) throw new Error('MEMBER role not seeded');

      user = await this.repo.createUser({
        email,
        fullName,
        roleId: memberRole.id,
        googleId,
      });
    }

    if (!user.isActive) throw new Error('Account is deactivated');

    return { id: user.id, email: user.email, fullName: user.fullName, role: user.role.name };
  }
}
