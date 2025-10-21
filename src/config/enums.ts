// Enum for System Configuration Names
export enum SystemConfigName {
  APP_VERSION = 'APP_VERSION',
  MAINTENANCE_MODE = 'MAINTENANCE_MODE',
  CURRENCY = 'CURRENCY',
  DATE_FORMAT = 'DATE_FORMAT',
  TIMEZONE = 'TIMEZONE',
  BACKUP_SCHEDULE = 'BACKUP_SCHEDULE',
  EMAIL_NOTIFICATIONS = 'EMAIL_NOTIFICATIONS',
  MAX_FILE_UPLOAD_SIZE = 'MAX_FILE_UPLOAD_SIZE',
  SESSION_TIMEOUT = 'SESSION_TIMEOUT',
  DEFAULT_LANGUAGE = 'DEFAULT_LANGUAGE',
  TAX_RATE = 'TAX_RATE',
  INTEREST_RATE = 'INTEREST_RATE',
  EXCHANGE_RATES = 'EXCHANGE_RATES',
  BUDGET_ALERT_THRESHOLD = 'BUDGET_ALERT_THRESHOLD',
  AUTO_BACKUP_ENABLED = 'AUTO_BACKUP_ENABLED'
}

// Enum for Budget Periods
export enum BudgetPeriod {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  YEARLY = 'yearly'
}

// Enum for Category Types
export enum CategoryType {
  INCOME = 'income',
  EXPENSE = 'expense'
}

// Enum for Deposit Statuses
export enum DepositStatus {
  ACTIVE = 'active',
  CLOSED = 'closed',
  MATURED = 'matured'
}

// Enum for Account Types
export enum AccountType {
  SAVINGS = 'savings',
  FIXED = 'fixed',
  CURRENT = 'current',
  RECURRING = 'recurring'
}

// Enum for Expense Sources
export enum ExpenseSource {
  MANUAL = 'Manual',
  MISA = 'MISA',
  EXCEL = 'Excel',
  API = 'API'
}

// Enum for Allocation Types
export enum AllocationType {
  MOTHER_GIFT = 'motherGift',
  NEC = 'nec',
  FFA = 'ffa',
  EDUC = 'educ',
  PLAY = 'play',
  GIVE = 'give',
  LTS = 'lts'
}

// Enum for Goal Priorities
export enum GoalPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high'
}

// Enum for Goal Types
export enum GoalStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  PAUSED = 'paused',
  CANCELLED = 'cancelled'
}

// Enum for Reminder Frequencies
export enum ReminderFrequency {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly'
}

// Enum for Bill Types
export enum BillType {
  RENT = 'rent',
  ELECTRICITY = 'electricity',
  WATER = 'water',
  INTERNET = 'internet',
  PARKING = 'parking',
  GARBAGE = 'garbage',
  OTHER = 'other'
}

// Enum for Bill Frequencies
export enum BillFrequency {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  YEARLY = 'yearly'
}

// Enum for Companies
export enum Company {
  VIHAT = 'VIHAT',
  DAKIATECH = 'DAKIATECH',
  OTHER = 'OTHER'
}

// Enum for Growth Types
export enum GrowthType {
  BASIC_SALARY = 'basicSalary',
  FREELANCE = 'freelance',
  TOTAL_INCOME = 'totalIncome'
}

// Enum for Saving Types
export enum SavingType {
  MOTHER = 'mother',
  FUND = 'fund'
}

// Enum for Fund Types
export enum FundType {
  PERSONAL = 'personal',
  BUSINESS = 'business',

  EMERGENCY = 'emergency',
  INVESTMENT = 'investment',
  RETIREMENT = 'retirement',
  EDUCATION = 'education',
  TRAVEL = 'travel',
  OTHER = 'other'
}

// Enum for Transaction Types
export enum TransactionType {

  RETIREMENT = 'retirement',
  EDUCATION = 'education'
}

// Enum for Transaction Types
export enum TransactionType {
  INCOME = 'income',
  EXPENSE = 'expense'
}

// Enum for Transaction Statuses
export enum PaymentMethod {
  CASH = 'cash',
  CARD = 'card',
  BANK_TRANSFER = 'bank_transfer',
  E_WALLET = 'e_wallet',
  OTHER = 'other'
}

// Enum for Transaction Statuses
export enum RecurringFrequency {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  YEARLY = 'yearly'
}

// Enum for Currencies
export enum Currency {
  VND = 'VND',
  USD = 'USD',
  EUR = 'EUR'
}

// Enum for Languages
export enum Language {
  VIETNAMESE = 'vi',
  ENGLISH = 'en'
}

// Enum for Config Statuses
export enum ConfigStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending'
}

// Enum for Config Types
export enum ConfigType {
  MISA = 'misa',
  EXCEL = 'excel',
  API = 'api'
}
