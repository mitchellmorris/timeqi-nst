import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../../src/app.module';

describe('AuthController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    // Configure validation pipes like in main.ts
    app.useGlobalPipes(new ValidationPipe());

    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('/auth/login (POST)', () => {
    it('should return 400 for invalid request body', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({})
        .expect(400);
    });

    it('should return 400 for missing email', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          password: 'password123',
        })
        .expect(400);
    });

    it('should return 400 for missing password', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'test@example.com',
        })
        .expect(400);
    });

    it('should return 400 for invalid email format', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'invalid-email',
          password: 'password123',
        })
        .expect(400);
    });

    it('should return 401 for non-existent user', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123',
        })
        .expect(401);
    });
  });

  describe('/auth/profile (GET)', () => {
    it('should return 401 without authorization header', () => {
      return request(app.getHttpServer()).get('/auth/profile').expect(401);
    });

    it('should return 401 with invalid token', () => {
      return request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', 'Bearer invalid.token.here')
        .expect(401);
    });

    it('should return 401 with malformed authorization header', () => {
      return request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', 'InvalidFormat')
        .expect(401);
    });
  });
});
