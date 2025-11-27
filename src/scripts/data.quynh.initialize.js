const { default: BankAccount } = require('@/models/bankAccount.model');
const { default: User } = require('@/models/user.model');

// Default data initialization for user QuyNH
const defaultDataUserQuyNH = {
  user: {
    username: 'QuyNH',
    email: 'quynh@mail.quyit.id.vn',
    password: '123456a',
    name: 'Nguyen Quy',
    phone: '0974691005',
    currency: 'VND',
    language: 'vi',
    avatar: 'https://example.com/avatar/quynh.jpg',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  bankAccounts: [
    {
      userId: null, // To be set after user creation
      bank: 'Vietcombank',
      accountHolder: 'Nguyen Quy',
      accountNumber: '123456789',
      branch: 'Hanoi',
      identifier: 'VCB123',
      isDefault: true,
      isActive: true,
      notes: 'Tài khoản chính',
    },
  ],
};

module.exports = {
  // Default data for user QuyNH
  defaultDataUserQuyNH: defaultDataUserQuyNH,

  /**
   * Initialize default data for user QuyNH
   */
  initializeDefaultDataUserQuyNH: async function initializeDefaultDataUserQuyNH() {
    try {
      // Check if user QuyNH already exists
      const existingUser = await User.findOne({ username: defaultDataUserQuyNH.user.username });
      if (existingUser) {
        console.log('✓ Default data for user QuyNH already initialized');
        return;
      }

      // Create new user with default data
      const newUser = new User(defaultDataUserQuyNH.user);
      await newUser.save();

      // Create associated bank accounts
      const bankAccounts = defaultDataUserQuyNH.bankAccounts.map((account) => ({
        ...account,
        userId: newUser._id,
      }));
      await BankAccount.insertMany([...bankAccounts]);

      console.log('✓ Default data for user QuyNH initialized successfully');
    } catch (error) {
      console.error('✗ Error initializing default data for user QuyNH:', error);
    }
  },
};
