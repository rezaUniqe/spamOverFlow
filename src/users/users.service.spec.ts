import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma.service';
import { BadRequestException } from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
              create: jest.fn(),
              findMany: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createUser', () => {
    it('should create a user if email is not taken', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.user.create as jest.Mock).mockResolvedValue({ id: 1, email: 'test@example.com', password: 'secret', createdAt: new Date() });

      const result = await service.createUser({ email: 'test@example.com', password: 'secret' });
      expect(result.email).toBe('test@example.com');
      expect(prisma.user.create).toHaveBeenCalledWith({ data: { email: 'test@example.com', password: 'secret' } });
    });

    it('should throw BadRequestException if email is already in use', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: 1, email: 'test@example.com' });

      await expect(service.createUser({ email: 'test@example.com', password: 'secret' }))
        .rejects
        .toThrow(BadRequestException);
    });
  });

  describe('getUsers', () => {
    it('should return all users', async () => {
      const users = [
        { id: 1, email: 'a@example.com', password: 'a', createdAt: new Date() },
        { id: 2, email: 'b@example.com', password: 'b', createdAt: new Date() },
      ];
      (prisma.user.findMany as jest.Mock).mockResolvedValue(users);

      const result = await service.getUsers();
      expect(result).toEqual(users);
      expect(prisma.user.findMany).toHaveBeenCalled();
    });
  });
});
