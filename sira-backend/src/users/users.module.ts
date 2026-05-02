import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
<<<<<<< HEAD
import { UsersController } from './users.controller';

@Module({
  controllers: [UsersController],
=======

@Module({
>>>>>>> develop
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
