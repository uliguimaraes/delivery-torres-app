import { Injectable } from '@nestjs/common';

@Injectable()
export class LoggerService {
  log(contexto: string, mensagem: string, requestId?: string): void {
    const trace = requestId ? `[ReqID: ${requestId}] ` : '';
    console.log(`[${new Date().toISOString()}] ${trace}[${contexto}] ${mensagem}`);
  }
}