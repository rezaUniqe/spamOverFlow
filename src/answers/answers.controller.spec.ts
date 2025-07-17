import { Test, TestingModule } from '@nestjs/testing';
import { AnswersController } from './answers.controller';
import { AnswersService } from './answers.service';
import { CreateAnswerDto } from './dto/create-answer.dto';

const mockAnswersService = {
  createAnswer: jest.fn(),
  markCorrect: jest.fn(),
  getStatistics: jest.fn(),
  vote: jest.fn(),
};

describe('AnswersController', () => {
  let controller: AnswersController;
  let service: typeof mockAnswersService;
  const mockReq = { user: { id: 1 } };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AnswersController],
      providers: [
        {
          provide: AnswersService,
          useValue: mockAnswersService,
        },
      ],
    }).compile();

    controller = module.get<AnswersController>(AnswersController);
    service = module.get(AnswersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createAnswer', () => {
    it('should call AnswersService.createAnswer with correct data', async () => {
      const dto: CreateAnswerDto = { content: 'A', userId: 1 };
      const answer = { id: 1, content: 'A', questionId: 1, userId: 1, isCorrect: false, createdAt: new Date() };
      service.createAnswer.mockResolvedValue(answer);
      const result = await controller.createAnswer(1, dto, mockReq);
      expect(result).toEqual(answer);
      expect(service.createAnswer).toHaveBeenCalledWith(1, { ...dto, userId: mockReq.user.id });
    });
  });

  describe('markCorrect', () => {
    it('should call AnswersService.markCorrect with correct id and user', async () => {
      const answer = { id: 1, isCorrect: true };
      service.markCorrect.mockResolvedValue(answer);
      const result = await controller.markCorrect(1, mockReq);
      expect(result).toEqual(answer);
      expect(service.markCorrect).toHaveBeenCalledWith(1, mockReq.user);
    });
  });

  describe('getStatistics', () => {
    it('should call AnswersService.getStatistics with correct id', async () => {
      const stats = { totalVotes: 3 };
      service.getStatistics.mockResolvedValue(stats);
      const result = await controller.getStatistics(1);
      expect(result).toEqual(stats);
      expect(service.getStatistics).toHaveBeenCalledWith(1);
    });
  });

  describe('vote', () => {
    it('should call AnswersService.vote with correct data', async () => {
      const voteResult = { value: 1 };
      service.vote.mockResolvedValue(voteResult);
      const result = await controller.vote(1, { userId: 1, value: 1 }, mockReq);
      expect(result).toEqual(voteResult);
      expect(service.vote).toHaveBeenCalledWith(1, { userId: mockReq.user.id, value: 1 });
    });
  });
});
