import { Injectable } from '@nestjs/common';

@Injectable()
export class DashboardService {
  getStats() {
    return {
      users: 1234,
      revenue: 12345,
      projects: 42,
    };
  }
}
