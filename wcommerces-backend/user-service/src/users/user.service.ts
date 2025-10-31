import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}
  async getById(id: string) {
    console.log('test idzzz: ', id);
    const user = await this.prisma.user.findUnique({
      where: { id: id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        address: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    if (!user) {
      throw new RpcException(new NotFoundException('User Not Found!'));
    }
    return user;
  }
  async update(id: string, dto: { name: string; address: string }) {
    const { name, address } = dto;
    if (name.trim() === '' && address.trim() === '') {
      throw new RpcException(new NotFoundException('User Not Found!'));
    }

    await this.getById(id);

    return this.prisma.user.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(address !== undefined && { address }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        address: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }
}
