// src/constants/route_prefix.constant.ts
// Constants for route prefixes used in the application

// Route prefixes for different modules
export const ROUTE_PREFIX = {
  AUTH: {
    MENU_NAME: 'Auth',
    BASE: '/auth',
    API: {},
    WEB_PAGE: {
      INDEX: '/',
      LOGIN: '/login',
      REGISTER: '/register',
    }
  },
  RENTAL: {
    MENU_NAME: 'Rentals',
    BASE: '/rentals',
    API: {},
    WEB_PAGE: {
      INDEX: '/',
      DETAIL: '/:id/detail',
    }
  },
  TOTP: {
    MENU_NAME: 'TOTP',
    BASE: '/totp',
    API: {},
    WEB_PAGE: {
      INDEX: '/',
    }
  },
};
