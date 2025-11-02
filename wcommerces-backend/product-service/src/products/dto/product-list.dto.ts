export class ProductsListRequestDTO {
  page?: number;
  pageSize?: number;
  q?: string;
}

export class ProductSellerListRequestDTO extends ProductsListRequestDTO {
  sellerId!: string;
}
