import { Global, Module } from '@nestjs/common';
import { LoggerService } from './logger.service';
import { AuthGuard } from './auth.guard';

// Código usado por vários módulos fica em shared/.
// @Global para que qualquer módulo injete o LoggerService sem precisar importar.
@Global()
@Module({
  providers: [LoggerService, AuthGuard],
  exports: [LoggerService, AuthGuard],
})
export class SharedModule {}
