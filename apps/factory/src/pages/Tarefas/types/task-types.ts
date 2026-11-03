export type Ingredient = {
  id: string;
  name: string;
  measure: string;
  quantity: number;
  cost: number;
};

export type Insumo = {
  id: string;
  name: string;
  measure: string;
  cost: number;
};

export type PedidoIngredient = {
  id: string;
  name: string;
  measure: string;
  neededQty: number;
  neededCost: number;
};

export type Recipe = {
  ingredients: Ingredient[];
  insumos: Insumo[];
};

export type PedidoStatus = 'a_preparar' | 'a_enviar' | 'entregue';
export type OrderSearchMode = 'typing' | 'alphabetical';

export type Pedido = {
  id: string;
  unit?: 'main' | 'franchise' | 'factory';
  orderNumber?: number;
  filial: string;
  eventId?: string;
  eventSource?: 'main' | 'franchise';
  eventName?: string;
  eventDate?: string;
  itens: Array<{ id: string; nome: string; measure: string; quantidade: number }>;
  ingredients: PedidoIngredient[];
  totalCost: number;
  status: PedidoStatus;
  createdAt?: string;
};

export type AvailableEvent = {
  id: string;
  source: 'main' | 'franchise';
  name: string;
  date: string;
  city?: string;
};
