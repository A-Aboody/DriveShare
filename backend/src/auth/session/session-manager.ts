import { User } from '../entities/user.entity';

export class SessionManager {
  private static instance: SessionManager; // holds the single shared instance
  private currentUser: User | null = null;
  private sessionToken: string | null = null;
  private sessionStartedAt: Date | null = null;

  private constructor() {} // private which prevents creating instances with "new"


  static getInstance(): SessionManager {
     // global access point to the single instance
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager(); // created only once
    }
    return SessionManager.instance;  // always returns same instance
  }

  startSession(user: User, token: string): void {
    this.currentUser = user;
    this.sessionToken = token;
    this.sessionStartedAt = new Date();
  }

  endSession(): void {
    this.currentUser = null;
    this.sessionToken = null;
    this.sessionStartedAt = null;
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  getSessionToken(): string | null {
    return this.sessionToken;
  }

  isActive(): boolean {
    return this.currentUser !== null && this.sessionToken !== null;
  }

  getSessionStartTime(): Date | null {
    return this.sessionStartedAt;
  }

  getSessionInfo(): {
    user: User | null;
    token: string | null;
    isActive: boolean;
  } {
    return {
      user: this.currentUser,
      token: this.sessionToken,
      isActive: this.isActive(),
    };
  }
}
