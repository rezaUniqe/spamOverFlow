import { Controller, Post, Patch, Get, Param, Body, UsePipes, ValidationPipe, UseGuards, Req } from '@nestjs/common';
import { AnswersService } from './answers.service';
import { CreateAnswerDto } from './dto/create-answer.dto';
import { Answer } from './interfaces/answer.interface';
import { AuthGuard } from '@nestjs/passport';

@Controller('answers')
export class AnswersController {
  constructor(private readonly answersService: AnswersService) {}

  @Post('/questions/:id/answers')
  @UseGuards(AuthGuard('jwt'))
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async createAnswer(@Param('id') questionId: number, @Body() data: CreateAnswerDto, @Req() req): Promise<Answer> {
    // Use user id from JWT
    return this.answersService.createAnswer(Number(questionId), { ...data, userId: req.user.id });
  }

  @Patch(':id/mark-correct')
  @UseGuards(AuthGuard('jwt'))
  async markCorrect(@Param('id') id: number, @Req() req): Promise<Answer> {
    // Pass user to service for owner check
    return this.answersService.markCorrect(Number(id), req.user);
  }

  @Get(':id/statistics')
  async getStatistics(@Param('id') id: number) {
    return this.answersService.getStatistics(Number(id));
  }

  @Post(':id/vote')
  @UseGuards(AuthGuard('jwt'))
  async vote(@Param('id') id: number, @Body() data: { userId: number; value: number }, @Req() req) {
    // Use user id from JWT
    return this.answersService.vote(Number(id), { userId: req.user.id, value: data.value });
  }
}
