import {
  Injectable,
  ConflictException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { createHmac, randomUUID, timingSafeEqual } from 'crypto';
import { PrismaClient } from '../generated/prisma/client.js';
import { PrismaPg } from '@prisma/adapter-pg';
import { RegisterDto } from './dto/register.dto.js';
import { SessionManager } from './session/session-manager.js';
import { SecurityQuestionHandler } from './recovery/security-question.handler.js';

const HMAC_SECRET = 'driveshare-secret';
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

function hashAnswer(answer: string): string {
  return createHmac('sha256', HMAC_SECRET).update(answer).digest('hex');
}

function hashPassword(password: string): string {
  return createHmac('sha256', HMAC_SECRET).update(password).digest('hex');
}

function verifyPassword(plain: string, hashed: string): boolean {
  const candidate = hashPassword(plain);
  return timingSafeEqual(Buffer.from(candidate), Buffer.from(hashed));
}

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

@Injectable()
export class AuthService {
  private readonly session = SessionManager.getInstance();

  async registerUser(
    dto: RegisterDto,
  ): Promise<{ message: string; userId: string }> {
    const {
      email, password,
      securityQuestion1, securityAnswer1,
      securityQuestion2, securityAnswer2,
      securityQuestion3, securityAnswer3,
    } = dto;

    const fields: Record<string, string> = {
      email, password,
      securityQuestion1, securityAnswer1,
      securityQuestion2, securityAnswer2,
      securityQuestion3, securityAnswer3,
    };
    for (const [field, value] of Object.entries(fields)) {
      if (!value || value.trim() === '') {
        throw new BadRequestException(`${field} must not be empty`);
      }
    }

    if (!validateEmail(email)) {
      throw new BadRequestException('Please provide a valid email address');
    }

    if (password.length < 6) {
      throw new BadRequestException('Password must be at least 6 characters long');
    }

    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });
    if (existing) {
      throw new ConflictException('An account with this email already exists');
    }

    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase().trim(),
        password: hashPassword(password),
        securityQuestion1,
        securityAnswer1: hashAnswer(securityAnswer1.toLowerCase().trim()),
        securityQuestion2,
        securityAnswer2: hashAnswer(securityAnswer2.toLowerCase().trim()),
        securityQuestion3,
        securityAnswer3: hashAnswer(securityAnswer3.toLowerCase().trim()),
      },
    });

    return { message: 'Registration successful', userId: user.id };
  }

  async login(
    email: string,
    password: string,
  ): Promise<{ message: string; sessionToken: string }> {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!verifyPassword(password, user.password)) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const sessionToken = randomUUID();
    this.session.startSession(user as any, sessionToken);

    return { message: 'Login successful', sessionToken };
  }

  logout(): { message: string } {
    this.session.endSession();
    return { message: 'Logged out successfully' };
  }

  getSession() {
    return this.session.getSessionInfo();
  }

  async getSecurityQuestions(email: string): Promise<{
    question1: string;
    question2: string;
    question3: string;
  }> {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });
    if (!user) {
      throw new BadRequestException('No account found with that email');
    }
    return {
      question1: user.securityQuestion1,
      question2: user.securityQuestion2,
      question3: user.securityQuestion3,
    };
  }

  async recoverPassword(
    email: string,
    answers: [string, string, string],
    newPassword: string,
  ): Promise<{ message: string }> {
    if (!newPassword || newPassword.length < 6) {
      throw new BadRequestException('New password must be at least 6 characters');
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });
    if (!user) {
      throw new BadRequestException('No account found with that email');
    }

    const passed = SecurityQuestionHandler.verifyRecoveryAnswers(user as any, answers);
    if (!passed) {
      throw new UnauthorizedException('One or more security answers are incorrect');
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashPassword(newPassword) },
    });

    return { message: 'Password has been reset successfully' };
  }

  async getAllUsers() {
    return prisma.user.findMany({
      select: { id: true, email: true, createdAt: true },
    });
  }
}