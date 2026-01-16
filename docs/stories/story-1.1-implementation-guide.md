# Story 1.1 - Implementation Guide

## ✅ Đã hoàn thành

### 1. Database Schema
- ✅ Thêm trường `telegramId` vào `Customers` collection
  - File: `src/app/(payload)/collections/Customers/index.ts`
  - Type: text, unique, sparse, readOnly

### 2. Auth Utility
- ✅ Tạo `src/utils/telegram-auth.ts`
  - Function: `validateTelegramWebAppData()` - Validate HMAC-SHA256
  - Function: `generateTelegramPlaceholderEmail()` - Tạo email placeholder

### 3. API Endpoint
- ✅ Tạo `src/app/api/auth/telegram/route.ts`
  - POST endpoint xử lý initData
  - Tự động tạo/login customer
  - Trả về JWT token

### 4. Client Integration
- ✅ Tạo `src/app/(pages)/_providers/TelegramAuthProvider.tsx`
  - React Context Provider
  - Auto-authenticate khi mở trong Telegram
  - Tích hợp với Jotai state

### 5. TypeScript Support
- ✅ Tạo `src/types/telegram-webapp.d.ts`
  - Type definitions cho Telegram WebApp API

## 🔧 Cách Setup

### Bước 1: Tạo Telegram Bot
```bash
# 1. Mở Telegram, tìm @BotFather
# 2. Gửi /newbot
# 3. Làm theo hướng dẫn để đặt tên bot
# 4. Copy Bot Token
```

### Bước 2: Cấu hình Environment Variables
```bash
# Thêm vào file .env
TELEGRAM_BOT_TOKEN=your_actual_bot_token_here
NEXT_PUBLIC_TELEGRAM_BOT_USERNAME=your_bot_username
```

### Bước 3: Cấu hình Bot Menu Button
```bash
# Gửi cho @BotFather:
/setmenubutton
# Chọn bot của bạn
# Button text: 🍕 Order Food
# Web App URL: https://your-domain.vercel.app
```

### Bước 4: Integrate Provider vào Layout
Cần thêm `TelegramAuthProvider` vào root layout:

```tsx
// src/app/(pages)/layout.tsx hoặc tương tự
import { TelegramAuthProvider } from './_providers/TelegramAuthProvider';

export default function Layout({ children }) {
  return (
    <TelegramAuthProvider>
      {children}
    </TelegramAuthProvider>
  );
}
```

### Bước 5: Build và Deploy
```bash
pnpm run build
# Deploy lên Vercel hoặc platform khác (HTTPS required!)
```

## 🧪 Testing

### Test Local (Development)
Do Telegram WebApp chỉ hoạt động trong Telegram context, để test local:

1. **Mock Telegram WebApp** (cho development):
```typescript
// Thêm vào dev environment
if (process.env.NODE_ENV === 'development') {
  window.Telegram = {
    WebApp: {
      initData: 'mock_init_data_here',
      ready: () => console.log('Mock Telegram ready'),
      expand: () => console.log('Mock Telegram expand'),
      // ... other mock methods
    }
  };
}
```

2. **Test API trực tiếp**:
```bash
curl -X POST http://localhost:3000/api/auth/telegram \
  -H "Content-Type: application/json" \
  -d '{"initData": "your_test_init_data"}'
```

### Test Production
1. Deploy app lên Vercel
2. Cấu hình bot menu button với URL production
3. Mở bot trong Telegram
4. Click menu button
5. Kiểm tra console logs và network requests

## 📝 Notes

### Security
- ✅ `TELEGRAM_BOT_TOKEN` chỉ dùng server-side (không expose ra client)
- ✅ Validate HMAC-SHA256 để đảm bảo initData không bị giả mạo
- ✅ Check auth_date để prevent replay attacks (max 24h)

### Database
- ✅ `telegramId` là unique và sparse (cho phép null)
- ✅ Email placeholder format: `tg_<telegram_id>@telegram.placeholder`
- ✅ Không set password cho Telegram users (auth qua initData only)

### UX Considerations
- Cần ẩn header/footer khi chạy trong Telegram context
- Sử dụng Telegram theme colors (`var(--tg-theme-bg-color)`)
- Thêm haptic feedback cho better UX

## 🐛 Troubleshooting

### Issue: "Invalid initData: hash mismatch"
- Kiểm tra `TELEGRAM_BOT_TOKEN` có đúng không
- Đảm bảo initData không bị modify

### Issue: "Telegram authentication is not configured"
- Thêm `TELEGRAM_BOT_TOKEN` vào `.env`
- Restart dev server

### Issue: Provider không hoạt động
- Kiểm tra Provider đã được wrap ở root layout chưa
- Check browser console cho errors

## 📚 Tài liệu tham khảo
- [Telegram Mini Apps Documentation](https://core.telegram.org/bots/webapps)
- [Validating initData](https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app)
- Story research: `docs/telegram_integration_research.md`
