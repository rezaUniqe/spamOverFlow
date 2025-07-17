import { Test, TestingModule } from '@nestjs/testing';
import { AnswersService } from './answers.service';
import { PrismaService } from '../prisma.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('AnswersService', () => {
  let service: AnswersService;
  let prisma: PrismaService;
  const mockUser = { id: 1 };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnswersService,
        {
          provide: PrismaService,
          useValue: {
            question: { findUnique: jest.fn() },
            user: { findUnique: jest.fn() },
            answer: {
              findUnique: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
            },
            vote: {
              findMany: jest.fn(),
              upsert: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<AnswersService>(AnswersService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createAnswer', () => {
    it('should create answer if question and user exist', async () => {
      (prisma.question.findUnique as jest.Mock).mockResolvedValue({ id: 1 });
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: 1 });
      (prisma.answer.create as jest.Mock).mockResolvedValue({ id: 1, content: 'A', questionId: 1, userId: 1, isCorrect: false, createdAt: new Date() });
      const result = await service.createAnswer(1, { content: 'A', userId: 1 });
      expect(result.content).toBe('A');
    });
    it('should throw NotFoundException if question not found', async () => {
      (prisma.question.findUnique as jest.Mock).mockResolvedValue(null);
      await expect(service.createAnswer(1, { content: 'A', userId: 1 })).rejects.toThrow(NotFoundException);
    });
    it('should throw BadRequestException if user not found', async () => {
      (prisma.question.findUnique as jest.Mock).mockResolvedValue({ id: 1 });
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      await expect(service.createAnswer(1, { content: 'A', userId: 1 })).rejects.toThrow(BadRequestException);
    });
  });

  describe('markCorrect', () => {
    it('should mark answer as correct if found and user is owner', async () => {
      (prisma.answer.findUnique as jest.Mock).mockResolvedValue({ id: 1, question: { userId: 1 } });
      (prisma.answer.update as jest.Mock).mockResolvedValue({ id: 1, isCorrect: true });
      const result = await service.markCorrect(1, mockUser);
      expect(result.isCorrect).toBe(true);
    });
    it('should throw NotFoundException if answer not found', async () => {
      (prisma.answer.findUnique as jest.Mock).mockResolvedValue(null);
      await expect(service.markCorrect(1, mockUser)).rejects.toThrow(NotFoundException);
    });
  });

  describe('getStatistics', () => {
    it('should return total votes', async () => {
      (prisma.vote.findMany as jest.Mock).mockResolvedValue([{ value: 1 }, { value: -1 }, { value: 1 }]);
      const result = await service.getStatistics(1);
      expect(result.totalVotes).toBe(1);
    });
  });

  describe('vote', () => {
    it('should upsert vote if answer and user exist', async () => {
      (prisma.answer.findUnique as jest.Mock).mockResolvedValue({ id: 1 });
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: 1 });
      (prisma.vote.upsert as jest.Mock).mockResolvedValue({ value: 1 });
      const result = await service.vote(1, { userId: 1, value: 1 });
      expect(result.value).toBe(1);
    });
    it('should throw NotFoundException if answer not found', async () => {
      (prisma.answer.findUnique as jest.Mock).mockResolvedValue(null);
      await expect(service.vote(1, { userId: 1, value: 1 })).rejects.toThrow(NotFoundException);
    });
    it('should throw BadRequestException if user not found', async () => {
      (prisma.answer.findUnique as jest.Mock).mockResolvedValue({ id: 1 });
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      await expect(service.vote(1, { userId: 1, value: 1 })).rejects.toThrow(BadRequestException);
    });
  });
});
