import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UserService } from './user/user.service';
import { UserController } from './user/user.controller';
import { UserSchema } from './schemas/user.schema';

@Module({
	imports: [
		MongooseModule.forRoot('mongodb://localhost:27017/timeqi'),
		MongooseModule.forFeature([
			{ name: 'User', schema: UserSchema }
		])
	],
	controllers: [AppController, UserController],
	providers: [AppService, UserService],
})
export class AppModule { }
