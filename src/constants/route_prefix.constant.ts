// src/constants/route_prefix.constant.ts
// Constants for route prefixes used in the application

// Type definition for route prefix structure
export interface RoutePrefix {
  MENU_NAME?: string;
  BASE: string;
  SUB_ROUTE?: {
    [key: string]: RoutePrefix;
  };
}

// General route prefixes for main application routes
export const ROUTE_PREFIX = {
  MENU_NAME: 'Landing',
  BASE: '/',

  CHANGELOG: {
    MENU_NAME: 'Changelog',
    BASE: '/changelog',
    FILE_PATH: '/CHANGELOG.md',
  },

  AUTH: {
    MENU_NAME: 'Auth',
    BASE: '/auth',
    WEB_PAGE: {
      INDEX: '/',
      LOGIN: '/login',
      REGISTER: '/register',
      FORGOT_PASSWORD: '/forgot-password',
      RESET_PASSWORD: '/reset-password',
      VERIFY_EMAIL: '/verify-email',
      VERIFY_2FA: '/verify-2fa',
    }
  },

};

// Route prefixes for app module routes
export const APP_ROUTE_PREFIX = {
  MENU_NAME: 'App',
  BASE: '/app',

  DASHBOARD: {
    MENU_NAME: 'Dashboard',
    BASE: '/dashboard',
    WEB_PAGE: {
      INDEX: '/',
    }
  },

  RENTAL: {
    MENU_NAME: 'Rentals',
    BASE: '/rentals',
    WEB_PAGE: {
      INDEX: '/',
      DETAIL: '/:id/detail',
    }
  },

  TOTP: {
    MENU_NAME: 'TOTP',
    BASE: '/totp',
    WEB_PAGE: {
      INDEX: '/',
    }
  },
};

// Route prefixes for admin module routes
export const ADMIN_ROUTE_PREFIX = {
  MENU_NAME: 'Admin',
  BASE: '/admin',

  DASHBOARD: {
    MENU_NAME: 'Dashboard',
    BASE: '/dashboard',
    WEB_PAGE: {
      INDEX: '/',
    }
  },

  SETTINGS: {
    MENU_NAME: 'Settings',
    BASE: '/settings',
    WEB_PAGE: {
      INDEX: '/',
    }
  },
};

// Route prefixes for API endpoints
export const API_ROUTE_PREFIX = {
  BASE: '/api',
  SWAGGER: '/api-docs',
  SWAGGER_JSON: '/api-docs.json',

  AUTH: {
    MENU_NAME: 'Auth API',
    BASE: '/auth',
  },

  TRANSACTIONS: {
    MENU_NAME: 'Transactions API',
    BASE: '/transactions',
  },

  CATEGORIES: {
    MENU_NAME: 'Categories API',
    BASE: '/categories',
  },
};
