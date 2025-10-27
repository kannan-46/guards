import { Injectable } from '@nestjs/common';
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  QueryCommand,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { v4 as uuid } from 'uuid';

export interface Chat {
  chatId: string;
  title: string;
  createdAt: string;
  lastMessageAt: string;
  messageCount: number;
}
@Injectable()
export class DynamoService {
  public readonly client: DynamoDBDocumentClient;

  constructor() {
    const client = new DynamoDBClient({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_IAM_SECRET_KEY!,
      },
    });
    this.client = DynamoDBDocumentClient.from(client);
  }

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
    await this.client.send(
      new PutCommand({
        TableName: 'bot',
        Item: item,
      }),
    );
    return item;
  }

  async getUserChats(userId: string, chatId: string) {
    const res = await this.client.send(
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

  async getChat(userId: string, chatId: string) {
    const res = await this.client.send(
      new GetCommand({
        TableName: 'bot',
        Key: {
          PK: `USER#${userId}`,
          SK: `CHAT#${chatId}`,
        },
      }),
    );
    return res.Item;
  }

  async updateChatTitle(userId: string, chatId: string, newTitle: string) {
    const res = await this.client.send(
      new UpdateCommand({
        TableName: 'bot',
        Key: {
          PK: `USER#${userId}`,
          SK: `CHAT#${chatId}`,
        },
        UpdateExpression: 'SET title = :title, lastMessageAt = :now',
        ExpressionAttributeValues: {
          ':title': newTitle,
          ':now': new Date().toISOString(),
        },
      }),
    );
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
    await this.client.send(
      new PutCommand({
        TableName: 'bot',
        Item: item,
      }),
    );
    return item;
  }

  async getChatMessage(userId: string, chatId: string) {
    const res = await this.client.send(
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
