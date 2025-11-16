import { v4 as uuidv4 } from "uuid";
import express from "express";

import { requestLogger } from "./logger.middleware";
import configApp from "@/config/config";
import { X_DEVICE_ID, X_REQUEST_ID } from "@/constants/app_key_config.constant";

/**
 * Custom Middleware
 * @param {*} opts Options for middleware configuration (hiện chưa dùng)
 * @returns express.Router instance with middleware applied
 */
export default function customMiddleware(opts: any): express.Router {
  const router = express.Router();

  // Middleware thêm header X_REQUEST_ID và X-Powered-By
  router.use((req, res, next) => {

    // Check for existing device ID in headers or cookies
    let deviceId = req.headers[X_DEVICE_ID] || req.cookies[X_DEVICE_ID] || '';
    if (!deviceId) {
      // Generate a simple random device ID (for demonstration purposes)
      deviceId = 'device-' + Math.random().toString(36).substr(2, 9) + Math.random().toString(36).substr(2, 9);
      // Set device ID in cookie for future requests
      res.cookie(X_DEVICE_ID, deviceId, { httpOnly: true, maxAge: 31536000000 }); // 1 year
    }

    // Thêm X_REQUEST_ID nếu chưa có
    let requestId = req.headers[X_REQUEST_ID] || '';
    if (!requestId) {
      requestId = uuidv4().split("-")[0];
      req.headers[X_REQUEST_ID] = requestId;
    }

    // Gán requestId và deviceId vào req để sử dụng trong các middleware hoặc route handler khác
    (req as any).requestId = requestId;
    (req as any).deviceId = deviceId;

    res.setHeader('X-Powered-By', configApp.app?.name || 'FinTrack');

    // Tiếp tục chuỗi middleware hoặc route handler
    next();
  });

  // Sử dụng middleware requestLogger cho tất cả các route trong ứng dụng
  router.use(requestLogger);

  return router;
}
