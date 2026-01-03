import { Injectable } from '@harpy-js/core/runtime';

@Injectable()
export class HomeService {
  getWelcomeMessage(): string {
    return 'Welcome to Harpy.js on Bun!';
  }
}
