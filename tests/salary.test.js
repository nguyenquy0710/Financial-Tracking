const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/index');
const User = require('../src/models/User');
const Salary = require('../src/models/Salary');

describe('Salary Management', () => {
  let token;
  let userId;
  let salaryId;

  beforeAll(async () => {
    const mongoURI = process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/fintrack_test';
    await mongoose.connect(mongoURI);
  });

  afterAll(async () => {
    await User.deleteMany({});
    await Salary.deleteMany({});
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Clean up existing data
    await User.deleteMany({});
    await Salary.deleteMany({});

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
  });

  describe('POST /api/salaries', () => {
    it('should create a new salary record', async () => {
      const salaryData = {
        month: new Date('2025-01-01'),
        company: 'VIHAT',
        baseSalary: 15000000,
        kpi: 3000000,
        leader: 2000000,
        project: 5000000,
        overtime: 1000000,
        bonus13thMonth: 0,
        totalCompanySalary: 26000000,
        freelance: {
          dakiatech: 8000000,
          other: 2000000,
          total: 10000000
        },
        totalIncome: 36000000,
        notes: 'Test salary entry'
      };

      const res = await request(app)
        .post('/api/salaries')
        .set('Authorization', `Bearer ${token}`)
        .send(salaryData);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('_id');
      expect(res.body.data.company).toBe('VIHAT');
      expect(res.body.data.baseSalary).toBe(15000000);
      expect(res.body.data.totalIncome).toBe(36000000);

      salaryId = res.body.data._id;
    });

    it('should fail without authentication', async () => {
      const res = await request(app)
        .post('/api/salaries')
        .send({
          month: new Date('2025-01-01'),
          company: 'VIHAT',
          baseSalary: 15000000
        });

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/salaries', () => {
    beforeEach(async () => {
      // Create test salary
      const res = await request(app)
        .post('/api/salaries')
        .set('Authorization', `Bearer ${token}`)
        .send({
          month: new Date('2025-01-01'),
          company: 'VIHAT',
          baseSalary: 15000000,
          kpi: 3000000,
          totalCompanySalary: 18000000,
          freelance: {
            dakiatech: 8000000,
            other: 0,
            total: 8000000
          },
          totalIncome: 26000000
        });

      salaryId = res.body.data._id;
    });

    it('should get all salaries for the user', async () => {
      const res = await request(app)
        .get('/api/salaries')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.data[0].company).toBe('VIHAT');
    });

    it('should filter salaries by company', async () => {
      const res = await request(app)
        .get('/api/salaries?company=VIHAT')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.every(s => s.company === 'VIHAT')).toBe(true);
    });
  });

  describe('GET /api/salaries/:id', () => {
    beforeEach(async () => {
      const res = await request(app)
        .post('/api/salaries')
        .set('Authorization', `Bearer ${token}`)
        .send({
          month: new Date('2025-01-01'),
          company: 'VIHAT',
          baseSalary: 15000000,
          totalCompanySalary: 15000000,
          freelance: { dakiatech: 0, other: 0, total: 0 },
          totalIncome: 15000000
        });

      salaryId = res.body.data._id;
    });

    it('should get a single salary by id', async () => {
      const res = await request(app)
        .get(`/api/salaries/${salaryId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data._id).toBe(salaryId);
    });

    it('should return 404 for non-existent salary', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .get(`/api/salaries/${fakeId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/salaries/:id', () => {
    beforeEach(async () => {
      const res = await request(app)
        .post('/api/salaries')
        .set('Authorization', `Bearer ${token}`)
        .send({
          month: new Date('2025-01-01'),
          company: 'VIHAT',
          baseSalary: 15000000,
          kpi: 3000000,
          totalCompanySalary: 18000000,
          freelance: { dakiatech: 0, other: 0, total: 0 },
          totalIncome: 18000000
        });

      salaryId = res.body.data._id;
    });

    it('should update a salary', async () => {
      const updateData = {
        baseSalary: 20000000,
        kpi: 5000000,
        totalCompanySalary: 25000000,
        totalIncome: 25000000
      };

      const res = await request(app)
        .put(`/api/salaries/${salaryId}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updateData);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.baseSalary).toBe(20000000);
      expect(res.body.data.kpi).toBe(5000000);
    });

    it('should return 404 for non-existent salary', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .put(`/api/salaries/${fakeId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ baseSalary: 20000000 });

      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /api/salaries/:id', () => {
    beforeEach(async () => {
      const res = await request(app)
        .post('/api/salaries')
        .set('Authorization', `Bearer ${token}`)
        .send({
          month: new Date('2025-01-01'),
          company: 'VIHAT',
          baseSalary: 15000000,
          totalCompanySalary: 15000000,
          freelance: { dakiatech: 0, other: 0, total: 0 },
          totalIncome: 15000000
        });

      salaryId = res.body.data._id;
    });

    it('should delete a salary', async () => {
      const res = await request(app)
        .delete(`/api/salaries/${salaryId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      // Verify it's deleted
      const getRes = await request(app)
        .get(`/api/salaries/${salaryId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(getRes.status).toBe(404);
    });

    it('should return 404 for non-existent salary', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .delete(`/api/salaries/${fakeId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(404);
    });
  });

  describe('Salary Calculations', () => {
    it('should correctly calculate totalCompanySalary', async () => {
      const salaryData = {
        month: new Date('2025-01-01'),
        company: 'VIHAT',
        baseSalary: 15000000,
        kpi: 3000000,
        leader: 2000000,
        project: 5000000,
        overtime: 1000000,
        bonus13thMonth: 15000000,
        totalCompanySalary: 41000000,
        freelance: { dakiatech: 0, other: 0, total: 0 },
        totalIncome: 41000000
      };

      const res = await request(app)
        .post('/api/salaries')
        .set('Authorization', `Bearer ${token}`)
        .send(salaryData);

      expect(res.status).toBe(201);
      expect(res.body.data.totalCompanySalary).toBe(41000000);
    });

    it('should correctly calculate freelance total', async () => {
      const salaryData = {
        month: new Date('2025-01-01'),
        company: 'VIHAT',
        baseSalary: 15000000,
        totalCompanySalary: 15000000,
        freelance: {
          dakiatech: 8000000,
          other: 2000000,
          total: 10000000
        },
        totalIncome: 25000000
      };

      const res = await request(app)
        .post('/api/salaries')
        .set('Authorization', `Bearer ${token}`)
        .send(salaryData);

      expect(res.status).toBe(201);
      expect(res.body.data.freelance.total).toBe(10000000);
    });

    it('should correctly calculate totalIncome', async () => {
      const salaryData = {
        month: new Date('2025-01-01'),
        company: 'VIHAT',
        baseSalary: 15000000,
        kpi: 3000000,
        totalCompanySalary: 18000000,
        freelance: {
          dakiatech: 8000000,
          other: 2000000,
          total: 10000000
        },
        totalIncome: 28000000
      };

      const res = await request(app)
        .post('/api/salaries')
        .set('Authorization', `Bearer ${token}`)
        .send(salaryData);

      expect(res.status).toBe(201);
      expect(res.body.data.totalIncome).toBe(28000000);
    });
  });
});
