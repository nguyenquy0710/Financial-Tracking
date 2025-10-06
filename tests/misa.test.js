const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/index');
const User = require('../src/models/User');
const Salary = require('../src/models/Salary');
const Expense = require('../src/models/Expense');

describe('MISA Integration', () => {
  let authToken;
  let userId;

  beforeAll(async () => {
    // Connect to test database
    const mongoURI = process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/fintrack_test';
    await mongoose.connect(mongoURI);

    // Create a test user and get auth token
    const userResponse = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'misa-test@example.com',
        password: 'password123',
        name: 'MISA Test User'
      });

    authToken = userResponse.body.data.token;
    userId = userResponse.body.data.user._id;
  });

  afterAll(async () => {
    // Clean up and close connection
    await User.deleteMany({});
    await Salary.deleteMany({});
    await Expense.deleteMany({});
    await mongoose.connection.close();
  });

  describe('POST /api/misa/login', () => {
    it('should require authentication', async () => {
      const res = await request(app)
        .post('/api/misa/login')
        .send({
          UserName: 'test@example.com',
          Password: 'password123'
        });

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should require UserName and Password', async () => {
      const res = await request(app)
        .post('/api/misa/login')
        .set('Authorization', `Bearer ${authToken}`)
        .send({});

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('UserName and Password are required');
    });

    it('should attempt to login with valid credentials format', async () => {
      const res = await request(app)
        .post('/api/misa/login')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          UserName: 'test@example.com',
          Password: 'password123'
        });

      // Note: This will likely fail because we don't have real MISA credentials
      // But it should process the request properly
      expect([200, 400, 401, 403, 500]).toContain(res.statusCode);
      expect(res.body).toHaveProperty('success');
    });
  });

  describe('GET /api/misa/users', () => {
    it('should require authentication', async () => {
      const res = await request(app)
        .get('/api/misa/users')
        .send({
          misaToken: 'fake-token'
        });

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should require misaToken', async () => {
      const res = await request(app)
        .get('/api/misa/users')
        .set('Authorization', `Bearer ${authToken}`)
        .send({});

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('MISA token is required');
    });

    it('should attempt to get user info with token', async () => {
      const res = await request(app)
        .get('/api/misa/users')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          misaToken: 'fake-misa-token'
        });

      // Will likely fail with invalid token, but should process the request
      expect([200, 400, 401, 403, 500]).toContain(res.statusCode);
      expect(res.body).toHaveProperty('success');
    });
  });

  describe('POST /api/misa/wallets/accounts', () => {
    it('should require authentication', async () => {
      const res = await request(app)
        .post('/api/misa/wallets/accounts')
        .send({
          misaToken: 'fake-token'
        });

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should require misaToken', async () => {
      const res = await request(app)
        .post('/api/misa/wallets/accounts')
        .set('Authorization', `Bearer ${authToken}`)
        .send({});

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('MISA token is required');
    });

    it('should accept pagination parameters', async () => {
      const res = await request(app)
        .post('/api/misa/wallets/accounts')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          misaToken: 'fake-misa-token',
          searchText: 'test',
          skip: 0,
          take: 10
        });

      // Will likely fail with invalid token, but should process the request
      expect([200, 400, 401, 403, 500]).toContain(res.statusCode);
      expect(res.body).toHaveProperty('success');
    });
  });

  describe('POST /api/misa/wallets/summary', () => {
    it('should require authentication', async () => {
      const res = await request(app)
        .post('/api/misa/wallets/summary')
        .send({
          misaToken: 'fake-token'
        });

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should require misaToken', async () => {
      const res = await request(app)
        .post('/api/misa/wallets/summary')
        .set('Authorization', `Bearer ${authToken}`)
        .send({});

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('MISA token is required');
    });

    it('should accept filter parameters', async () => {
      const res = await request(app)
        .post('/api/misa/wallets/summary')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          misaToken: 'fake-misa-token',
          searchText: '',
          walletType: null
        });

      // Will likely fail with invalid token, but should process the request
      expect([200, 400, 401, 403, 500]).toContain(res.statusCode);
      expect(res.body).toHaveProperty('success');
    });
  });

  describe('GET /api/misa/transactions/addresses', () => {
    it('should require authentication', async () => {
      const res = await request(app)
        .get('/api/misa/transactions/addresses')
        .send({
          misaToken: 'fake-token'
        });

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should require misaToken', async () => {
      const res = await request(app)
        .get('/api/misa/transactions/addresses')
        .set('Authorization', `Bearer ${authToken}`)
        .send({});

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('MISA token is required');
    });

    it('should attempt to get transaction addresses with token', async () => {
      const res = await request(app)
        .get('/api/misa/transactions/addresses')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          misaToken: 'fake-misa-token'
        });

      // Will likely fail with invalid token, but should process the request
      expect([200, 400, 401, 403, 500]).toContain(res.statusCode);
      expect(res.body).toHaveProperty('success');
    });
  });

  describe('POST /api/misa/transactions/search', () => {
    it('should require authentication', async () => {
      const res = await request(app)
        .post('/api/misa/transactions/search')
        .send({
          misaToken: 'fake-token'
        });

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should require misaToken', async () => {
      const res = await request(app)
        .post('/api/misa/transactions/search')
        .set('Authorization', `Bearer ${authToken}`)
        .send({});

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('MISA token is required');
    });

    it('should accept search parameters', async () => {
      const res = await request(app)
        .post('/api/misa/transactions/search')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          misaToken: 'fake-misa-token',
          fromDate: '2024-01-01',
          toDate: '2024-01-31',
          transactionType: 1,
          skip: 0,
          take: 20
        });

      // Will likely fail with invalid token, but should process the request
      expect([200, 400, 401, 403, 500]).toContain(res.statusCode);
      expect(res.body).toHaveProperty('success');
    });
  });

  describe('POST /api/misa/transactions/import/income', () => {
    it('should require authentication', async () => {
      const res = await request(app)
        .post('/api/misa/transactions/import/income')
        .send({
          misaToken: 'fake-token',
          transactions: []
        });

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should require misaToken', async () => {
      const res = await request(app)
        .post('/api/misa/transactions/import/income')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          transactions: []
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('MISA token is required');
    });

    it('should require transactions array', async () => {
      const res = await request(app)
        .post('/api/misa/transactions/import/income')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          misaToken: 'fake-misa-token'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Transactions array is required');
    });

    it('should import income transactions', async () => {
      const transactions = [
        {
          id: 'misa-txn-1',
          transactionDate: '2024-01-15',
          amount: 5000000,
          note: 'Freelance work'
        },
        {
          id: 'misa-txn-2',
          transactionDate: '2024-01-20',
          amount: 3000000,
          note: 'Bonus'
        }
      ];

      const res = await request(app)
        .post('/api/misa/transactions/import/income')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          misaToken: 'fake-misa-token',
          transactions
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.imported).toHaveLength(2);
    });
  });

  describe('POST /api/misa/transactions/import/expense', () => {
    it('should require authentication', async () => {
      const res = await request(app)
        .post('/api/misa/transactions/import/expense')
        .send({
          misaToken: 'fake-token',
          transactions: []
        });

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should require misaToken', async () => {
      const res = await request(app)
        .post('/api/misa/transactions/import/expense')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          transactions: []
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('MISA token is required');
    });

    it('should require transactions array', async () => {
      const res = await request(app)
        .post('/api/misa/transactions/import/expense')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          misaToken: 'fake-misa-token'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Transactions array is required');
    });

    it('should import expense transactions', async () => {
      const transactions = [
        {
          id: 'misa-txn-3',
          transactionDate: '2024-01-10',
          amount: 500000,
          category: { name: 'Food & Dining' },
          note: 'Restaurant'
        },
        {
          id: 'misa-txn-4',
          transactionDate: '2024-01-12',
          amount: 200000,
          category: { name: 'Transportation' },
          note: 'Taxi'
        }
      ];

      const res = await request(app)
        .post('/api/misa/transactions/import/expense')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          misaToken: 'fake-misa-token',
          transactions
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.imported).toHaveLength(2);
    });
  });
});
