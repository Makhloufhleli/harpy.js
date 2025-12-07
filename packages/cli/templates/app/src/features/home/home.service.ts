import { Injectable } from '@nestjs/common';

@Injectable()
export class HomeService {
  getItems() {
    return ['Item A', 'Item B'];
  }
}
