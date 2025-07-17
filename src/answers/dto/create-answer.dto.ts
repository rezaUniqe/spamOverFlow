import { IsString, MinLength, IsInt } from 'class-validator';

export class CreateAnswerDto {
  @IsString()
  @MinLength(2)
  content: string;

  @IsInt()
  userId: number;
}
