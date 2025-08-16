import { Test, TestingModule } from '@nestjs/testing';
import { ProjectUserController } from './project-user.controller';

describe('ProjectUserController', () => {
  let controller: ProjectUserController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProjectUserController],
    }).compile();

    controller = module.get<ProjectUserController>(ProjectUserController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
