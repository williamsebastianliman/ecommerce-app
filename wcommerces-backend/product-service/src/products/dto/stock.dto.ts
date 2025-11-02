export interface StockIncrementItem {
  productId: string;
  delta: number;
}

export interface StockIncrementResponse {
  updated: Array<{
    id: string;
    stock: number;
  }>;
  count: number;
}
