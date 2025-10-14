const multer = require('multer');
const path = require('path');
const {
  parseExcelFile,
  parseRentalSheet,
  parseSalarySheet,
  parseExpenseSheet,
  parseDepositSheet,
  parseBankAccountSheet,
  exportToExcel
} = require('../utils/excelParser');
const Rental = require('../schemas/rental.schema');
const Salary = require('../schemas/Salary.schema');
const Expense = require('../schemas/Expense.schema');
const Deposit = require('../schemas/Deposit.schema');
const BankAccount = require('../schemas/BankAccount.schema');

// Configure multer for file upload
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    if (ext !== '.xlsx' && ext !== '.xls') {
      return cb(new Error('Only Excel files are allowed'));
    }
    cb(null, true);
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

/**
 * @desc    Upload and import Excel file
 * @route   POST /api/excel/import
 * @access  Private
 */
exports.uploadExcel = upload.single('file');

exports.importExcel = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload an Excel file'
      });
    }

    const parsedData = parseExcelFile(req.file.buffer);
    const results = {
      rentals: 0,
      salaries: 0,
      expenses: 0,
      deposits: 0,
      bankAccounts: 0
    };

    // Process each sheet
    for (const sheetName in parsedData) {
      const sheetData = parsedData[sheetName].raw;

      // Identify sheet type and parse accordingly
      if (sheetName.toLowerCase().includes('thuê phòng') || sheetName.match(/P\d+-\d+\./i)) {
        // Rental sheet
        const rentalData = parseRentalSheet(sheetData);
        rentalData.userId = req.user.id;
        rentalData.month = rentalData.month || new Date();

        await Rental.create(rentalData);
        results.rentals++;
      } else if (sheetName.toLowerCase().includes('salary')) {
        // Salary sheet
        const salaryData = parseSalarySheet(sheetData);
        salaryData.userId = req.user.id;
        salaryData.month = salaryData.month || new Date();

        await Salary.create(salaryData);
        results.salaries++;
      } else if (
        sheetName.toLowerCase().includes('chi-tieu') ||
        sheetName.toLowerCase().includes('chi tiêu')
      ) {
        // Expense sheet
        const expensesData = parseExpenseSheet(sheetData);

        for (const expenseData of expensesData) {
          expenseData.userId = req.user.id;
          expenseData.month = expenseData.month || new Date();

          await Expense.create(expenseData);
          results.expenses++;
        }
      } else if (
        sheetName.toLowerCase().includes('deposit') ||
        sheetName.toLowerCase().includes('tiền gửi')
      ) {
        // Deposit sheet
        const depositsData = parseDepositSheet(sheetData);

        for (const depositData of depositsData) {
          depositData.userId = req.user.id;

          await Deposit.create(depositData);
          results.deposits++;
        }
      } else if (
        sheetName.toLowerCase().includes('setting') ||
        sheetName.toLowerCase().includes('thông tin')
      ) {
        // Bank account settings sheet
        const accountsData = parseBankAccountSheet(sheetData);

        for (const accountData of accountsData) {
          accountData.userId = req.user.id;

          await BankAccount.create(accountData);
          results.bankAccounts++;
        }
      }
    }

    res.status(200).json({
      success: true,
      message: 'Excel file imported successfully',
      data: results
    });
  } catch (error) {
    console.error('Import error:', error);
    next(error);
  }
};

/**
 * @desc    Export data to Excel
 * @route   GET /api/excel/export
 * @access  Private
 */
exports.exportExcel = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const dateFilter = {};

    if (startDate || endDate) {
      dateFilter.month = {};
      if (startDate) dateFilter.month.$gte = new Date(startDate);
      if (endDate) dateFilter.month.$lte = new Date(endDate);
    }

    // Fetch all data
    const rentals = await Rental.find({
      userId: req.user.id,
      ...dateFilter
    })
      .sort({ month: -1 })
      .lean();

    const salaries = await Salary.find({
      userId: req.user.id,
      ...dateFilter
    })
      .sort({ month: -1 })
      .lean();

    const expenses = await Expense.find({
      userId: req.user.id,
      ...dateFilter
    })
      .sort({ month: -1 })
      .lean();

    const deposits = await Deposit.find({
      userId: req.user.id
    })
      .sort({ createdAt: -1 })
      .lean();

    const bankAccounts = await BankAccount.find({
      userId: req.user.id,
      isActive: true
    })
      .sort({ bank: 1 })
      .lean();

    // Prepare data for export
    const exportData = {
      Rentals: rentals.map(r => ({
        Property: r.propertyName,
        Address: r.address,
        Month: r.month,
        Rent: r.rentAmount,
        Electricity: r.electricity.amount,
        Water: r.water.amount,
        Internet: r.internet,
        Parking: r.parking,
        Total: r.total
      })),
      Salaries: salaries.map(s => ({
        Month: s.month,
        Company: s.company,
        'Base Salary': s.baseSalary,
        KPI: s.kpi,
        Project: s.project,
        Freelance: s.freelance.total,
        'Total Income': s.totalIncome
      })),
      Expenses: expenses.map(e => ({
        Month: e.month,
        Category: e.category,
        Item: e.itemName,
        Quantity: e.quantity,
        'Unit Price': e.unitPrice,
        Total: e.totalAmount
      })),
      Deposits: deposits.map(d => ({
        Bank: d.bank,
        'Account Number': d.accountNumber,
        Principal: d.principalAmount,
        'Interest Rate': d.interestRate,
        Total: d.totalAmount
      })),
      'Bank Accounts': bankAccounts.map(b => ({
        Bank: b.bank,
        'Account Holder': b.accountHolder,
        'Account Number': b.accountNumber,
        Branch: b.branch
      }))
    };

    // Generate Excel buffer
    const excelBuffer = exportToExcel(exportData);

    // Set response headers
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader('Content-Disposition', `attachment; filename=financial-data-${Date.now()}.xlsx`);

    res.send(excelBuffer);
  } catch (error) {
    console.error('Export error:', error);
    next(error);
  }
};
