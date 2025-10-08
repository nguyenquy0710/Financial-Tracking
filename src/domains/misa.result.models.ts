export default MisaResultModel;
export type MisaResultModel = {
  userId: string;
};

export type MisaAuthResultModel = MisaResultModel & {
  accessToken: string;
  refreshToken: string;
  sessionId: string;
  userName: string;
  twoFactorEnabled: boolean;
  userMisaId: string;
  default: any;
};

export type MisaUserInfoResultModel = MisaResultModel & {
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
