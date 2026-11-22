export class Pagamento {
  id: string;
  pedidoId: string;
  valor: number;
  status: 'APROVADO' | 'RECUSADO';
}