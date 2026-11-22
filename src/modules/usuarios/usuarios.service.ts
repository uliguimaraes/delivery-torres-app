import { Injectable } from '@nestjs/common';
import { LoggerService } from '../../shared/logger.service';

@Injectable()
export class UsuariosService {
  constructor(private readonly logger: LoggerService) {}

  async validarCliente(usuarioId: string, requestId?: string): Promise<boolean> {
    this.logger.log('UsuariosService', `Validando cliente ${usuarioId}`, requestId);
    return Boolean(usuarioId);
  }
}
