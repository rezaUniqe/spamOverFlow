import {
  Controller,
  Get,
  Post,
  Body,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { TagsService } from './tags.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { Tag } from './interfaces/tag.interface';

@Controller('tags')
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async createTag(@Body() data: CreateTagDto): Promise<Tag> {
    return this.tagsService.createTag(data);
  }

  @Get()
  async getTags(): Promise<Tag[]> {
    return this.tagsService.getTags();
  }
}
