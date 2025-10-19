import { v4 as uuidv4 } from "uuid";
import { Request, Response, NextFunction } from "express";
import { accessLogStream, createLogger } from "@/utils/logger";

// Middleware gắn requestId + logger riêng cho mỗi request
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Tạo ID ngẫu nhiên cho request này
    const requestId = uuidv4().split("-")[0]; // gọn hơn, chỉ lấy 1 đoạn UUID
    const context = req.path.split("/")[1] || "App";
    console.log("🚀 QuyNH: requestLogger -> context", context)

    // Tạo logger riêng có requestId
    // const logger = createLogger(context);
    const logger = accessLogStream;
    const childLogger = logger.child({ requestId });

    // Gắn logger và requestId vào request để dùng ở bất kỳ đâu
    (req as any).logger = childLogger;
    (req as any).requestId = requestId;

    // Log thông tin request
    childLogger.info(`📥 ${req.method} ${req.originalUrl}`);

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
