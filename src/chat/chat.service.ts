import { Content } from '@google/generative-ai';
import { Injectable } from '@nestjs/common';
import { DynamoService } from 'src/dynamo/dynamo.service';
import { GeminiService } from 'src/gemini/gemini.service';

@Injectable()
export class ChatService {
  constructor(
    private readonly client: DynamoService,
    private readonly gemini: GeminiService,
  ) {}

  async createChat(userId: string, title: string) {
    const chat = await this.client.createChat(userId, title || 'New Chat');
    console.log(`CHAT CREATED FOR USER ${userId} WITH TITLE ${title}`);
    return chat;
  }

  async *generateStreamWithHistory(
    prompt: string,
    userId: string,
    chatId: string,
    websearch: boolean,
    temperature: number,
  ): AsyncGenerator<string> {
    try {
      const chatMessages = await this.client.getChatMessage(userId, chatId);
      console.log(`Retrieved ${chatMessages.length} for chatId ${chatId}`);

      const history: Content[] = chatMessages.slice(-20).map((item) => ({
        role: item.role as 'user' | 'model',
        parts: [{ text: item.content }],
      }));

      await this.client.saveChatMessage(userId, chatId, 'user', prompt);
      console.log('user message saved to DB');

      const stream = this.gemini.generateTextStream(
        prompt,
        history,
        temperature,
        websearch,
      );
      let fullResponse = '';
      for await (const chunk of stream) {
        fullResponse += chunk;
        yield chunk;
      }
      if (fullResponse.trim()) {
        await this.client.saveChatMessage(
          userId,
          chatId,
          'model',
          fullResponse.trim(),
        );
        console.log('model response saved to DB');
      }
    } catch (error) {
      console.error('stream generation error', error);
      yield `Error: ${error.message}`;
    }
  }
}
