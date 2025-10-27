import { PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { Injectable } from '@nestjs/common';
import { createUser } from 'src/dto/createUser.dto';
import { DynamoService } from 'src/dynamo/dynamo.service';
import { v4 as uuid } from 'uuid';

@Injectable()
export class UserService {
  constructor(private readonly client: DynamoService) {}

  async createUser(dto: createUser) {
    const userId = uuid();
    const item = {
      PK: `USER#${userId}`,
      SK: 'META',
      GSIPK: `USER#`,
      userId,
      ...dto,
    };
    await this.client.client.send(
      new PutCommand({
        TableName: 'bot',
        Item: item,
      }),
    );
    return item;
  }

  async getAllUsers() {
    const res = await this.client.client.send(
      new QueryCommand({
        TableName: 'bot',
        IndexName: 'GSIPK',
        KeyConditionExpression: 'GSIPK = :gsi',
        ExpressionAttributeValues: {
          ':gsi': `USER#`,
        },
      }),
    );
    return res.Items || [];
  }

  async findByEmail(email: string) {
    const res = await this.client.client.send(
      new QueryCommand({
        TableName: 'bot',
        IndexName: 'GSIPK',
        KeyConditionExpression: 'GSIPK = :gsi',
        FilterExpression: 'email = :email',
        ExpressionAttributeValues: {
          ':gsi': 'USER#',
          ':email': email,
        },
      }),
    );
    return res.Items?.[0];
  }

  async saveUser(userItem: Record<string, any>) {
    await this.client.client.send(
      new PutCommand({
        TableName: 'bot',
        Item: userItem,
      }),
    );
    return userItem;
  }
}
