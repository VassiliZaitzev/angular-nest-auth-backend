import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';


import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    AuthModule,
    ConfigModule.forRoot(),
    MongooseModule.forRoot(process.env.MONGO_URI, {dbName: process.env.MONGO_DN_NAME})
  ],
  controllers: [],
  providers: [],
})
export class AppModule {
  constructor(){
    console.log()
  }
}
