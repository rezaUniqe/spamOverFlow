import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';

const mockUsersService = {
  createUser: jest.fn(),
  getUsers: jest.fn(),
};

describe('UsersController', () => {
  let controller: UsersController;
  let service: typeof mockUsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createUser', () => {
    it('should call UsersService.createUser with correct data', async () => {
      const dto: CreateUserDto = { email: 'test@example.com', password: 'secret' };
      const user = { id: 1, email: 'test@example.com', password: 'secret', createdAt: new Date() };
      service.createUser.mockResolvedValue(user);
      const result = await controller.createUser(dto);
      expect(result).toEqual(user);
      expect(service.createUser).toHaveBeenCalledWith(dto);
    });
  });

  describe('getUsers', () => {
    it('should return all users', async () => {
      const users = [
        { id: 1, email: 'a@example.com', password: 'a', createdAt: new Date() },
        { id: 2, email: 'b@example.com', password: 'b', createdAt: new Date() },
      ];
      service.getUsers.mockResolvedValue(users);
      const result = await controller.getUsers();
      expect(result).toEqual(users);
      expect(service.getUsers).toHaveBeenCalled();
    });
  });
});
