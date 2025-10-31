import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSellerProfileDto } from './dto/create-seller-profile.request.dto';
import { UpdateSellerProfileDto } from './dto/update-seller-profile.request.dto';

@Injectable()
export class SellerProfileService {
  constructor(private readonly prisma: PrismaService) {}

  async getByUserId(userId: string) {
    const profile = await this.prisma.sellerProfile.findUnique({
      where: { userId },
      select: {
        id: true,
        userId: true,
        storeName: true,
        description: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    if (!profile) {
      throw new RpcException(
        new NotFoundException('Seller profile not found').getResponse(),
      );
    }
    return profile;
  }

  async getById(id: string) {
    const profile = await this.prisma.sellerProfile.findUnique({
      where: { id },
      select: {
        id: true,
        userId: true,
        storeName: true,
        description: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    if (!profile) {
      throw new RpcException(
        new NotFoundException('Seller profile not found').getResponse(),
      );
    }
    return profile;
  }

  async create(dto: CreateSellerProfileDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: dto.userId },
    });
    if (!user) {
      throw new RpcException(
        new NotFoundException('User not found').getResponse(),
      );
    }

    const exist = await this.prisma.sellerProfile.findUnique({
      where: { userId: dto.userId },
    });
    if (exist) {
      throw new RpcException(
        new ConflictException('Seller profile already exists').getResponse(),
      );
    }

    const profile = await this.prisma.sellerProfile.create({
      data: {
        userId: dto.userId,
        storeName: dto.storeName.trim(),
        description: dto.description?.trim() || undefined,
      },
      select: {
        id: true,
        userId: true,
        storeName: true,
        description: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return profile;
  }

  async update(dto: UpdateSellerProfileDto) {
    if (
      (dto.storeName === undefined || dto.storeName.trim() === '') &&
      (dto.description === undefined || dto.description.trim() === '')
    ) {
      throw new RpcException(
        new BadRequestException('No fields to update').getResponse(),
      );
    }

    await this.getByUserId(dto.userId);

    const updated = await this.prisma.sellerProfile.update({
      where: { userId: dto.userId },
      data: {
        ...(dto.storeName !== undefined && { storeName: dto.storeName.trim() }),
        ...(dto.description !== undefined && {
          description: dto.description.trim(),
        }),
      },
      select: {
        id: true,
        userId: true,
        storeName: true,
        description: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return updated;
  }

  async removeByUserId(userId: string) {
    await this.getByUserId(userId);

    await this.prisma.sellerProfile.delete({ where: { userId } });
    return { ok: true };
  }
}
