const request = require('supertest');
const app = require('../src/index');
const { default: User } = require('../src/models/user.model');
const { default: RentalProperty } = require('../src/models/rental-property.model');
const { default: Rental } = require('../src/models/rental.model');

describe('Rental Property API', () => {
  let authToken;
  let userId;

  beforeAll(async () => {
    // Create a test user and login
    const testUser = {
      username: 'testuser_rental',
      email: 'testrental@example.com',
      password: 'password...',
      fullName: 'Test User Rental'
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

  afterEach(async () => {
    // Clean up test data
    await RentalProperty.deleteMany({ userId });
    await Rental.deleteMany({ userId });
  });

  afterAll(async () => {
    // Clean up test user
    await User.deleteOne({ email: 'testrental@example.com' });
  });

  describe('POST /api/rental-properties', () => {
    it('should create a new rental property', async () => {
      const propertyData = {
        roomCode: 'P101',
        propertyName: 'Test Room 101',
        address: '123 Test Street',
        startDate: new Date('2024-01-01'),
        rentAmount: 5000000,
        initialElectricityReading: 100,
        electricityRate: 3500,
        initialWaterReading: 50,
        waterRate: 20000,
        internetFee: 200000,
        parkingFee: 150000,
        garbageFee: 50000,
        notes: 'Test property'
      };

      const response = await request(app)
        .post('/api/rental-properties')
        .set('Authorization', `Bearer ${authToken}`)
        .send(propertyData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.roomCode).toBe('P101');
      expect(response.body.data.propertyName).toBe('Test Room 101');
      expect(response.body.data.isActive).toBe(true);
    });
  });

  describe('GET /api/rental-properties', () => {
    it('should get all rental properties for user', async () => {
      // Create test properties
      await RentalProperty.create({
        userId,
        roomCode: 'P101',
        propertyName: 'Property 1',
        startDate: new Date(),
        rentAmount: 5000000,
        initialElectricityReading: 100,
        electricityRate: 3500,
        initialWaterReading: 50,
        waterRate: 20000
      });

      const response = await request(app)
        .get('/api/rental-properties')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.count).toBeGreaterThan(0);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('GET /api/rental-properties/:id/details', () => {
    it('should get property details with monthly records and statistics', async () => {
      // Create a property
      const property = await RentalProperty.create({
        userId,
        roomCode: 'P101',
        propertyName: 'Property 1',
        startDate: new Date('2024-01-01'),
        rentAmount: 5000000,
        initialElectricityReading: 100,
        electricityRate: 3500,
        initialWaterReading: 50,
        waterRate: 20000
      });

      // Create a monthly record
      await Rental.create({
        userId,
        propertyId: property._id,
        propertyName: property.propertyName,
        month: new Date('2024-01-01'),
        rentAmount: 5000000,
        electricity: {
          startReading: 100,
          endReading: 200,
          consumption: 100,
          rate: 3500,
          amount: 350000
        },
        water: {
          startReading: 50,
          endReading: 60,
          consumption: 10,
          rate: 20000,
          amount: 200000
        },
        internet: 200000,
        parking: 150000,
        garbage: 50000,
        bonus: 0,
        total: 5950000,
        isPaid: true
      });

      const response = await request(app)
        .get(`/api/rental-properties/${property._id}/details`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.property).toBeDefined();
      expect(response.body.data.monthlyRecords).toBeDefined();
      expect(response.body.data.statistics).toBeDefined();
      expect(response.body.data.statistics.totalMonths).toBe(1);
      expect(response.body.data.statistics.grandTotal).toBe(5950000);
    });
  });

  describe('PUT /api/rental-properties/:id/deactivate', () => {
    it('should deactivate a rental property', async () => {
      // Create a property
      const property = await RentalProperty.create({
        userId,
        roomCode: 'P101',
        propertyName: 'Property 1',
        startDate: new Date('2024-01-01'),
        rentAmount: 5000000,
        initialElectricityReading: 100,
        electricityRate: 3500,
        initialWaterReading: 50,
        waterRate: 20000,
        isActive: true
      });

      const response = await request(app)
        .put(`/api/rental-properties/${property._id}/deactivate`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ endDate: new Date('2024-12-31') });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.isActive).toBe(false);
      expect(response.body.data.endDate).toBeDefined();
    });
  });
});
