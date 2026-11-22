import { Injectable } from '@nestjs/common';
import { LoggerService } from '../../shared/logger.service';

@Injectable()
export class CardapioService {
  constructor(private readonly logger: LoggerService) {}

  async validarItensECalcularTotal(itensIds: string[], requestId?: string): Promise<number> {
    const total = itensIds.length * 45.0;
    this.logger.log('CardapioService', `${itensIds.length} item(ns) validados, total R$ ${total}`, requestId);
    return total;
  }
}
