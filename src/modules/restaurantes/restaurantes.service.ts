import { Injectable } from '@nestjs/common';

@Injectable()
export class RestaurantesService {
  async verificarDisponibilidade(restauranteId: string): Promise<boolean> {
    return Boolean(restauranteId);
  }
}