import configApp from '@/config/config';
import { Application, Request, Response, NextFunction, Router } from 'express';

/**
 * Các hằng số dùng để thiết lập các giá trị trong res.locals cho view templates.
 */
export const LocalsConstants = {
  TITLE: configApp.app.name || 'FinTrack',
  DESCRIPTION: configApp.app.description || 'FinTrack - Ứng dụng quản lý tài chính cá nhân hiệu quả.',
  BASE_URL: configApp.app.baseURL || 'http://localhost:3000',
  FOOTER_TEXT: configApp.app.footerText || '© 2025 FinTrack. All rights reserved.',
  SUPPORT_EMAIL: configApp.app.supportEmail || 'support@fintrack.com',
  PRIVACY_POLICY_URL: '/privacy-policy',
  TERMS_OF_SERVICE_URL: '/terms-of-service'
};

/**
 * Hàm khởi tạo các giá trị cố định vào res.locals để sử dụng trong các view templates.
 * @param app Express Application or Router instance to attach the middleware to
 */
export function initLocalsMiddleware(app: Router | Application): void {
  app.use((req: Request, res: Response, next: NextFunction) => {
    try {
      // Thiết lập các giá trị hằng số vào res.locals
      res.locals.title = LocalsConstants.TITLE;
      res.locals.description = LocalsConstants.DESCRIPTION;
      res.locals.supportEmail = LocalsConstants.SUPPORT_EMAIL;
      res.locals.privacyPolicyUrl = LocalsConstants.PRIVACY_POLICY_URL;
      res.locals.termsOfServiceUrl = LocalsConstants.TERMS_OF_SERVICE_URL;

      res.locals.footerText = LocalsConstants.FOOTER_TEXT;

      // Thiết lập các giá trị mặc định có thể được ghi đè trong các route cụ thể sau này nếu cần
      res.locals.timestamp = Date.now();
      res.locals.currentPage = '';
      res.locals.pageTitle = '';
      res.locals.pageDescription = '';
      res.locals.additionalCSS = [];
      res.locals.additionalJS = [];

      next();  // Tiếp tục với middleware hoặc route handler tiếp theo
    } catch (error) {
      console.error("🚀 QuyNH: initLocalsMiddleware -> error", error)
      next();
    }
  });
}
