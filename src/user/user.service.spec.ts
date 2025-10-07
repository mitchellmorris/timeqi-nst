import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { User, UserSchema } from '../schemas/user.schema';
import { getModelToken, MongooseModule } from '@nestjs/mongoose';
import { Model } from 'mongoose';

describe('UserService', () => {
  let service: UserService;
  let userModel: Model<User>;
  let module: TestingModule;

  beforeAll(async () => {
    try {
      // We need to establish a connection for the test module
      // The setupFile.ts handles the global connection, but test modules need their own
      const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017';
      const dbName = process.env.MONGO_DATABASE || 'test-db';

      module = await Test.createTestingModule({
        imports: [
          MongooseModule.forRoot(`${mongoUri}/${dbName}`),
          MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
        ],
        providers: [UserService],
      }).compile();

      service = module.get<UserService>(UserService);
      // Get the Mongoose Model instance directly to query the database later
      userModel = module.get<Model<User>>(getModelToken(User.name));
    } catch (error) {
      console.error('Failed to create test module:', error);
      throw error;
    }
  });

  // Clean the database before each test for isolation
  beforeEach(async () => {
    // Only clean if userModel exists
    if (userModel) {
      await userModel.deleteMany({});
    }
  });

  // Close the module after all tests (but not the database connection)
  afterAll(async () => {
    if (module) {
      await module.close();
    }
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should have access to user model', () => {
    expect(userModel).toBeDefined();
  });
});
