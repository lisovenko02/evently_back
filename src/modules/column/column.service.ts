import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateColumnDto } from './dto/create-column.dto';
import { UpdateColumnDto } from './dto/update-column.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ReorderColumnsDto } from './dto/reorder-columns.dto';

@Injectable()
export class ColumnService {
  constructor(private readonly prisma: PrismaService) {}

  async createColumn(boardId: number, dto: CreateColumnDto) {
    const count = await this.prisma.taskColumn.count({
      where: { boardId },
    });

    return this.prisma.taskColumn.create({
      data: {
        ...dto,
        order: dto.order ?? count,
        boardId,
      },
    });
  }

  async updateColumnTitle(columnId: number, title: string) {
    return this.prisma.taskColumn.update({
      where: { id: columnId },
      data: { title },
    });
  }

  async reorderColumns(dto: ReorderColumnsDto) {
    const ids = dto.columns.map((col) => col.id);
    const existingColumns = await this.prisma.taskColumn.findMany({
      where: { id: { in: ids } },
      select: { id: true },
    });

    const existingIds = existingColumns.map((col) => col.id);
    const missingIds = ids.filter((id) => !existingIds.includes(id));

    if (missingIds.length > 0) {
      throw new NotFoundException(
        `Columns with IDs not found: ${missingIds.join(', ')}`,
      );
    }

    const updates = dto.columns.map(({ id, order }) =>
      this.prisma.taskColumn.update({
        where: { id },
        data: { order },
      }),
    );

    return this.prisma.$transaction(updates);
  }

  async deleteColumn(columnId: number) {
    return this.prisma.taskColumn.delete({
      where: { id: columnId },
    });
  }
}
