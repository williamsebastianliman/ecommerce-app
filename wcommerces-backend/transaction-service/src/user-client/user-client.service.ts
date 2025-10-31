import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, timeout } from 'rxjs';

type IdDTO = { id: string };

export interface UserResponseDTO {
  id: string;
  email: string;
  name: string;
  address: string;
  role: 'USER' | 'ADMIN' | 'SELLER';
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface SellerProfileResponseDTO {
  id: string;
  userId: string;
  storeName: string;
  description?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
}

@Injectable()
export class UserClientService {
  constructor(@Inject('USER_CLIENT') private readonly client: ClientProxy) {}

  async getById(id: string): Promise<UserResponseDTO> {
    return await firstValueFrom(
      this.client
        .send<UserResponseDTO, IdDTO>('user.getById', { id })
        .pipe(timeout(5000)),
    );
  }

  async getSellerProfileByUserId(
    userId: string,
  ): Promise<SellerProfileResponseDTO | null> {
    try {
      return await firstValueFrom(
        this.client
          .send<
            SellerProfileResponseDTO,
            IdDTO
          >('sellerProfile.getByUserId', { id: userId })
          .pipe(timeout(5000)),
      );
    } catch {
      return null;
    }
  }

  async getDisplayName(userId: string): Promise<string> {
    const profile = await this.getSellerProfileByUserId(userId);
    if (profile && profile.storeName?.trim()) return profile.storeName;
    const user = await this.getById(userId);
    return user.name ?? '';
  }

  async getManyByIds(ids: string[]): Promise<Map<string, UserResponseDTO>> {
    const unique = Array.from(new Set(ids.filter(Boolean)));

    const results = await Promise.all(
      unique.map(async (id) => {
        try {
          const u = await this.getById(id);
          return { id, u };
        } catch {
          return null;
        }
      }),
    );

    const tuples: [string, UserResponseDTO][] = [];
    for (const r of results) {
      if (r) tuples.push([r.id, r.u]);
    }
    return new Map(tuples);
  }

  async getDisplayNames(ids: string[]): Promise<Map<string, string>> {
    const unique = Array.from(new Set(ids.filter(Boolean)));
    const entries = await Promise.all(
      unique.map(async (id) => {
        try {
          const name = await this.getDisplayName(id);
          return [id, name] as [string, string];
        } catch {
          return [id, ''] as [string, string];
        }
      }),
    );
    return new Map(entries);
  }
}
