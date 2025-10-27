import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { DynamoModule } from 'src/dynamo/dynamo.module';
import { GeminiModule } from 'src/gemini/gemini.module';

@Module({
  providers: [ChatService],
  controllers: [ChatController],
  exports:[ChatService],
  imports:[DynamoModule,GeminiModule]
})
export class ChatModule {}
