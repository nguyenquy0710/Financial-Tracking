// src/utils/logger.ts
// Winston Logger với rotating-file-stream để ghi log xoay theo ngày và giới hạn dung lượng file log
// Tham khảo:
// - https://github.com/winstonjs/winston-daily-rotate-file
// - https://anonystick.com/blog-developer/logger-nodejs-la-gi-su-dung-winston-la-phai-chuyen-nghiep-nhu-the-nay-202010099590776

import path from "path";
import fs from "fs";
import winston from "winston";
import 'winston-daily-rotate-file'; // Import the transport
import type { DailyRotateFileTransportOptions } from "winston-daily-rotate-file";

export type WinstonLogger = winston.Logger;

// ================== Cấu hình thư mục logs ==================
const logDir = path.join(process.cwd(), "logs");
console.log("🚀 QuyNH: logDir", logDir);
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

// ================== Tạo stream xoay log ==================
const createRotateFileStream = (context: string = 'application', options?: any) =>
  // 🔁 Tạo luồng ghi log xoay theo ngày + giới hạn dung lượng
  new winston.transports.DailyRotateFile({
    dirname: logDir, // Thư mục chứa log
    filename: `${context.toLocaleLowerCase().trim()}-%DATE%.log`, // Tên file log với định dạng ngày thêm vào
    datePattern: 'YYYY-MM-DD', // Định dạng ngày trong tên file log
    zippedArchive: true, // Tự động nén log cũ để tiết kiệm dung lượng (nén thành .gz)
    maxSize: '20m', // Giới hạn kích thước mỗi file: 20MB
    maxFiles: '7d', // Giữ tối đa 7 ngày log
    ...options,
  });

// ================== Hàm tạo Winston logger ==================
/**
 * Tạo logger có cả output ra console và file riêng theo domain
 * @param context tên domain (VD: 'TotpDomain')
 * @param options tuỳ chọn cho rotating-file-stream
 * @returns Winston Logger instance
 * @example
 * const logger = createLogger('MyDomain');
 * logger.info('This is an info message');
 * logger.error('This is an error message');
 */
export const createLogger = (
  context: string,
  options?: DailyRotateFileTransportOptions
): WinstonLogger => {
  // Tạo stream ghi log xoay theo ngày + giới hạn dung lượng
  const rotateStream = createRotateFileStream(context, options);

  return winston.createLogger({
    level: "info", // Mức log tối thiểu (có thể điều chỉnh tuỳ theo môi trường)
    // Định dạng log khi ghi vào file
    format: winston.format.combine(
      winston.format.label({ label: context }), // Thêm nhãn context (domain) vào log
      winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
      // winston.format.json(), // Ghi log dưới dạng JSON
      winston.format.prettyPrint(), // Định dạng dễ đọc hơn khi xem trực tiếp file log (nhưng không chuẩn JSON)
      winston.format.printf((info: any) => {
        const { timestamp, level, message, label, requestId, userId, ...rest } = info || {};

        // Thêm các thông tin bổ sung nếu có
        const extras = Object.keys(rest).length ? ` ${JSON.stringify(rest)}` : "";

        // Tùy chỉnh định dạng log theo ý muốn
        return `[${timestamp}] [${label}] ${level.toUpperCase()} [req:${requestId ?? '-'}] [user:${userId ?? '-'}]: ${message}${extras}`;
      }),
    ),
    // Chỉ định các transport cho logger
    transports: [
      // Ghi qua rotating-file-stream
      new winston.transports.Stream({ stream: rotateStream }),
      // Log ra console cho dev
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.printf((info: any) => {
            // console.log("🚀 QuyNH: info", info)
            const { timestamp, level, message, label, requestId, userId, ...rest } = info || {};

            // Thêm các thông tin bổ sung nếu có
            const extras = Object.keys(rest).length ? ` ${JSON.stringify(rest)}` : "";

            return `[${timestamp}] [${label}] ${level.toUpperCase()} [req:${requestId ?? '-'}] [user:${userId ?? '-'}]: ${message}${extras}`;
          })
        ),
      }),
      // Ghi log lỗi vào file riêng (tuỳ chọn)
      // new winston.transports.File({ filename: 'error.log', level: 'error' }),
    ],
  });
};

// ================== Logger mặc định dùng toàn app ==================
// 🔁 Tạo luồng ghi log xoay theo ngày + giới hạn dung lượng
export const accessLogStream = createLogger("access");
export const httpLogStream = createLogger("http");

// ================== Stream cho Morgan ==================
export const morganAccessStream: winston.Logger & any = {
  write: (message: string) => {
    // Ensure the message is safely logged as a non-empty string
    const logMessage = message?.trim() || '';

    // Nếu message rỗng thì không log gì cả
    if (!logMessage) {
      return;
    }

    // Ghi log theo mức độ khác nhau
    if (logMessage.includes('404')) {
      accessLogStream.warn(logMessage);  // Ghi log cảnh báo cho các lỗi 404
    } else {
      accessLogStream.info(logMessage);  // Ghi log thông thường cho các yêu cầu khác
    }
  },
};
