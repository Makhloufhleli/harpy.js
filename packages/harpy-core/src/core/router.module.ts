import { Global, Module } from '@nestjs/common';
import { NavigationService } from './navigation.service';

@Global()
@Module({
  providers: [NavigationService],
  exports: [NavigationService],
})
export class RouterModule {}
