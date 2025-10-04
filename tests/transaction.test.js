const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/index');
const User = require('../src/models/User');
const Transaction = require('../src/models/Transaction');
const Category = require('../src/models/Category');

describe('Transactions', () => {
  let token;
  let userId;
  let categoryId;

  beforeAll(async () => {
    const mongoURI = process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/fintrack_test';
    await mongoose.connect(mongoURI);
  });

  afterAll(async () => {
    await User.deleteMany({});
    await Transaction.deleteMany({});
    await Category.deleteMany({});
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Create user and get token
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User'
      });

    token = res.body.data.token;
    userId = res.body.data.user._id;

    // Create category
    const categoryRes = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Food',
        type: 'expense',
        icon: '🍔'
      });

    categoryId = categoryRes.body.data.category._id;
  });

  afterEach(async () => {
    await User.deleteMany({});
    await Transaction.deleteMany({});
    await Category.deleteMany({});
  });

  describe('POST /api/transactions', () => {
    it('should create a new transaction', async () => {
      const res = await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${token}`)
        .send({
          type: 'expense',
          amount: 50000,
          categoryId: categoryId,
          description: 'Lunch',
          date: new Date()
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.transaction).toHaveProperty('amount', 50000);
    });

    it('should require authentication', async () => {
      const res = await request(app)
        .post('/api/transactions')
        .send({
          type: 'expense',
          amount: 50000,
          categoryId: categoryId
        });

      expect(res.statusCode).toBe(401);
    });
  });

  describe('GET /api/transactions', () => {
    beforeEach(async () => {
      // Create some transactions
      await Transaction.create([
        { userId, type: 'expense', amount: 50000, categoryId, date: new Date() },
        { userId, type: 'income', amount: 1000000, categoryId, date: new Date() }
      ]);
    });

    it('should get all user transactions', async () => {
      const res = await request(app)
        .get('/api/transactions')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.transactions).toHaveLength(2);
    });

    it('should filter by type', async () => {
      const res = await request(app)
        .get('/api/transactions?type=expense')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.transactions).toHaveLength(1);
      expect(res.body.data.transactions[0].type).toBe('expense');
    });
  });

  describe('GET /api/transactions/stats/summary', () => {
    beforeEach(async () => {
      await Transaction.create([
        { userId, type: 'expense', amount: 50000, categoryId, date: new Date() },
        { userId, type: 'expense', amount: 30000, categoryId, date: new Date() },
        { userId, type: 'income', amount: 1000000, categoryId, date: new Date() }
      ]);
    });

    it('should get transaction statistics', async () => {
      const res = await request(app)
        .get('/api/transactions/stats/summary')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.summary.income).toBe(1000000);
      expect(res.body.data.summary.expense).toBe(80000);
      expect(res.body.data.summary.balance).toBe(920000);
    });
  });
});
