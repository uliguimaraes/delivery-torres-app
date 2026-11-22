import { Module } from '@nestjs/common';

@Module({})
export class DatabaseModule {
  static connect() {
    console.log('[Database] Conexão única estabelecida com o banco delivery_torres_db');
  }
}