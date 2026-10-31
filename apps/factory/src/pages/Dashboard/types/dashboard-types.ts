export type ProductionOrderStatus = 'a_preparar' | 'a_enviar' | 'entregue';

export type ProductionOrder = {
  id: string;
  orderNumber?: number;
  filial: string;
  itens: Array<{ nome: string; measure: string; quantidade: number }>;
  totalCost: number;
  status: ProductionOrderStatus;
};
