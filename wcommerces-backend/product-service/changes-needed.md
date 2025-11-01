# Changes needed for product.services.ts

1. Update the service dependencies and imports:

```typescript
import { UserClientService } from '../user-client/user-client.service';
import { Prisma, type ProductImage } from '@prisma/client';

@Injectable()
export class ProductService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userClient: UserClientService,
  ) {
    // ... rest of constructor
  }
}
```

2. Update the mapToProductResponse method:

```typescript
  private async mapToProductResponse(
    product: Prisma.ProductGetPayload<{
      include: { images: true };
    }>,
  ): Promise<ProductResponseDTO> {
    const response = new ProductResponseDTO();
    response.id = product.id;
    response.sellerId = product.sellerId;
    response.name = product.name;
    response.description = product.description;
    response.stock = product.stock;
    response.price = product.price;
    response.images = product.images.map((img: ProductImage) => {
      const imageDto = new ProductImageDTO();
      imageDto.id = img.id;
      imageDto.productId = img.productId;
      imageDto.mimeType = img.mimeType;
      imageDto.createdAt = img.createdAt.toISOString();
      imageDto.dataBase64 = img.data;
      return imageDto;
    });

    try {
      response.seller = await this.userClient.getSellerById(product.sellerId);
    } catch (error) {
      console.warn(`Failed to fetch seller details for ID ${product.sellerId}:`, error);
    }

    return response;
  }
```

3. Update the create method's seller validation:

```typescript
  async create(dto: CreateProductDTO, images?: ImageFile[]): Promise<ProductResponseDTO> {
    if (!dto.sellerId?.trim()) {
      throw new RpcException(
        new BadRequestException('sellerId is required').getResponse(),
      );
    }

    const sellerExists = await this.userClient.validateSeller(dto.sellerId);
    if (!sellerExists) {
      throw new RpcException(
        new BadRequestException('Invalid seller ID').getResponse(),
      );
    }

    // ... rest of create method
  }
```

4. Update all method return types to handle async mapToProductResponse:

```typescript
  async getById(id: string): Promise<ProductResponseDTO> {
    // ... existing code ...
    return await this.mapToProductResponse(product);
  }

  async listAll(dto: ProductsListRequestDTO): Promise<PaginatedResponse<ProductResponseDTO>> {
    // ... existing code ...
    return {
      data: await Promise.all(products.map((p) => this.mapToProductResponse(p))),
      meta: { ... }
    };
  }

  async listBySeller(dto: ProductSellerListRequestDTO): Promise<PaginatedResponse<ProductResponseDTO>> {
    // ... existing code ...
    return {
      data: await Promise.all(products.map((p) => this.mapToProductResponse(p))),
      meta: { ... }
    };
  }

  async update(id: string, dto: UpdateProductDTO): Promise<ProductResponseDTO> {
    // ... existing code ...
    return await this.mapToProductResponse(product);
  }

  async replaceImages(productId: string, images: ImageFile[]): Promise<ProductResponseDTO> {
    // ... existing code ...
    return await this.mapToProductResponse(updated);
  }
```
