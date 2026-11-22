import { Injectable } from '@nestjs/common';

@Injectable()
export class NotificacoesService {
  async avisarRestaurante(restauranteId: string, pedidoId: string): Promise<void> {
    console.log(`[Notificações] Restaurante ${restauranteId} avisado sobre o pedido ${pedidoId}`);
  }
}