import { v4 as uuidv4 } from "uuid";
import express from "express";

import { requestLogger } from "./logger.middleware";
import configApp from "@/config/config";
import { X_DEVICE_ID, X_REQUEST_ID } from "@/constants/app_key_config.constant";

/**
 * Custom Middleware
 * @param opts Options for middleware configuration (hiện chưa dùng)
 * @returns express.Router instance with middleware applied
 */
export default function customMiddleware(opts: any): express.Router {
  const router = express.Router();

  // Middleware thêm header X_REQUEST_ID và X-Powered-By
  router.use((req, res, next) => {
    req.headers[X_REQUEST_ID] = uuidv4().split("-")[0];

    (req as any).requestId = req.headers[X_REQUEST_ID];
    (req as any).deviceId = req.headers[X_DEVICE_ID] || req.cookies[X_DEVICE_ID] || '';

    res.setHeader('X-Powered-By', configApp.app?.name || 'FinTrack');

    // Tiếp tục chuỗi middleware hoặc route handler
    next();
  });

  // Sử dụng middleware requestLogger cho tất cả các route trong ứng dụng
  router.use(requestLogger);

  return router;
}
