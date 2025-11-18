const request = require('supertest');
const app = require('../src/index');
const { default: User } = require('../src/models/user.model');

describe('Money Keeper Routes', () => {
  let authToken;
  let userId;

  beforeAll(async () => {
    // Create a test user and login
    const testUser = {
      username: 'testuser_moneykeeper',
      email: 'testmoneykeeper@example.com',
      password: 'password...',
      fullName: 'Test User Money Keeper'
    };

    await request(app)
      .post('/api/auth/register')
      .send(testUser);

    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password
      });

    authToken = loginResponse.body.token;
    userId = loginResponse.body.user.id;
  });

  afterAll(async () => {
    // Clean up test user
    await User.deleteOne({ email: 'testmoneykeeper@example.com' });
  });

  describe('GET /app/money-keeper', () => {
    it('should render the Money Keeper index page when authenticated', async () => {
      const response = await request(app)
        .get('/app/money-keeper')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.text).toContain('Money Keeper');
    });

    it('should redirect to login when not authenticated', async () => {
      const response = await request(app)
        .get('/app/money-keeper');

      // Should redirect to login page
      expect(response.status).toBe(302);
      expect(response.headers.location).toContain('/auth/login');
    });
  });

  describe('GET /app/money-keeper/setting', () => {
    it('should render the Money Keeper settings page when authenticated', async () => {
      const response = await request(app)
        .get('/app/money-keeper/setting')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.text).toContain('Money Keeper');
    });

    it('should redirect to login when not authenticated', async () => {
      const response = await request(app)
        .get('/app/money-keeper/setting');

      expect(response.status).toBe(302);
      expect(response.headers.location).toContain('/auth/login');
    });
  });

  describe('GET /app/money-keeper/:id/detail', () => {
    it('should render the Money Keeper detail page when authenticated', async () => {
      const testId = '507f1f77bcf86cd799439011'; // Sample ObjectId

      const response = await request(app)
        .get(`/app/money-keeper/${testId}/detail`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.text).toContain('Money Keeper');
    });

    it('should redirect to login when not authenticated', async () => {
      const testId = '507f1f77bcf86cd799439011';

      const response = await request(app)
        .get(`/app/money-keeper/${testId}/detail`);

      expect(response.status).toBe(302);
      expect(response.headers.location).toContain('/auth/login');
    });
  });

  describe('GET /app/money-keeper/:id/sync-data', () => {
    it('should render the Money Keeper sync data page when authenticated', async () => {
      const testId = '507f1f77bcf86cd799439011'; // Sample ObjectId

      const response = await request(app)
        .get(`/app/money-keeper/${testId}/sync-data`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.text).toContain('Money Keeper');
    });

    it('should redirect to login when not authenticated', async () => {
      const testId = '507f1f77bcf86cd799439011';

      const response = await request(app)
        .get(`/app/money-keeper/${testId}/sync-data`);

      expect(response.status).toBe(302);
      expect(response.headers.location).toContain('/auth/login');
    });
  });
});
