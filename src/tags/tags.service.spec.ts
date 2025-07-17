import { Test, TestingModule } from '@nestjs/testing';
import { TagsService } from './tags.service';
import { PrismaService } from '../prisma.service';
import { BadRequestException } from '@nestjs/common';

describe('TagsService', () => {
  let service: TagsService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TagsService,
        {
          provide: PrismaService,
          useValue: {
            tag: {
              findUnique: jest.fn(),
              create: jest.fn(),
              findMany: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<TagsService>(TagsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createTag', () => {
    it('should create a tag if name is not taken', async () => {
      (prisma.tag.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.tag.create as jest.Mock).mockResolvedValue({ id: 1, name: 'nestjs' });

      const result = await service.createTag({ name: 'nestjs' });
      expect(result.name).toBe('nestjs');
      expect(prisma.tag.create).toHaveBeenCalledWith({ data: { name: 'nestjs' } });
    });

    it('should throw BadRequestException if tag already exists', async () => {
      (prisma.tag.findUnique as jest.Mock).mockResolvedValue({ id: 1, name: 'nestjs' });

      await expect(service.createTag({ name: 'nestjs' }))
        .rejects
        .toThrow(BadRequestException);
    });
  });

  describe('getTags', () => {
    it('should return all tags', async () => {
      const tags = [
        { id: 1, name: 'nestjs' },
        { id: 2, name: 'prisma' },
      ];
      (prisma.tag.findMany as jest.Mock).mockResolvedValue(tags);

      const result = await service.getTags();
      expect(result).toEqual(tags);
      expect(prisma.tag.findMany).toHaveBeenCalled();
    });
  });
});
