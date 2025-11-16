// absBase.domain.ts
import { createLogger, WinstonLogger } from "@/utils/logger";

// FinalizationRegistry để tự động cleanup khi object bị GC thu hồi bộ nhớ
const registry = new FinalizationRegistry<string>((className) => {
  const tempLogger = createLogger(className);
  tempLogger.info(`${className} finalized (auto cleanup by GC)`);
});

/**
 * Abstract Base Domain Class
 * @abstract
 * @class AbsBaseDomain
 * @extends {WinstonLogger} for logging capabilities
 * @uses {FinalizationRegistry} for automatic cleanup on garbage collection
 * @example
 * class MyDomain extends AbsBaseDomain {
 *   constructor() {
 *     super();
 *   }
 *   protected onDestroy(): void {
 *     this.logger.info("MyDomain cleaned up resources");
 *   }
 * }
 * @note Remember to call super() in the constructor of derived classes.
 * @note Override onDestroy() in derived classes to add custom cleanup logic.
 */
export default abstract class AbsBaseDomain {
  // Each domain will have its own logger instance named after the class
  protected logger: WinstonLogger;

  // Flag to prevent multiple destructions
  private destroyed = false;

  /**
   * Constructor initializes the logger and registers with FinalizationRegistry
   * for automatic cleanup.
   * @constructor
   * @example
   * const myDomain = new MyDomain();
   * // Logs "MyDomain initialized"
   * // When myDomain is garbage collected, logs "MyDomain finalized (auto cleanup by GC)"
   * @note Remember to call super() in the constructor of derived classes.
   * @note Override onDestroy() in derived classes to add custom cleanup logic.
   */
  constructor() {
    const className = this.constructor.name;

    // Mỗi domain con sẽ tự động có logger riêng theo tên class
    this.logger = createLogger(className);

    // Đăng ký với FinalizationRegistry để cleanup tự động khi bị GC
    registry.register(this, className);

    // Log khi khởi tạo domain
    // this.logger.info(`${className} initialized`);
  }

  /**
   * Gọi thủ công để cleanup (nếu cần chủ động)
   * @example
   * const myDomain = new MyDomain();
   * // ... sử dụng myDomain
   * myDomain.destroy(); // Gọi thủ công để cleanup
   * @note Không cần gọi destroy() nếu chỉ muốn cleanup tự động khi bị GC.
   * @note Gọi destroy() nhiều lần sẽ không gây lỗi, nhưng chỉ thực hiện cleanup một lần.
   * @note Nếu cần gọi destroy() từ bên ngoài, hãy đảm bảo rằng đối tượng vẫn còn tham chiếu.
   */
  private destroy(): void {
    if (this.destroyed) return;
    this.destroyed = true;

    this.logger.info(`${this.constructor.name} destroyed`);
    this.onDestroy();

    // Hủy đăng ký với FinalizationRegistry (nếu cần)
    registry.unregister(this);
  }

  /**
   * Cho phép class con override để thêm logic cleanup cụ thể.
   * @example
   * protected onDestroy(): void {
   *   this.logger.info("MyDomain cleaned up resources");
   * }
   * @note Mặc định không làm gì, class con có thể override để thêm logic cleanup.
   */
  protected onDestroy(): void {
    // Mặc định không làm gì
  }

  // abstract method (bắt buộc các class con phải override)
  // abstract doSomething(): void;
}
