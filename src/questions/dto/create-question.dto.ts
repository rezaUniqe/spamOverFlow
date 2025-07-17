import { IsString, MinLength, IsInt } from 'class-validator';

export class CreateQuestionDto {
  @IsString()
  @MinLength(5)
  title: string;

  @IsString()
  @MinLength(10)
  content: string;

  @IsInt()
  userId: number;
}
