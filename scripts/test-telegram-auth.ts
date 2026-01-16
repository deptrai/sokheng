/**
 * Test script for Telegram WebApp initData validation
 * 
 * Usage:
 *   tsx scripts/test-telegram-auth.ts
 */

import { validateTelegramWebAppData } from '../src/utils/telegram-auth';

// Example test data (this would come from Telegram in production)
const mockInitData = 'query_id=AAHdF6IQAAAAAN0XohDhrOrc&user=%7B%22id%22%3A279058397%2C%22first_name%22%3A%22John%22%2C%22last_name%22%3A%22Doe%22%2C%22username%22%3A%22johndoe%22%2C%22language_code%22%3A%22en%22%7D&auth_date=1716922846&hash=abcdef1234567890';

const mockBotToken = process.env.TELEGRAM_BOT_TOKEN || 'test_bot_token';

console.log('🧪 Testing Telegram WebApp initData validation\n');
console.log('Bot Token:', mockBotToken.substring(0, 10) + '...');
console.log('Init Data:', mockInitData.substring(0, 50) + '...\n');

try {
    const result = validateTelegramWebAppData(mockInitData, mockBotToken);

    console.log('✅ Validation successful!');
    console.log('\nParsed data:');
    console.log('- User ID:', result.user.id);
    console.log('- Name:', result.user.first_name, result.user.last_name);
    console.log('- Username:', result.user.username);
    console.log('- Auth Date:', new Date(result.auth_date * 1000).toISOString());
    console.log('- Hash:', result.hash);

} catch (error) {
    console.error('❌ Validation failed:');
    console.error(error instanceof Error ? error.message : error);

    console.log('\n💡 Tips:');
    console.log('- Make sure TELEGRAM_BOT_TOKEN is set in .env');
    console.log('- Use real initData from Telegram WebApp for testing');
    console.log('- Check that initData is not expired (max 24h)');
}

console.log('\n📝 To test with real data:');
console.log('1. Open your bot in Telegram');
console.log('2. Open Developer Tools in Telegram Desktop');
console.log('3. Get window.Telegram.WebApp.initData');
console.log('4. Replace mockInitData in this script');
