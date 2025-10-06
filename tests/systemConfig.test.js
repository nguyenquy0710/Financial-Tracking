const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/index');
const User = require('../src/models/User');
const SystemConfig = require('../src/models/SystemConfig');

describe('System Configuration', () => {
  let authToken;
  let userId;

  beforeAll(async () => {
    // Create a test user and get auth token
    const userResponse = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'systemconfig-test@example.com',
        password: 'password123',
        name: 'System Config Test User'
      });

    authToken = userResponse.body.data.token;
    userId = userResponse.body.data.user._id;
  });

  afterEach(async () => {
    // Clean up system configs after each test
    await SystemConfig.deleteMany({});
  });

  afterAll(async () => {
    // Clean up and close connection
    await User.deleteMany({});
    await SystemConfig.deleteMany({});
    await mongoose.connection.close();
  });

  describe('GET /api/system-config', () => {
    it('should require authentication', async () => {
      const res = await request(app)
        .get('/api/system-config');

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should return empty config if not configured', async () => {
      const res = await request(app)
        .get('/api/system-config')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.misa.isConfigured).toBe(false);
    });

    it('should return existing config if configured', async () => {
      // Create a config first
      await SystemConfig.create({
        userId,
        misa: {
          username: 'test@example.com',
          password: 'hashedpassword',
          isConfigured: true,
          lastValidated: new Date()
        }
      });

      const res = await request(app)
        .get('/api/system-config')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.misa.isConfigured).toBe(true);
      expect(res.body.data.misa.username).toBe('test@example.com');
      // Password should not be returned in plain text
      expect(res.body.data.misa.password).toBe('********');
    });
  });

  describe('POST /api/system-config/misa', () => {
    it('should require authentication', async () => {
      const res = await request(app)
        .post('/api/system-config/misa')
        .send({
          username: 'test@example.com',
          password: 'password123'
        });

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should require username and password', async () => {
      const res = await request(app)
        .post('/api/system-config/misa')
        .set('Authorization', `Bearer ${authToken}`)
        .send({});

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('bắt buộc');
    });

    it('should validate MISA credentials before saving', async () => {
      const res = await request(app)
        .post('/api/system-config/misa')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          username: 'test@example.com',
          password: 'wrongpassword'
        });

      // Should fail validation
      expect([400, 401, 403, 500]).toContain(res.statusCode);
      expect(res.body).toHaveProperty('success');
    });
  });

  describe('POST /api/system-config/misa/test', () => {
    it('should require authentication', async () => {
      const res = await request(app)
        .post('/api/system-config/misa/test')
        .send({
          username: 'test@example.com',
          password: 'password123'
        });

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should require username and password', async () => {
      const res = await request(app)
        .post('/api/system-config/misa/test')
        .set('Authorization', `Bearer ${authToken}`)
        .send({});

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('bắt buộc');
    });

    it('should test MISA credentials without saving', async () => {
      const res = await request(app)
        .post('/api/system-config/misa/test')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          username: 'test@example.com',
          password: 'testpassword'
        });

      // Will likely fail with invalid credentials, but should process the request
      expect([200, 400, 401, 403, 500]).toContain(res.statusCode);
      expect(res.body).toHaveProperty('success');

      // Config should not be saved
      const config = await SystemConfig.findOne({ userId });
      expect(config).toBeNull();
    });
  });

  describe('DELETE /api/system-config/misa', () => {
    it('should require authentication', async () => {
      const res = await request(app)
        .delete('/api/system-config/misa');

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should return 404 if config does not exist', async () => {
      const res = await request(app)
        .delete('/api/system-config/misa')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('should delete existing MISA config', async () => {
      // Create a config first
      await SystemConfig.create({
        userId,
        misa: {
          username: 'test@example.com',
          password: 'hashedpassword',
          isConfigured: true,
          lastValidated: new Date()
        }
      });

      const res = await request(app)
        .delete('/api/system-config/misa')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.misa.isConfigured).toBe(false);
    });
  });
});
