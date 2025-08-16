import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
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
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { ConfigModule } from '@nestjs/config';
import { UserSchema } from './schemas/user.schema';
import { TimeOffController } from './time-off/time-off.controller';
import { TimeOffService } from './time-off/time-off.service';
import { TimeOffSchema } from './schemas/time-off.schema';
import { ProjectUserController } from './project-user/project-user.controller';
import { ProjectUserService } from './project-user/project-user.service';
import { ProjectUserSchema } from './schemas/project.user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
    MongooseModule.forRoot('mongodb://localhost:27017/timeqi'),
    MongooseModule.forFeature([
      { name: 'Organization', schema: OrganizationSchema },
    ]),
    MongooseModule.forFeature([{ name: 'Project', schema: ProjectSchema }]),
    MongooseModule.forFeature([{ name: 'Task', schema: TaskSchema }]),
    MongooseModule.forFeature([{ name: 'Entry', schema: EntrySchema }]),
    MongooseModule.forFeature([{ name: 'TimeOff', schema: TimeOffSchema }]),
    MongooseModule.forFeature([
      { name: 'ProjectUser', schema: ProjectUserSchema },
    ]),
    AuthModule,
    UserModule,
    ConfigModule.forRoot({
      isGlobal: true, // Makes the ConfigModule available globally
    }),
  ],
  controllers: [
    AppController,
    OrganizationController,
    ProjectController,
    TaskController,
    EntryController,
    TimeOffController,
    ProjectUserController,
  ],
  providers: [
    AppService,
    OrganizationService,
    ProjectService,
    TaskService,
    EntryService,
    TimeOffService,
    ProjectUserService,
  ],
})
export class AppModule {}
