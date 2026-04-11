import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';

class LoginDto {
  email: string;
  password: string;
}

class RecoverPasswordDto {
  answers: [string, string, string];
  newPassword: string;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // POST /auth/register
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  register(@Body() dto: RegisterDto) {
    return this.authService.registerUser(dto);
  }

  // POST /auth/login
  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto.email, dto.password);
  }

  // POST /auth/logout
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout() {
    return this.authService.logout();
  }

  // GET /auth/session
  @Get('session')
  getSession() {
    return this.authService.getSession();
  }

  // GET /auth/recover/:email/questions
  @Get('recover/:email/questions')
  getSecurityQuestions(@Param('email') email: string) {
    return this.authService.getSecurityQuestions(email);
  }

  // POST /auth/recover/:email
  @Post('recover/:email')
  @HttpCode(HttpStatus.OK)
  recoverPassword(
    @Param('email') email: string,
    @Body() dto: RecoverPasswordDto,
  ) {
    return this.authService.recoverPassword(
      email,
      dto.answers,
      dto.newPassword,
    );
  }
}
