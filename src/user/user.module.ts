import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { DynamoModule } from 'src/dynamo/dynamo.module';

@Module({
  providers: [UserService],
  exports:[UserService],
  imports:[DynamoModule]
})
export class UserModule {}
