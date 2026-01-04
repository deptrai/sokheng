# Telegram Mini App Setup Guide

## 1. Create Telegram Bot

1. Open Telegram and search for `@BotFather`
2. Send `/newbot` command
3. Follow instructions to set bot name and username
4. Copy the API token provided

## 2. Configure Bot

Send these commands to @BotFather:

```
/setmenubutton
[Select your bot]
[Button text]: 🍕 Order Food
[Web App URL]: https://your-deployed-app.vercel.app
```

## 3. Environment Variables

Add to `.env.local`:

```env
TELEGRAM_BOT_TOKEN=your_bot_token_here
NEXT_PUBLIC_TELEGRAM_BOT_USERNAME=your_bot_username
```

## 4. Deploy Application

### Option A: Vercel (Recommended)

```bash
pnpm run build
vercel --prod
```

### Option B: Netlify

```bash
pnpm run build
netlify deploy --prod --dir=out
```

## 5. Update Bot URL

After deployment, update bot menu button with your production URL:

```
/setmenubutton
[Your bot]
[Button text]: 🍕 Order Food
[Web App URL]: https://your-actual-domain.vercel.app
```

## 6. Test

1. Open your bot in Telegram
2. Click the menu button
3. App should open in Telegram WebView
4. Test ordering flow and payments

## Important Notes

- **HTTPS Required**: Telegram only works with HTTPS URLs
- **Mobile First**: Design for mobile viewport (Telegram WebView)
- **Theme Support**: App automatically adapts to Telegram light/dark theme
- **Payments**: Integrate Telegram Payments API for checkout
- **Notifications**: Use bot to send order updates

## Next Steps

1. Implement Telegram Payments API
2. Add order notifications via bot
3. Optimize UI for mobile Telegram experience
4. Test on multiple devices
