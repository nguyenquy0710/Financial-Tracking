import { v4 as uuidv4 } from "uuid";
import { Request, Response, NextFunction } from "express";

import { X_REQUEST_ID } from "@/constants/app_key_config.constant";
import { httpLogStream, } from "@/utils/logger";

// Middleware gắn requestId + logger riêng cho mỗi request
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Tạo ID ngẫu nhiên cho request này
    const requestId = req.headers[X_REQUEST_ID] || uuidv4().split("-")[0]; // gọn hơn, chỉ lấy 1 đoạn UUID
    const context = req.path.split("/")[1] || "App";
    // console.log("🚀 QuyNH: requestLogger -> context", context)

    const userId = (req as any).user ? (req as any).user.id : undefined;

    // Tạo logger riêng có requestId
    // const logger = createLogger("http");
    const childLogger = httpLogStream.child({ requestId, userId });

    // Gắn logger và requestId vào request để dùng ở bất kỳ đâu
    (req as any).logger = childLogger;
    (req as any).requestId = requestId;
    (req as any).userId = userId;

    // Log thông tin request
    childLogger.info(`📤 000 ${req.method} ${req.originalUrl}`);

    // Khi response xong thì log thêm trạng thái
    res.on("finish", () => {
      childLogger.info(`📤 ${res.statusCode} ${req.method} ${req.originalUrl}`);
    });

    next();
  } catch (error) {
    console.error("🚀 QuyNH: requestLogger -> error", error);
    next();
  }
};
