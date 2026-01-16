import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@/payload.config';
import {
    validateTelegramWebAppData,
    generateTelegramPlaceholderEmail,
} from '@/utils/telegram-auth';

/**
 * POST /api/auth/telegram
 * 
 * Authenticates Telegram Mini App users using initData validation.
 * Creates new customer if telegramId doesn't exist, or logs in existing customer.
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { initData } = body;

        if (!initData) {
            return NextResponse.json(
                { error: 'initData is required' },
                { status: 400 }
            );
        }

        // Get bot token from environment
        const botToken = process.env.TELEGRAM_BOT_TOKEN;
        if (!botToken) {
            console.error('TELEGRAM_BOT_TOKEN is not configured');
            return NextResponse.json(
                { error: 'Telegram authentication is not configured' },
                { status: 500 }
            );
        }

        // Validate initData
        let telegramData;
        try {
            telegramData = validateTelegramWebAppData(initData, botToken);
        } catch (error) {
            console.error('Telegram initData validation failed:', error);
            return NextResponse.json(
                { error: 'Invalid Telegram authentication data' },
                { status: 401 }
            );
        }

        const { user: telegramUser } = telegramData;
        const telegramId = telegramUser.id.toString();

        // Get Payload instance
        const payload = await getPayload({ config });

        // Check if customer with this telegramId exists
        const existingCustomers = await payload.find({
            collection: 'customers',
            where: {
                telegramId: {
                    equals: telegramId,
                },
            },
            limit: 1,
        });

        let customer;

        if (existingCustomers.docs.length > 0) {
            // Customer exists - log them in
            customer = existingCustomers.docs[0];
            console.log(`Existing Telegram user logged in: ${telegramId}`);
        } else {
            // Create new customer
            const fullName = [telegramUser.first_name, telegramUser.last_name]
                .filter(Boolean)
                .join(' ');

            customer = await payload.create({
                collection: 'customers',
                data: {
                    telegramId,
                    name: fullName || `Telegram User ${telegramId}`,
                    email: generateTelegramPlaceholderEmail(telegramUser.id),
                    roles: ['guest'],
                    // Don't set password - Telegram users authenticate via initData only
                },
            });

            console.log(`New Telegram user created: ${telegramId}`);
        }

        // Create response with user data
        const response = NextResponse.json({
            success: true,
            user: {
                id: customer.id,
                name: customer.name,
                telegramId: customer.telegramId,
                roles: customer.roles,
            },
        });

        // Set Payload auth cookie manually
        // Format: ashpez-token (based on cookiePrefix in payload.config.ts)
        response.cookies.set({
            name: 'ashpez-token',
            value: customer.id,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 604800, // 7 days (same as Payload tokenExpiration)
        });

        return response;

    } catch (error) {
        console.error('Telegram auth error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
