import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { Tag } from './interfaces/tag.interface';

@Injectable()
export class TagsService {
  constructor(private readonly prisma: PrismaService) {}

  async createTag(data: CreateTagDto): Promise<Tag> {
    // Check if tag already exists
    const existing = await this.prisma.tag.findUnique({
      where: { name: data.name },
    });
    if (existing) {
      throw new BadRequestException('Tag already exists');
    }
    return this.prisma.tag.create({ data });
  }

  async getTags(): Promise<Tag[]> {
    return this.prisma.tag.findMany();
  }
}
