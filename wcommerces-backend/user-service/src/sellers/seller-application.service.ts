import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, ROLE, SellerApplicationStatus } from '@prisma/client';
import { IdDTO } from './dto/id.request.dto';
import { CreateSellerApplicationDto } from './dto/create-seller-application.request.dto';
import { ListSellerApplicationDto } from './dto/list-seller-application.request.dto';

@Injectable()
export class SellerApplicationService {
  constructor(private readonly prisma: PrismaService) {}

  private selectShape = {
    id: true,
    userId: true,
    storeName: true,
    description: true,
    status: true,
    submittedAt: true,
    user: {
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    },
  } as const;

  async create(dto: CreateSellerApplicationDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: dto.userId },
    });
    if (!user) {
      throw new RpcException(
        new NotFoundException('User not found').getResponse(),
      );
    }
    if (user.role === ROLE.SELLER) {
      throw new RpcException(
        new ConflictException('User is already a seller').getResponse(),
      );
    }

    const pending = await this.prisma.sellerApplication.findFirst({
      where: { userId: dto.userId, status: SellerApplicationStatus.PENDING },
    });
    if (pending) {
      throw new RpcException(
        new ConflictException(
          'A pending application already exists',
        ).getResponse(),
      );
    }

    const created = await this.prisma.sellerApplication.create({
      data: {
        userId: dto.userId,
        storeName: dto.storeName.trim(),
        description: dto.description?.trim() || undefined,
        status: SellerApplicationStatus.PENDING,
      },
      select: this.selectShape,
    });

    return created;
  }

  async getById(dto: IdDTO) {
    const app = await this.prisma.sellerApplication.findUnique({
      where: { id: dto.id },
      select: this.selectShape,
    });
    if (!app) {
      throw new RpcException(
        new NotFoundException('Seller application not found').getResponse(),
      );
    }
    return app;
  }

  async getLatestByUser(dto: IdDTO) {
    const app = await this.prisma.sellerApplication.findFirst({
      where: { userId: dto.id },
      orderBy: { submittedAt: 'desc' },
      select: this.selectShape,
    });
    if (!app) {
      console.log('a error!');
      throw new RpcException(
        new NotFoundException('Seller application not found').getResponse(),
      );
    }
    return app;
  }

  async list(dto: ListSellerApplicationDto) {
    // assume dto.page/pageSize already coerced to numbers by ValidationPipe
    const page = dto.page ?? 1;
    const pageSize = dto.pageSize ?? 10;

    const where: Prisma.SellerApplicationWhereInput = dto.status
      ? { status: dto.status as SellerApplicationStatus }
      : {};

    const allGroups = await this.prisma.sellerApplication.groupBy({
      by: ['userId'],
      where,
      _max: { submittedAt: true },
    });
    const total = allGroups.length;

    const pageGroups = await this.prisma.sellerApplication.groupBy({
      by: ['userId'],
      where,
      _max: { submittedAt: true },
      orderBy: { _max: { submittedAt: 'desc' } },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    if (pageGroups.length === 0) {
      return {
        data: [],
        meta: {
          total,
          page,
          pageSize,
          totalPages: Math.max(1, Math.ceil(total / pageSize)),
        },
      };
    }

    const ors = pageGroups.map((g) => ({
      userId: g.userId,
      submittedAt: g._max.submittedAt!,
    }));

    const data = await this.prisma.sellerApplication.findMany({
      where: { OR: ors },
      select: this.selectShape,
      orderBy: { submittedAt: 'desc' },
    });

    return {
      data,
      meta: {
        total,
        page,
        pageSize,
        totalPages: Math.max(1, Math.ceil(total / pageSize)),
      },
    };
  }

  async approve(dto: IdDTO) {
    const app = await this.prisma.sellerApplication.findUnique({
      where: { id: dto.id },
      select: {
        id: true,
        userId: true,
        status: true,
        storeName: true,
        description: true,
      },
    });
    if (!app) {
      throw new RpcException(
        new NotFoundException('Seller application not found').getResponse(),
      );
    }
    if (app.status !== SellerApplicationStatus.PENDING) {
      throw new RpcException(
        new BadRequestException(
          'Only PENDING applications can be approved',
        ).getResponse(),
      );
    }

    const result = await this.prisma.$transaction(async (tx) => {
      const updatedApp = await tx.sellerApplication.update({
        where: { id: app.id },
        data: { status: SellerApplicationStatus.APPROVED },
        select: this.selectShape,
      });

      await tx.user.update({
        where: { id: app.userId },
        data: { role: ROLE.SELLER },
      });

      const existingProfile = await tx.sellerProfile.findUnique({
        where: { userId: app.userId },
      });
      if (!existingProfile) {
        await tx.sellerProfile.create({
          data: {
            userId: app.userId,
            storeName: app.storeName,
            description: app.description,
          },
        });
      }

      return updatedApp;
    });

    return result;
  }

  async reject(dto: IdDTO) {
    const app = await this.prisma.sellerApplication.findUnique({
      where: { id: dto.id },
      select: { id: true, userId: true, status: true },
    });
    if (!app) {
      throw new RpcException(
        new NotFoundException('Seller application not found').getResponse(),
      );
    }
    if (app.status !== SellerApplicationStatus.PENDING) {
      throw new RpcException(
        new BadRequestException(
          'Only PENDING applications can be rejected',
        ).getResponse(),
      );
    }

    const updated = await this.prisma.sellerApplication.update({
      where: { id: app.id },
      data: { status: SellerApplicationStatus.REJECTED },
      select: this.selectShape,
    });

    return updated;
  }
}
