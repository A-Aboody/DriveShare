import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { RegisterDto } from './dto/register.dto.js';

const validDto: RegisterDto = {
  email: 'test@example.com',
  password: 'password123',
  securityQuestion1: "What is your mother's maiden name?",
  securityAnswer1: 'smith',
  securityQuestion2: 'What was your first pet?',
  securityAnswer2: 'fluffy',
  securityQuestion3: 'What city were you born in?',
  securityAnswer3: 'detroit',
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthService],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  // ── Registration ──────────────────────────────

  describe('registerUser()', () => {
    it('should register a new user successfully', async () => {
      const result = await service.registerUser(validDto);
      expect(result.message).toBe('Registration successful');
      expect(result.userId).toBeDefined();
    });

    it('should throw ConflictException for duplicate email', async () => {
      await service.registerUser(validDto);
      await expect(service.registerUser(validDto)).rejects.toThrow(ConflictException);
    });

    it('should not expose password or security answers', async () => {
      await service.registerUser(validDto);
      const users = service.getAllUsers();
      // getAllUsers strips all sensitive fields
      expect(users[0]).not.toHaveProperty('password');
      expect(users[0]).not.toHaveProperty('securityAnswer1');
    });
  });

  // ── Login ─────────────────────────────────────

  describe('login()', () => {
    it('should return a session token on valid credentials', async () => {
      await service.registerUser(validDto);
      const result = await service.login(validDto.email, validDto.password);
      expect(result.sessionToken).toBeDefined();
    });

    it('should throw UnauthorizedException on wrong password', async () => {
      await service.registerUser(validDto);
      await expect(service.login(validDto.email, 'wrongpass')).rejects.toThrow(UnauthorizedException);
    });
  });

  // ── Password Recovery ─────────────────────────

  describe('recoverPassword()', () => {
    it('should reset password when all answers are correct', async () => {
      await service.registerUser(validDto);
      const result = await service.recoverPassword(
        validDto.email,
        [validDto.securityAnswer1, validDto.securityAnswer2, validDto.securityAnswer3],
        'newpassword123',
      );
      expect(result.message).toBe('Password has been reset successfully');

      // Confirm new password works for login
      const loginResult = await service.login(validDto.email, 'newpassword123');
      expect(loginResult.sessionToken).toBeDefined();
    });

    it('should throw UnauthorizedException if any answer is wrong', async () => {
      await service.registerUser(validDto);
      await expect(
        service.recoverPassword(
          validDto.email,
          ['wrong', validDto.securityAnswer2, validDto.securityAnswer3],
          'newpassword123',
        ),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  // ── Session Singleton ─────────────────────────

  describe('Session (Singleton)', () => {
    it('should reflect active session after login', async () => {
      await service.registerUser(validDto);
      await service.login(validDto.email, validDto.password);
      const session = service.getSession();
      expect(session.isActive).toBe(true);
      expect(session.user?.email).toBe(validDto.email);
    });

    it('should clear session after logout', async () => {
      await service.registerUser(validDto);
      await service.login(validDto.email, validDto.password);
      service.logout();
      const session = service.getSession();
      expect(session.isActive).toBe(false);
    });
  });
});