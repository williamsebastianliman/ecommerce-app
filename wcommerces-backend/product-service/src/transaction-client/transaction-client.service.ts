import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, timeout } from 'rxjs';

@Injectable()
export class TransactionClientService {
  constructor(
    @Inject('TRANSACTION_CLIENT') private readonly client: ClientProxy,
  ) {}

  async cleanupProductFromCarts(productId: string): Promise<void> {
    await firstValueFrom(
      this.client
        .send<void, { productId: string }>('cart.removeProductFromAll', {
          productId,
        })
        .pipe(timeout(5000)),
    );
  }
}
