import { Test, TestingModule } from '@nestjs/testing';
import { TagsController } from './tags.controller';
import { TagsService } from './tags.service';
import { CreateTagDto } from './dto/create-tag.dto';

const mockTagsService = {
  createTag: jest.fn(),
  getTags: jest.fn(),
};

describe('TagsController', () => {
  let controller: TagsController;
  let service: typeof mockTagsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TagsController],
      providers: [
        {
          provide: TagsService,
          useValue: mockTagsService,
        },
      ],
    }).compile();

    controller = module.get<TagsController>(TagsController);
    service = module.get(TagsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createTag', () => {
    it('should call TagsService.createTag with correct data', async () => {
      const dto: CreateTagDto = { name: 'nestjs' };
      const tag = { id: 1, name: 'nestjs' };
      service.createTag.mockResolvedValue(tag);
      const result = await controller.createTag(dto);
      expect(result).toEqual(tag);
      expect(service.createTag).toHaveBeenCalledWith(dto);
    });
  });

  describe('getTags', () => {
    it('should return all tags', async () => {
      const tags = [
        { id: 1, name: 'nestjs' },
        { id: 2, name: 'prisma' },
      ];
      service.getTags.mockResolvedValue(tags);
      const result = await controller.getTags();
      expect(result).toEqual(tags);
      expect(service.getTags).toHaveBeenCalled();
    });
  });
});
