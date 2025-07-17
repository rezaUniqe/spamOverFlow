import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  UsePipes,
  ValidationPipe,
  UseGuards,
  Req,
} from '@nestjs/common';
import { QuestionsService } from './questions.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { Question } from './interfaces/question.interface';
import { AuthGuard } from '@nestjs/passport';

@Controller('questions')
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async createQuestion(
    @Body() data: CreateQuestionDto,
    @Req() req,
  ): Promise<Question> {
    // Use user id from JWT
    return this.questionsService.createQuestion({
      ...data,
      userId: req.user.id,
    });
  }

  @Get()
  async getQuestions(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('tag') tag?: string,
  ) {
    return this.questionsService.getQuestions(page, limit, tag);
  }

  @Get(':id')
  async getQuestion(@Param('id') id: number) {
    return this.questionsService.getQuestion(Number(id));
  }

  @Post(':id/tags')
  @UseGuards(AuthGuard('jwt'))
  async assignTags(
    @Param('id') id: number,
    @Body() body: { tagIds: number[] },
  ) {
    return this.questionsService.assignTags(Number(id), body.tagIds);
  }
}
