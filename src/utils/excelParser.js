const XLSX = require('xlsx');

/**
 * Parse Excel file and extract data from different sheets
 * @param {Buffer} fileBuffer - Excel file buffer
 * @returns {Object} Parsed data from all sheets
 */
const parseExcelFile = (fileBuffer) => {
  const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
  const result = {};

  // Parse each sheet
  workbook.SheetNames.forEach(sheetName => {
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: null });
    result[sheetName] = {
      raw: data,
      json: XLSX.utils.sheet_to_json(sheet, { defval: null })
    };
  });

  return result;
};

/**
 * Parse rental sheet data
 * @param {Array} data - Raw sheet data
 * @returns {Object} Parsed rental data
 */
const parseRentalSheet = (data) => {
  const rental = {
    propertyName: '',
    address: '',
    month: null,
    rentAmount: 0,
    electricity: { startReading: 0, endReading: 0, consumption: 0, rate: 0, amount: 0 },
    water: { startReading: 0, endReading: 0, consumption: 0, rate: 0, amount: 0 },
    internet: 0,
    parking: 0,
    garbage: 0,
    bonus: 0,
    total: 0,
    notes: ''
  };

  // Extract property info from header (row 0)
  if (data[0] && data[0][0]) {
    const headerText = data[0][0];
    const match = headerText.match(/Phòng\s+([^\s]+)\s+(.+)/);
    if (match) {
      rental.propertyName = match[1];
      rental.address = match[2];
    }
  }

  // Parse data rows
  data.forEach((row, idx) => {
    if (!row || row.length === 0) return;

    const firstCol = String(row[0] || '').toLowerCase();
    
    // Total row
    if (firstCol.includes('tổng') && idx > 2) {
      rental.rentAmount = parseFloat(row[2]) || 0;
      rental.electricity.startReading = parseFloat(row[3]) || 0;
      rental.electricity.endReading = parseFloat(row[4]) || 0;
      rental.electricity.consumption = parseFloat(row[5]) || 0;
      rental.electricity.amount = parseFloat(row[6]) || 0;
      rental.water.startReading = parseFloat(row[7]) || 0;
      rental.water.endReading = parseFloat(row[8]) || 0;
      rental.water.consumption = parseFloat(row[9]) || 0;
      rental.water.amount = parseFloat(row[10]) || 0;
      rental.internet = parseFloat(row[12]) || 0;
      rental.parking = parseFloat(row[13]) || 0;
      rental.garbage = parseFloat(row[14]) || 0;
      rental.bonus = parseFloat(row[15]) || 0;
      
      // Extract total
      const totalStr = String(row[16] || '');
      const totalMatch = totalStr.match(/([0-9,]+)/);
      if (totalMatch) {
        rental.total = parseFloat(totalMatch[1].replace(/,/g, '')) || 0;
      }
      
      rental.notes = row[17] || '';
    }
  });

  return rental;
};

/**
 * Parse salary sheet data
 * @param {Array} data - Raw sheet data
 * @returns {Object} Parsed salary data
 */
const parseSalarySheet = (data) => {
  const salary = {
    month: null,
    company: 'VIHAT',
    baseSalary: 0,
    kpi: 0,
    leader: 0,
    project: 0,
    overtime: 0,
    bonus13thMonth: 0,
    totalCompanySalary: 0,
    freelance: { dakiatech: 0, other: 0, total: 0 },
    totalIncome: 0,
    receiveDate: null
  };

  // Parse data rows
  data.forEach((row, idx) => {
    if (!row || row.length === 0) return;

    const firstCol = String(row[0] || '').toLowerCase();
    
    // Total row
    if (firstCol.includes('tổng') && idx > 1) {
      salary.baseSalary = parseFloat(row[3]) || 0;
      salary.leader = parseFloat(row[4]) || 0;
      salary.kpi = parseFloat(row[5]) || 0;
      salary.project = parseFloat(row[6]) || 0;
      salary.overtime = parseFloat(row[7]) || 0;
      salary.bonus13thMonth = parseFloat(row[8]) || 0;
      
      // Extract total company salary
      const totalCompanyStr = String(row[9] || '');
      const totalCompanyMatch = totalCompanyStr.match(/([0-9,]+)/);
      if (totalCompanyMatch) {
        salary.totalCompanySalary = parseFloat(totalCompanyMatch[1].replace(/,/g, '')) || 0;
      }
      
      // Freelance
      const freelanceDakiaStr = String(row[10] || '');
      const freelanceDakiaMatch = freelanceDakiaStr.match(/([0-9,]+)/);
      if (freelanceDakiaMatch) {
        salary.freelance.dakiatech = parseFloat(freelanceDakiaMatch[1].replace(/,/g, '')) || 0;
      }
      
      const freelanceOtherStr = String(row[11] || '');
      const freelanceOtherMatch = freelanceOtherStr.match(/([0-9,]+)/);
      if (freelanceOtherMatch) {
        salary.freelance.other = parseFloat(freelanceOtherMatch[1].replace(/,/g, '')) || 0;
      }
      
      const freelanceTotalStr = String(row[12] || '');
      const freelanceTotalMatch = freelanceTotalStr.match(/([0-9,]+)/);
      if (freelanceTotalMatch) {
        salary.freelance.total = parseFloat(freelanceTotalMatch[1].replace(/,/g, '')) || 0;
      }
      
      // Total income
      const totalIncomeStr = String(row[13] || '');
      const totalIncomeMatch = totalIncomeStr.match(/([0-9,]+)/);
      if (totalIncomeMatch) {
        salary.totalIncome = parseFloat(totalIncomeMatch[1].replace(/,/g, '')) || 0;
      }
      
      salary.receiveDate = row[14] || null;
    }
  });

  return salary;
};

/**
 * Parse expense sheet data
 * @param {Array} data - Raw sheet data
 * @returns {Array} Array of parsed expense items
 */
const parseExpenseSheet = (data) => {
  const expenses = [];
  
  // Parse data rows (skip header rows)
  data.forEach((row, idx) => {
    if (!row || row.length === 0 || idx < 1) return;
    
    // Check if this is a data row (starts with a number)
    const firstCol = row[0];
    if (typeof firstCol === 'number' && firstCol > 0) {
      const expense = {
        category: row[1] || '',
        itemName: row[2] || '',
        quantity: parseFloat(row[3]) || 1,
        unitPrice: parseFloat(row[4]) || 0,
        totalAmount: parseFloat(row[5]) || 0,
        month: row[7] || null
      };
      
      // Parse allocation data if available
      if (row.length > 8) {
        expense.allocation = {
          previousMonthSalary: parseFloat(row[8]) || 0,
          motherGift: parseFloat(row[9]) || 0,
          nec: parseFloat(row[10]) || 0,
          ffa: parseFloat(row[11]) || 0,
          educ: parseFloat(row[12]) || 0,
          play: parseFloat(row[13]) || 0,
          give: parseFloat(row[14]) || 0,
          lts: parseFloat(row[15]) || 0
        };
      }
      
      expenses.push(expense);
    }
  });

  return expenses;
};

/**
 * Parse deposit sheet data
 * @param {Array} data - Raw sheet data
 * @returns {Array} Array of parsed deposit accounts
 */
const parseDepositSheet = (data) => {
  const deposits = [];
  
  // Parse data rows (skip header rows)
  data.forEach((row, idx) => {
    if (!row || row.length === 0 || idx < 1) return;
    
    const firstCol = String(row[0] || '').toLowerCase();
    
    // Check if this is a total row
    if (firstCol.includes('tổng') && idx > 2) {
      const deposit = {
        bank: row[1] || '',
        accountType: row[2] || '',
        status: row[3] || 'active',
        accountName: row[4] || '',
        accountNumber: row[5] || '',
        startDate: row[7] || null,
        maturityDate: row[8] || null,
        termMonths: parseFloat(row[9]) || 0,
        interestRate: parseFloat(row[10]) || 0,
        principalAmount: parseFloat(row[11]) || 0,
        interestAmount: parseFloat(row[12]) || 0,
        totalAmount: parseFloat(row[13]) || 0
      };
      
      deposits.push(deposit);
    }
  });

  return deposits;
};

/**
 * Parse bank account settings sheet data
 * @param {Array} data - Raw sheet data
 * @returns {Array} Array of parsed bank accounts
 */
const parseBankAccountSheet = (data) => {
  const accounts = [];
  
  // Parse data rows (skip header row)
  data.forEach((row, idx) => {
    if (!row || row.length === 0 || idx < 1) return;
    
    // Check if this is a data row with bank info
    if (row[0] && row[1] && row[2]) {
      const account = {
        bank: row[0] || '',
        accountHolder: row[1] || '',
        accountNumber: row[2] || '',
        branch: row[3] || '',
        identifier: row[4] || ''
      };
      
      accounts.push(account);
    }
  });

  return accounts;
};

/**
 * Export Excel file from data
 * @param {Object} data - Data to export
 * @returns {Buffer} Excel file buffer
 */
const exportToExcel = (data) => {
  const workbook = XLSX.utils.book_new();

  // Add each sheet
  Object.keys(data).forEach(sheetName => {
    const worksheet = XLSX.utils.json_to_sheet(data[sheetName]);
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  });

  // Generate buffer
  return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
};

module.exports = {
  parseExcelFile,
  parseRentalSheet,
  parseSalarySheet,
  parseExpenseSheet,
  parseDepositSheet,
  parseBankAccountSheet,
  exportToExcel
};
