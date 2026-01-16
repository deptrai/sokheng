# Nghiên cứu và Kế hoạch Tích hợp Telegram Mini App (TMA) cho Sokheng Order

Tài liệu này trình bày phương án kỹ thuật để chuyển đổi ứng dụng `Ashpez-Food-App` (Sokheng Order) hiện tại (Stack: Next.js + Payload CMS) thành một Telegram Mini App hoàn chỉnh.

## 1. Kiến trúc Tổng quan (Architecture)

Chúng ta sẽ sử dụng mô hình **Hybrid Web App**:
- **Frontend**: Next.js (App Router) chạy trong Telegram WebView.
- **Backend**: Payload CMS (Next.js Serverless) xử lý authentication và data.
- **Database**: MongoDB (lưu trữ thông tin người dùng Telegram liên kết với Customer).

### Tech Stack
- **Client SDK**: `@telegram-apps/sdk` (đã có trong `package.json`).
- **UI Components**: `@telegram-apps/telegram-ui` (đã có trong `package.json`).
- **Auth**: Xác thực `initData` từ Telegram -> Tạo session cho Payload CMS.
- **Deployment**: Vercel (bắt buộc HTTPS).

## 2. Chiến lược Xác thực (Authentication Strategy)

Đây là phần quan trọng nhất để đảm bảo trải nghiệm "Zero-Friction" (không cần đăng nhập lại).

### Luồng dữ liệu (Flow):
1. **Client (TMA)**:
   - Khởi tạo SDK: `const lp = useLaunchParams();`
   - Lấy chuỗi `initDataRaw` (chứa thông tin user và signature).
2. **Client -> Server**:
   - Gửi `initDataRaw` tới API endpoint `/api/auth/telegram`.
3. **Server (Next.js/Payload)**:
   - Validate chữ ký HMAC-SHA256 của `initData` bằng `TELEGRAM_BOT_TOKEN`.
   - Parse thông tin user (ID, first_name, username).
   - **Database Lookup**: Tìm trong collection `Customers` xem có user nào có `telegramId` khớp không.
     - *Nếu có*: Đăng nhập user đó.
     - *Nếu không*: Tạo user mới (hoặc link với account cũ nếu có cơ chế) -> Lưu `telegramId`.
   - Tạo và trả về JWT/Cookie phiên làm việc của Payload CMS.

### Yêu cầu thay đổi Database:
Cần cập nhật Collection `Customers` trong `src/app/(payload)/collections/Customers/index.js`:
```typescript
{
  name: 'telegramId',
  type: 'text',
  unique: true,
  sparse: true, // Cho phép null (những user không dùng Telegram)
  admin: {
    readOnly: true,
  }
}
```

## 3. Giao diện (UI/UX)

Do ứng dụng chạy trong khung WebView của Telegram, cần tối ưu hóa:
- **Ẩn Header/Footer thừa**: Không hiển thị các link điều hướng ngoại vi (About us, Footer links) khi chạy trong môi trường TMA.
- **Theme Awareness**: Sử dụng CSS variables của Telegram (`var(--tg-theme-bg-color)`) để tự động khớp với Dark/Light mode của user.
- **Haptic Feedback**: Sử dụng SDK để rung phản hồi khi user bấm nút đặt hàng.

## 4. Kế hoạch Triển khai (Roadmap)

### Giai đoạn 1: Foundation (Cơ bản)
1. **Cấu hình Payload**: Thêm field `telegramId` vào `Customers`.
2. **Auth API**: Viết route `/api/telegram/auth` để xử lý login.
3. **Middleware**: Bảo vệ các route cần login.

### Giai đoạn 2: UI Adaptation
1. **Layout Wrapper**: Tạo `TelegramProvider` để wrap ứng dụng, check context TMA.
2. **TelegramUI**: Thay thế một số component native bằng `@telegram-apps/telegram-ui` (Buttons, Inputs) nếu cần native feel.

### Giai đoạn 3: Notifications & Order
1. **Order Notification**: Khi đặt hàng thành công, Server gửi tin nhắn về Telegram Bot cho user.
2. **Re-engagement**: Gửi tin nhắn nhắc lại đơn hàng cũ.

## 5. Tài nguyên tham khảo
- **BotFather**: Để tạo bot và lấy Token.
- **Payload Local API**: Để tương tác với DB từ API Route.
- **Telegram SDK Docs**: https://docs.telegram-mini-apps.com/

---
**Trạng thái hiện tại của dự án**:
- Đã cài đặt SDK.
- Đã có `TELEGRAM_SETUP.md` hướng dẫn cơ bản.
- **Cần làm ngay**: Thực hiện Giai đoạn 1 (Auth & Database config).
