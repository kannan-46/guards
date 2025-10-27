import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsNumber,
  Min,
  Max,
  IsBoolean,
} from 'class-validator';

export class SendMessageDto {
  @IsString()
  @IsNotEmpty()
  prompt: string;



  @IsUUID()
  @IsOptional()
  chatId?: string;

  @IsBoolean()
  @IsOptional()
  webSearch?: boolean;

  @IsNumber()
  @Min(0)
  @Max(2)
  @IsOptional()
  temperature?: number;
}
