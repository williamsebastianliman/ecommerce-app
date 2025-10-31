import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { ROLE } from '@prisma/client';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async register(dto: {
    email: string;
    password: string;
    name: string;
    address: string;
  }) {
    const existEmail = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existEmail) {
      throw new RpcException(
        new BadRequestException('Email is already used!').getResponse(),
      );
    }
    const password = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        address: dto.address,
        password: password,
        name: dto.name,
        role: ROLE.USER,
      },
    });
    const token = jwt.sign(
      { sub: user.id, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: '1d' },
    );
    return {
      accessToken: token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
        address: user.address,
      },
    };
  }

  async login(dto: { email: string; password: string }) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user) {
      throw new RpcException(
        new UnauthorizedException('Invalid credentials').getResponse(),
      );
    }
    const ok = await bcrypt.compare(dto.password, user.password);
    if (!ok) {
      throw new RpcException(
        new UnauthorizedException('Invalid credentials').getResponse(),
      );
    }
    const token = jwt.sign(
      { sub: user.id, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: '1d' },
    );
    return {
      accessToken: token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
        address: user.address,
      },
    };
  }
}
