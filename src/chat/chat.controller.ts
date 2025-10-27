import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Sse,
  UseGuards,
  Param,
} from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { ChatService } from './chat.service';
import { SendMessageDto } from 'src/dto/sendMessage.dto';
import { Request } from 'express';
import { map ,from} from 'rxjs';
import { DynamoService } from 'src/dynamo/dynamo.service';

@UseGuards(AuthGuard)
@Controller('chat')
export class ChatController {
  constructor(
    private readonly chat: ChatService,
    private readonly client: DynamoService,
  ) {}

  @Post('stream')
  @Sse()
   sendMessageStream(@Body() dto: SendMessageDto, @Req() req: any) {
    const userId = req.user.sub;
    const stream =  this.chat.generateStreamWithHistory(
      dto.prompt,
      userId,
      dto.chatId,
      dto.webSearch,
      dto.temperature,
    );
    return from(stream).pipe(
      map((chunk: string) => {
        return {data:chunk}
      }),
    );
  }

  @Get('history')
  async getChatHistory(@Req() req: any) {
    const userId = req.user.sub;
    return this.client.getUserChatList(userId);
  }

  @Get('history/:chatId')
  async getChatMessages(@Req() req: any, @Param('chatId') chatId: string) {
    const userId = req.user.sub;
    return this.client.getChatMessage(userId, chatId);
  }
}
