import { Injectable } from '@nestjs/common';

@Injectable()
export class UsuariosService {
  async validarCliente(usuarioId: string): Promise<boolean> {
    return Boolean(usuarioId);
  }
}