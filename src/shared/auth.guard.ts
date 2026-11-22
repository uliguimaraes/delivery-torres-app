import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthGuard {
  validarToken(token: string): boolean {
    return Boolean(token);
  }
}