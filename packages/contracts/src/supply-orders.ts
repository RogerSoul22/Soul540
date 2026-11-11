export type SupplyOrderStatus =
  | 'submitted'
  | 'preparing'
  | 'dispatched'
  | 'received'
  | 'received_with_difference'
  | 'cancelled';

export type SupplyOrderLine = {
  factorySupplyId: string;
  factorySupplyName: string;
  measureUnit: string;
  quantityRequested: number;
  quantityToDispatch: number;
  quantityReceived?: number;
  franchiseSupplyId?: string;
};

export type SupplyOrderHistoryEntry = {
  status: SupplyOrderStatus;
  actorName: string;
  actorUnit: 'main' | 'franchise' | 'factory';
  at: string;
  note?: string;
};

export type SupplyOrderSummary = {
  id: string;
  franchiseId: string;
  franchiseName: string;
  status: SupplyOrderStatus;
  items: SupplyOrderLine[];
  note?: string;
  createdAt: string;
  updatedAt: string;
  history: SupplyOrderHistoryEntry[];
};

export type CreateSupplyOrderInput = {
  items: Array<{ factorySupplyId: string; quantity: number }>;
  note?: string;
};

export type DispatchSupplyOrderInput = {
  items: Array<{ factorySupplyId: string; quantityToDispatch: number }>;
  idempotencyKey?: string;
  note?: string;
};

export type ConfirmSupplyOrderReceiptInput = {
  items: Array<{ factorySupplyId: string; quantityReceived: number; franchiseSupplyId?: string }>;
  idempotencyKey?: string;
  note?: string;
};
