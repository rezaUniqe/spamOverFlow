import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { Question } from './interfaces/question.interface';

@Injectable()
export class QuestionsService {
  constructor(private readonly prisma: PrismaService) {}

  async createQuestion(data: CreateQuestionDto): Promise<Question> {
    // Check if user exists
    const user = await this.prisma.user.findUnique({
      where: { id: data.userId },
    });
    if (!user) {
      throw new BadRequestException('User does not exist');
    }
    return this.prisma.question.create({ data });
  }

  async getQuestions(page = 1, limit = 10, tag?: string) {
    const skip = (page - 1) * limit;
    if (tag) {
      return this.prisma.question.findMany({
        skip,
        take: Number(limit),
        where: {
          tags: {
            some: {
              tag: {
                name: tag,
              },
            },
          },
        },
        include: { tags: { include: { tag: true } } },
      });
    }
    return this.prisma.question.findMany({
      skip,
      take: Number(limit),
      include: { tags: { include: { tag: true } } },
    });
  }

  async getQuestion(id: number) {
    const question = await this.prisma.question.findUnique({
      where: { id },
      include: { answers: true },
    });
    if (!question) throw new NotFoundException('Question not found');
    return {
      ...question,
      answersCount: question.answers.length,
    };
  }

  async assignTags(id: number, tagIds: number[]) {
    const questionId = id;
    // Check if question exists
    const question = await this.prisma.question.findUnique({
      where: { id: questionId },
    });
    if (!question) throw new NotFoundException('Question not found');
    // Remove existing tags and add new ones
    await this.prisma.questionTag.deleteMany({ where: { questionId } });
    const connect = tagIds.map((tagId) => ({ tagId, questionId }));
    await this.prisma.questionTag.createMany({ data: connect });
    return { success: true };
  }
}
