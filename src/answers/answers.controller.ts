import {
  Controller,
  Post,
  Patch,
  Get,
  Param,
  Body,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AnswersService } from './answers.service';
import { CreateAnswerDto } from './dto/create-answer.dto';
import { Answer } from './interfaces/answer.interface';

@Controller('answers')
export class AnswersController {
  constructor(private readonly answersService: AnswersService) {}

  @Post('/questions/:id/answers')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async createAnswer(
    @Param('id') questionId: number,
    @Body() data: CreateAnswerDto,
  ): Promise<Answer> {
    return this.answersService.createAnswer(Number(questionId), data);
  }

  @Patch(':id/mark-correct')
  async markCorrect(@Param('id') id: number): Promise<Answer> {
    return this.answersService.markCorrect(Number(id));
  }

  @Get(':id/statistics')
  async getStatistics(@Param('id') id: number) {
    return this.answersService.getStatistics(Number(id));
  }

  @Post(':id/vote')
  async vote(
    @Param('id') id: number,
    @Body() data: { userId: number; value: number },
  ) {
    return this.answersService.vote(Number(id), data);
  }
}
