import { Injectable } from '@nestjs/common';
import {
  DynamoDBDocumentClient,
  PutCommand,
  QueryCommand,
} from '@aws-sdk/lib-dynamodb';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
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
}
