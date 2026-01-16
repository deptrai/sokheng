import { createHmac } from 'crypto';

/**
 * Telegram WebApp initData validation interface
 */
export interface TelegramUser {
    id: number;
    first_name: string;
    last_name?: string;
    username?: string;
    language_code?: string;
    is_premium?: boolean;
    photo_url?: string;
}

export interface TelegramWebAppData {
    user: TelegramUser;
    auth_date: number;
    hash: string;
    query_id?: string;
    [key: string]: any;
}

/**
 * Validates Telegram WebApp initData using HMAC-SHA256
 * 
 * @param initData - Raw initData string from window.Telegram.WebApp.initData
 * @param botToken - Telegram Bot Token from environment variable
 * @returns Parsed user data if valid, throws error if invalid
 * 
 * @see https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
 */
export function validateTelegramWebAppData(
    initData: string,
    botToken: string
): TelegramWebAppData {
    if (!initData || !botToken) {
        throw new Error('initData and botToken are required');
    }

    // Parse the initData string into URLSearchParams
    const params = new URLSearchParams(initData);
    const hash = params.get('hash');

    if (!hash) {
        throw new Error('Hash is missing from initData');
    }

    // Remove hash from params for validation
    params.delete('hash');

    // Create data-check-string by sorting params alphabetically
    const dataCheckString = Array.from(params.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, value]) => `${key}=${value}`)
        .join('\n');

    // Generate secret key: HMAC-SHA256(bot_token, "WebAppData")
    const secretKey = createHmac('sha256', 'WebAppData')
        .update(botToken)
        .digest();

    // Generate hash: HMAC-SHA256(secret_key, data_check_string)
    const computedHash = createHmac('sha256', secretKey)
        .update(dataCheckString)
        .digest('hex');

    // Compare hashes
    if (hash !== computedHash) {
        throw new Error('Invalid initData: hash mismatch');
    }

    // Check auth_date (optional: prevent replay attacks)
    const authDate = parseInt(params.get('auth_date') || '0', 10);
    const currentTime = Math.floor(Date.now() / 1000);
    const maxAge = 86400; // 24 hours

    if (currentTime - authDate > maxAge) {
        throw new Error('initData is too old (expired)');
    }

    // Parse user data
    const userParam = params.get('user');
    if (!userParam) {
        throw new Error('User data is missing from initData');
    }

    let user: TelegramUser;
    try {
        user = JSON.parse(userParam);
    } catch (error) {
        throw new Error('Failed to parse user data from initData');
    }

    // Build result object
    const result: TelegramWebAppData = {
        user,
        auth_date: authDate,
        hash,
    };

    // Add optional fields
    const queryId = params.get('query_id');
    if (queryId) {
        result.query_id = queryId;
    }

    return result;
}

/**
 * Generate a placeholder email for Telegram users
 * Format: tg_<telegram_id>@telegram.placeholder
 */
export function generateTelegramPlaceholderEmail(telegramId: number): string {
    return `tg_${telegramId}@telegram.placeholder`;
}
