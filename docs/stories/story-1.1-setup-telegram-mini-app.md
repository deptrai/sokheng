# Story 1.1: Thiết lập tích hợp Telegram Mini App (TMA) cơ bản

**Trạng thái**: New
**Ưu tiên**: High
**Role**: Developer

## Mô tả (User Story)
Là một người dùng Telegram, tôi muốn mở ứng dụng Sokheng Order ngay bên trong Telegram mà không cần đăng nhập thủ công, để tôi có thể đặt đồ ăn nhanh chóng.

## Bối cảnh kỹ thuật
Dựa trên tài liệu nghiên cứu `docs/telegram_integration_research.md`, chúng ta cần triển khai cơ chế xác thực "Zero-Friction" sử dụng `initData` của Telegram. Ứng dụng hiện tại đang dùng Next.js (App Router) và Payload CMS với MongoDB.

## Tiêu chí chấp nhận (Acceptance Criteria)

### 1. Cập nhật Cơ sở dữ liệu (Database Schema)
- [ ] Thêm trường `telegramId` vào collection `Customers` trong Payload CMS.
    - Type: Text
    - Index: Unique, Sparse (để cho phép user không dùng Telegram)
    - Admin: Read-only (tránh sửa tay nhầm lẫn)

### 2. Tiện ích xác thực (Auth Utility)
- [ ] Viết hàm `validateTelegramWebAppData` trong `src/utils/telegram-auth.ts` (hoặc tương tự).
    - Input: chuỗi `initData` từ client.
    - Logic: Validate HMAC-SHA256 sử dụng `TELEGRAM_BOT_TOKEN`.
    - Output: Object dữ liệu user đã giải mã hoặc Error.

### 3. API Endpoint Xác thực
- [ ] Tạo API Route `POST /api/auth/telegram`.
    - Nhận `initData` từ body.
    - Gọi hàm validate.
    - **Logic Đăng nhập/Đăng ký**:
        - Tìm kiếm Customer có `telegramId` khớp.
        - Nếu tìm thấy: Đăng nhập user đó.
        - Nếu không:
            - Tạo Customer mới với `telegramId`, `name` = `first_name` + `last_name` từ Telegram.
            - `email`: Tạo fake email (ví dụ: `tg_123456@telegram.placeholder`) hoặc để trống nếu Schema cho phép (cần kiểm tra lại Auth strategy của Payload).
    - Trả về: Cookie phiên làm việc hoặc Token của Payload CMS để Client có thể thực hiện các request chính danh tiếp theo.

### 4. Client-side Integration
- [ ] Tạo `TelegramAuthProvider` (React Context) để:
    - Kiểm tra `window.Telegram.WebApp`.
    - Lấy `initData` và gọi API `/api/auth/telegram` khi app khởi động.
    - Lưu trạng thái user vào Global State (Jotai hoặc Context).

## Ghi chú triển khai
- Sử dụng biến môi trường: `TELEGRAM_BOT_TOKEN` (Server-side only).
- Đảm bảo `payload.config.js` đã cấu hình đúng `cookiePrefix` để chia sẻ cookie giữa API Route và Payload CMS nếu cần.

## Tài liệu tham khảo
- [Telegram Mini App Docs - Validating Data](https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app)
- `docs/telegram_integration_research.md`
