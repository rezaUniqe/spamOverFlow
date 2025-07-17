import { Test, TestingModule } from '@nestjs/testing';
import { QuestionsService } from './questions.service';
import { PrismaService } from '../prisma.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('QuestionsService', () => {
  let service: QuestionsService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuestionsService,
        {
          provide: PrismaService,
          useValue: {
            user: { findUnique: jest.fn() },
            question: {
              findUnique: jest.fn(),
              create: jest.fn(),
              findMany: jest.fn(),
            },
            questionTag: {
              deleteMany: jest.fn(),
              createMany: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<QuestionsService>(QuestionsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createQuestion', () => {
    it('should create a question if user exists', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: 1 });
      (prisma.question.create as jest.Mock).mockResolvedValue({ id: 1, title: 'Q', content: 'C', userId: 1, createdAt: new Date() });

      const result = await service.createQuestion({ title: 'Q', content: 'C', userId: 1 });
      expect(result.title).toBe('Q');
      expect(prisma.question.create).toHaveBeenCalledWith({ data: { title: 'Q', content: 'C', userId: 1 } });
    });

    it('should throw BadRequestException if user does not exist', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      await expect(service.createQuestion({ title: 'Q', content: 'C', userId: 1 }))
        .rejects
        .toThrow(BadRequestException);
    });
  });

  describe('getQuestions', () => {
    it('should return questions with tag filter', async () => {
      (prisma.question.findMany as jest.Mock).mockResolvedValue([{ id: 1, title: 'Q', tags: [] }]);
      const result = await service.getQuestions(1, 10, 'nestjs');
      expect(result).toEqual([{ id: 1, title: 'Q', tags: [] }]);
      expect(prisma.question.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        where: {
          tags: {
            some: {
              tag: {
                name: 'nestjs',
              },
            },
          },
        },
        include: { tags: { include: { tag: true } } },
      });
    });
    it('should return questions without tag filter', async () => {
      (prisma.question.findMany as jest.Mock).mockResolvedValue([{ id: 1, title: 'Q', tags: [] }]);
      const result = await service.getQuestions(1, 10);
      expect(result).toEqual([{ id: 1, title: 'Q', tags: [] }]);
      expect(prisma.question.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        include: { tags: { include: { tag: true } } },
      });
    });
  });

  describe('getQuestion', () => {
    it('should return question with answersCount if found', async () => {
      (prisma.question.findUnique as jest.Mock).mockResolvedValue({ id: 1, answers: [1, 2] });
      const result = await service.getQuestion(1);
      expect(result.answersCount).toBe(2);
    });
    it('should throw NotFoundException if not found', async () => {
      (prisma.question.findUnique as jest.Mock).mockResolvedValue(null);
      await expect(service.getQuestion(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('assignTags', () => {
    it('should assign tags if question exists', async () => {
      (prisma.question.findUnique as jest.Mock).mockResolvedValue({ id: 1 });
      (prisma.questionTag.deleteMany as jest.Mock).mockResolvedValue(undefined);
      (prisma.questionTag.createMany as jest.Mock).mockResolvedValue(undefined);
      const result = await service.assignTags(1, [1, 2]);
      expect(result).toEqual({ success: true });
    });
    it('should throw NotFoundException if question does not exist', async () => {
      (prisma.question.findUnique as jest.Mock).mockResolvedValue(null);
      await expect(service.assignTags(1, [1, 2])).rejects.toThrow(NotFoundException);
    });
  });
});
