import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, timeout } from 'rxjs';
import { SellerResponseDTO } from './dto/seller.response.dto';

@Injectable()
export class UserClientService {
  constructor(@Inject('USER_CLIENT') private readonly client: ClientProxy) {}

  async getSellerById(id: string): Promise<SellerResponseDTO> {
    return await firstValueFrom(
      this.client
        .send<SellerResponseDTO, { id: string }>('seller.getById', { id })
        .pipe(timeout(5000)),
    );
  }

  async validateSeller(id: string): Promise<boolean> {
    try {
      await this.getSellerById(id);
      return true;
    } catch {
      return false;
    }
  }
}
