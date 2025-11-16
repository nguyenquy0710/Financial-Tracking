# AGENTS.md

Phiên bản: 1.0  
Ngày: 2025-10-29

## Mục đích

Tài liệu này mô tả các "agent" (thành phần tự động) trong dự án FinTrack (Financial-Tracking), vai trò của từng agent, cách cấu hình và cách chạy/chẩn đoán. Mục tiêu là chuẩn hoá cách thêm/sửa agent, đảm bảo hoạt động ổn định và an toàn dữ liệu tài chính người dùng.

---

## Tổng quan các agent

Các agent được chia theo vai trò chính sau:

- Data Collector
  - Nhiệm vụ: Thu thập giao dịch từ nguồn (API ngân hàng, CSV/Excel import, nhập tay).
  - Input: API key/CSV file/upload event.
  - Output: Chuỗi giao dịch chuẩn hoá vào hệ thống (DB/queue).
- Transaction Classifier
  - Nhiệm vụ: Phân loại giao dịch (mua sắm, ăn uống, tiền lương...), gán nhãn tự động theo rules/ML.
  - Input: Giao dịch thô.
  - Output: Giao dịch có category, tags, confidence score.
- Budget Advisor
  - Nhiệm vụ: Phân tích chi tiêu, tạo cảnh báo/suggest ngân sách hàng tháng.
  - Input: Lịch sử giao dịch và cấu hình người dùng.
  - Output: Báo cáo, cảnh báo, gợi ý ngân sách.
- Notification Agent
  - Nhiệm vụ: Gửi thông báo (email, push) khi có cảnh báo, nhắc thanh toán, hoặc summary.
  - Input: Sự kiện từ hệ thống (threshold breached, new report).
  - Output: Message qua kênh tương ứng.
- Sync Agent
  - Nhiệm vụ: Đồng bộ dữ liệu giữa các dịch vụ (ví dụ: backup vào cloud, sync với analytics).
  - Input/Output: Data sync jobs.
- Scheduler
  - Nhiệm vụ: Lên lịch cho các job định kỳ (import, repair jobs, report generation).
  - Implementation: Cron-based hoặc job queue (Bull/Agenda).
- Auth & Compliance Agent
  - Nhiệm vụ: Xử lý đăng nhập, xác thực token, kiểm tra quyền truy cập, lưu audit log.
  - Quan trọng cho GDPR/PDPA compliance.

---

## Kiến trúc triển khai

- Mỗi agent có thể được triển khai dưới dạng:
  - Worker process độc lập (Node.js service, run bằng PM2/systemd/docker).
  - Job trong queue (Redis + Bull/Agenda).
  - Serverless function cho các tác vụ ngắn (AWS Lambda / Cloud Functions).
- Giao tiếp giữa các agent:
  - Queue (Redis), hoặc HTTP internal API, hoặc message broker (RabbitMQ/Kafka) tùy quy mô.
- Dữ liệu trung tâm: PostgreSQL (hoặc MongoDB tuỳ module) + object storage cho file imports.

---

## Cấu hình chung

- Biến môi trường bắt buộc:
  - NODE_ENV
  - DATABASE_URL
  - REDIS_URL (nếu dùng queue)
  - NOTIFICATION_SMTP_URL / PUSH_CONFIG
  - EXTERNAL_API_KEYS (bank connectors) — lưu trong secrets manager
- File cấu hình agent (ví dụ: config/agents/\*.json)
  - enabled: true/false
  - concurrency: số worker
  - schedule: cron string (nếu cần)

Ví dụ cấu hình (config/agents/budget-advisor.json):

```json
{
  "enabled": true,
  "concurrency": 1,
  "schedule": "0 6 * * *",
  "budgetDefault": 5000000
}
```

---

## Cách chạy & debug

- Local:
  - npm install
  - Copy `.env.example` → `.env` và cấu hình biến.
  - Chạy một agent cụ thể:
    - NODE_ENV=development node src/agents/data-collector.js
    - Hoặc dùng script: npm run start:agent -- data-collector
- Docker:
  - Mỗi agent có thể có Dockerfile riêng hoặc dùng image chung với biến AGENT_NAME.
- Logs:
  - Định dạng JSON, ghi qua stdout để thu thập bởi docker/kubernetes.
  - Cấu hình log level bằng LOG_LEVEL (info/warn/error/debug).
- Monitoring:
  - Export metrics (Prometheus) từ mỗi agent: job_duration_seconds, job_errors_total, job_processed_total.

---

## Kiểm thử

- Unit test cho logic phân loại, validate trên sample CSV.
- Integration test:
  - Mock API keys và Redis/DB (sử dụng test containers hoặc in-memory adapters).
- End-to-end:
  - Tạo scenario import CSV → classify → generate budget report → verify notification.

---

## Bảo mật & riêng tư

- Tuyệt đối không lưu plain API keys trong repo.
- Dữ liệu người dùng (PII) phải mã hoá at-rest hoặc chỉ lưu fields cần thiết.
- Agent chỉ truy cập dữ liệu phù hợp với scope của nó.
- Audit logs phải ghi lại: agent name, job id, timestamp, action, outcome.

---

## Cách đóng góp (Contributing)

- Thêm agent mới:
  1. Tạo file src/agents/<agent-name>.ts (hoặc .js) theo pattern hiện có.
  2. Đăng ký config mặc định trong config/agents/<agent-name>.json.example.
  3. Viết unit tests trong tests/agents/.
  4. Mở PR mô tả rõ: mục đích, contract input/output, security considerations.
- Tiêu chuẩn code:
  - Dùng ESLint + Prettier config dự án.
  - TypeScript ưu tiên; nếu JS cần JSDoc.

---

## Ví dụ nhanh: template agent (pseudo)

```js
// src/agents/example-agent.js
async function run(job) {
  // validate input
  // process
  // persist result
  // emit events
}
module.exports = { run };
```

---

## FAQ / Lưu ý

- Q: Agent có thể thay đổi DB schema trực tiếp không?
  - A: Không — mọi migration phải qua system migrations (migrations folder).
- Q: Khi nào dùng serverless vs worker?
  - A: Dùng serverless cho tác vụ ngắn, ít trạng thái; worker cho job dài, cần concurrency hoặc heavy CPU.

---

## Liên hệ

- Repo: https://github.com/nguyenquy0710/Financial-Tracking
- Owner & Maintainer: @nguyenquy0710
