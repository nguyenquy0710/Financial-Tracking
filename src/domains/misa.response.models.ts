export default MisaResponse;
export interface MisaResponse<T = any> {
  status: number;
  ok: boolean;
  message?: string;
  data: T;
}

export interface MisaLoginResponse {
  userId: string;
  accessToken: string;
  refreshToken: string;
  sessionId: string;
  userName: string;
  twoFactorEnabled: boolean;
  userMisaId: string;
  default: any;
}

export interface MisaUserInfoResultModel {
  userId: string;
  transactionDbId: string;
  lastName: string;
  fullName: string;
  userShareCode: string;
  email: string;
  avatarObjectId: string;
  language: string;
  currency: string;
  currencyCode: string;
  languageCategoryInitialize: string;
  languageCategory: string;
  settingInfoJson: string;
  isConfirmShareCode: boolean;
  featureLimit: any;
  region: string;
  totalCoin: number;
  appversion: number;
  startDate: string;
  endDate: string;
};

export interface MisaTransaction {
  id?: string;
  _id?: string;
  transactionDate?: string;
  date?: string;
  amount?: number;
  totalAmount?: number;
  category?: {
    name?: string;
  };
  categoryName?: string;
  note?: string;
  description?: string;
}

export interface ImportResult {
  imported: Array<any>;
  skipped: Array<any>;
  errors: Array<any>;
}

export interface TokenError extends Error {
  message: string;
}
