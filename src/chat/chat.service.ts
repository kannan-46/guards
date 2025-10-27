import { PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { Injectable } from '@nestjs/common';
import { DynamoService } from 'src/dynamo/dynamo.service';
import { GeminiService } from 'src/gemini/gemini.service';
import { v4 as uuid } from 'uuid';

export interface Chat {
  chatId: string;
  title: string;
  createdAt: string;
  lastMessageAt: string;
  messageCount: number;
}
@Injectable()
export class ChatService {
  constructor(
    private readonly client: DynamoService,
    private readonly gemini: GeminiService,
  ) {}
  //CHAT
  async createChat(userId: string, title: string | 'New Chat'): Promise<Chat> {
    const chatId = uuid();
    const now = new Date().toISOString();
    const item = {
      PK: `USER#${userId}`,
      SK: `CHAT#${chatId}`,
      GSIPK: `USER#`,
      userId,
      chatId,
      title,
      createdAt: now,
      lastMessageAt: now,
      messageCount: 0,
    };
    await this.client.client.send(
      new PutCommand({
        TableName: 'bot',
        Item: item,
      }),
    );
    return item;
  }

  async getUserChats(userId: string, chatId: string) {
    const res = await this.client.client.send(
      new QueryCommand({
        TableName: 'bot',
        KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
        ExpressionAttributeValues: {
          ':pk': `USER#${userId}`,
          ':sk': `CHAT#${chatId}#MSG#`,
        },
      }),
    );
    return res.Items || [];
  }


  //MESSAGE
  async saveChatMessage(
    userId: string,
    chatId: string,
    role: string,
    content: string,
  ) {
    const now = new Date().toISOString();
    const item = {
      PK: `USER#${userId}`,
      SK: `CHAT#${chatId}#MSG#${now}`,
      userId,
      chatId,
      role,
      content,
    };
    await this.client.client.send(
      new PutCommand({
        TableName: 'bot',
        Item: item,
      }),
    );
    return item;
  }

  async getChatMessage(userId: string, chatId: string) {
    const res = await this.client.client.send(
      new QueryCommand({
        TableName: 'bot',
        KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
        ExpressionAttributeValues: {
          ':pk': `USER#${userId}`,
          ':sk': `CHAT#${chatId}#MSG#`,
        },
      }),
    );
    return res.Items || [];
  }
}
