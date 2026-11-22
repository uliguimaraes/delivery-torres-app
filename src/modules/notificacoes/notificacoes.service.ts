import { Injectable } from '@nestjs/common';
import { LoggerService } from '../../shared/logger.service';

@Injectable()
export class NotificacoesService {
  constructor(private readonly logger: LoggerService) {}

  async avisarRestaurante(restauranteId: string, pedidoId: string, requestId?: string): Promise<void> {
    this.logger.log('NotificacoesService', `Restaurante ${restauranteId} avisado sobre o pedido ${pedidoId}`, requestId);
  }
}
