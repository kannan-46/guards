import { Content } from '@google/generative-ai';
import { Injectable } from '@nestjs/common';
import { json } from 'express';
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
    chatId: string | undefined,
    websearch: boolean|undefined,
    temperature: number|undefined,
  ): AsyncGenerator<string> {
    try {
      let currentChatId = chatId;

      if (!currentChatId) {
        const title = prompt.slice(0, 20) + '...';
        const newChat = await this.client.createChat(userId, title);
        currentChatId = newChat.chatId;
        console.log(`created new chat with id: ${currentChatId}`);
        yield JSON.stringify({ newChatId: currentChatId });
      }

      const chatMessages = await this.client.getChatMessage(
        userId,
        currentChatId,
      );
      console.log(
        `Retrieved ${chatMessages.length} for chatId ${currentChatId}`,
      );

      const history: Content[] = chatMessages.slice(-20).map((item) => ({
        role: item.role as 'user' | 'model',
        parts: [{ text: item.content }],
      }));

      await this.client.saveChatMessage(userId, currentChatId, 'user', prompt);
      console.log('user message saved to DB');

      const finalWebSearch=websearch??false
      const finalTemperature=temperature??0.5
      const stream = this.gemini.generateTextStream(
        prompt,
        history,
        finalTemperature,
        finalWebSearch,
      );
      let fullResponse = '';
      for await (const chunk of stream) {
        fullResponse += chunk;
        yield chunk;
      }
      if (fullResponse.trim()) {
        await this.client.saveChatMessage(
          userId,
          currentChatId,
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
