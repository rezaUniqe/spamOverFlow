import { Test, TestingModule } from '@nestjs/testing';
import { QuestionsController } from './questions.controller';
import { QuestionsService } from './questions.service';
import { CreateQuestionDto } from './dto/create-question.dto';

const mockQuestionsService = {
  createQuestion: jest.fn(),
  getQuestions: jest.fn(),
  getQuestion: jest.fn(),
  assignTags: jest.fn(),
};

describe('QuestionsController', () => {
  let controller: QuestionsController;
  let service: typeof mockQuestionsService;
  const mockReq = { user: { id: 1 } };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [QuestionsController],
      providers: [
        {
          provide: QuestionsService,
          useValue: mockQuestionsService,
        },
      ],
    }).compile();

    controller = module.get<QuestionsController>(QuestionsController);
    service = module.get(QuestionsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createQuestion', () => {
    it('should call QuestionsService.createQuestion with correct data', async () => {
      const dto: CreateQuestionDto = { title: 'Q', content: 'C', userId: 1 };
      const question = {
        id: 1,
        title: 'Q',
        content: 'C',
        userId: 1,
        createdAt: new Date(),
      };
      service.createQuestion.mockResolvedValue(question);
      const result = await controller.createQuestion(dto, mockReq);
      expect(result).toEqual(question);
      expect(service.createQuestion).toHaveBeenCalledWith({
        ...dto,
        userId: mockReq.user.id,
      });
    });
  });

  describe('getQuestions', () => {
    it('should return questions', async () => {
      const questions = [
        { id: 1, title: 'Q', content: 'C', userId: 1, createdAt: new Date() },
      ];
      service.getQuestions.mockResolvedValue(questions);
      const result = await controller.getQuestions(1, 10, undefined);
      expect(result).toEqual(questions);
      expect(service.getQuestions).toHaveBeenCalledWith(1, 10, undefined);
    });
  });

  describe('getQuestion', () => {
    it('should return a question', async () => {
      const question = {
        id: 1,
        title: 'Q',
        content: 'C',
        userId: 1,
        createdAt: new Date(),
        answersCount: 0,
      };
      service.getQuestion.mockResolvedValue(question);
      const result = await controller.getQuestion(1);
      expect(result).toEqual(question);
      expect(service.getQuestion).toHaveBeenCalledWith(1);
    });
  });

  describe('assignTags', () => {
    it('should call QuestionsService.assignTags with correct data', async () => {
      service.assignTags.mockResolvedValue({ success: true });
      const result = await controller.assignTags(1, { tagIds: [1, 2] });
      expect(result).toEqual({ success: true });
      expect(service.assignTags).toHaveBeenCalledWith(1, [1, 2]);
    });
  });
});
