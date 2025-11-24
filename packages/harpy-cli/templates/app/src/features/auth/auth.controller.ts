import { JsxRender } from '@hepta-solutions/harpy-core';
import { Controller, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import LoginPage from './views/login-page';
import RegisterPage from './views/register-page';
import AuthLayout from '../../layouts/auth-layout';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('login')
  @JsxRender(LoginPage, {
    layout: AuthLayout,
    meta: {
      title: 'Login - Harpy App',
      description: 'Sign in to your account',
    },
  })
  login() {
    return {};
  }

  @Get('register')
  @JsxRender(RegisterPage, {
    layout: AuthLayout,
    meta: {
      title: 'Register - Harpy App',
      description: 'Create a new account',
    },
  })
  register() {
    return {};
  }
}
