import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UserService } from './user/user.service';
import { UserController } from './user/user.controller';
import { UserSchema } from './schemas/user.schema';
import { OrganizationService } from './organization/organization.service';
import { OrganizationController } from './organization/organization.controller';
import { ProjectService } from './project/project.service';
import { TaskService } from './task/task.service';
import { EntryService } from './entry/entry.service';
import { ProjectController } from './project/project.controller';
import { TaskController } from './task/task.controller';
import { EntryController } from './entry/entry.controller';
import { OrganizationSchema } from './schemas/organization.schema';
import { EntrySchema } from './schemas/entry.schema';
import { TaskSchema } from './schemas/task.schema';
import { ProjectSchema } from './schemas/project.schema';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017/timeqi'),
    MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
    MongooseModule.forFeature([
      { name: 'Organization', schema: OrganizationSchema },
    ]),
    MongooseModule.forFeature([{ name: 'Project', schema: ProjectSchema }]),
    MongooseModule.forFeature([{ name: 'Task', schema: TaskSchema }]),
    MongooseModule.forFeature([{ name: 'Entry', schema: EntrySchema }]),
  ],
  controllers: [
    AppController,
    UserController,
    OrganizationController,
    ProjectController,
    TaskController,
    EntryController,
  ],
  providers: [
    AppService,
    UserService,
    OrganizationService,
    ProjectService,
    TaskService,
    EntryService,
  ],
})
export class AppModule {}
