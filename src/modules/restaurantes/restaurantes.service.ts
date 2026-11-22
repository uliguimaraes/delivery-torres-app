import { Injectable } from '@nestjs/common';
import { LoggerService } from '../../shared/logger.service';

@Injectable()
export class RestaurantesService {
  constructor(private readonly logger: LoggerService) {}

  async verificarDisponibilidade(restauranteId: string, requestId?: string): Promise<boolean> {
    this.logger.log('RestaurantesService', `Verificando disponibilidade do restaurante ${restauranteId}`, requestId);
    return Boolean(restauranteId);
  }
}
