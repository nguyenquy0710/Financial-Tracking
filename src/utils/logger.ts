import winston from "winston";
import path from "path";
import fs from "fs";

export type WinstonLogger = winston.Logger;

// Thư mục lưu log
const logDir = path.join(process.cwd(), "logs");

// Tạo thư mục nếu chưa tồn tại
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

/**
 * Tạo logger có cả output ra console và file riêng theo domain
 * @param context tên domain (VD: 'TotpDomain')
 */
export const createLogger = (context: string): winston.Logger => {
  const logFilePath = path.join(logDir, `${context.toLowerCase()}.log`);

  return winston.createLogger({
    level: "info",
    format: winston.format.combine(
      winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
      winston.format.printf(({ timestamp, level, message }) => {
        return `[${timestamp}] [${context}] ${level.toUpperCase()}: ${message}`;
      })
    ),
    transports: [
      // Ghi ra file riêng cho domain
      new winston.transports.File({ filename: logFilePath }),
      // Log ra console cho dev
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.printf(({ timestamp, level, message }) => {
            return `[${timestamp}] [${context}] ${level}: ${message}`;
          })
        ),
      }),
    ],
  });
};
