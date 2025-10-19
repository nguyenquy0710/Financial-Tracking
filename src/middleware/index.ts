import express from "express";
import { requestLogger } from "./logger.middleware";

export const customMiddleware = express.Router();
export default customMiddleware;

// Sử dụng middleware requestLogger cho tất cả các route trong ứng dụng
customMiddleware.use(requestLogger);
