import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateAnswerDto } from './dto/create-answer.dto';
import { Answer } from './interfaces/answer.interface';

@Injectable()
export class AnswersService {
  constructor(private readonly prisma: PrismaService) {}

  async createAnswer(
    questionId: number,
    data: CreateAnswerDto,
  ): Promise<Answer> {
    // Check if question exists
    const question = await this.prisma.question.findUnique({
      where: { id: questionId },
    });
    if (!question) throw new NotFoundException('Question not found');
    // Check if user exists
    const user = await this.prisma.user.findUnique({
      where: { id: data.userId },
    });
    if (!user) throw new BadRequestException('User does not exist');
    return this.prisma.answer.create({ data: { ...data, questionId } });
  }

  async markCorrect(id: number): Promise<Answer> {
    // Check if answer exists
    const answer = await this.prisma.answer.findUnique({ where: { id } });
    if (!answer) throw new NotFoundException('Answer not found');
    return this.prisma.answer.update({
      where: { id },
      data: { isCorrect: true },
    });
  }

  async getStatistics(id: number) {
    const votes = await this.prisma.vote.findMany({ where: { answerId: id } });
    const totalVotes = votes.reduce((sum, v) => sum + v.value, 0);
    return { totalVotes };
  }

  async vote(id: number, data: { userId: number; value: number }) {
    // Check if answer exists
    const answer = await this.prisma.answer.findUnique({ where: { id } });
    if (!answer) throw new NotFoundException('Answer not found');
    // Check if user exists
    const user = await this.prisma.user.findUnique({
      where: { id: data.userId },
    });
    if (!user) throw new BadRequestException('User does not exist');
    // value: 1 for upvote, -1 for downvote
    return this.prisma.vote.upsert({
      where: { userId_answerId: { userId: data.userId, answerId: id } },
      update: { value: data.value },
      create: { userId: data.userId, answerId: id, value: data.value },
    });
  }
}
