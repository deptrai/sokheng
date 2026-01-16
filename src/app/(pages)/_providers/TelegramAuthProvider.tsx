'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSetAtom } from 'jotai';
import atoms from '@/app/(pages)/_providers/jotai';

interface TelegramUser {
    id: string;
    name: string;
    telegramId: string;
    roles: string[];
}

interface TelegramAuthContextValue {
    isLoading: boolean;
    isTelegramWebApp: boolean;
    telegramUser: TelegramUser | null;
    error: string | null;
}

const TelegramAuthContext = createContext<TelegramAuthContextValue>({
    isLoading: true,
    isTelegramWebApp: false,
    telegramUser: null,
    error: null,
});

export const useTelegramAuth = () => useContext(TelegramAuthContext);

interface TelegramAuthProviderProps {
    children: React.ReactNode;
}

/**
 * TelegramAuthProvider
 * 
 * Automatically authenticates users when app is opened in Telegram Mini App context.
 * Updates Jotai userProfile atom on successful authentication.
 */
export function TelegramAuthProvider({ children }: TelegramAuthProviderProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [isTelegramWebApp, setIsTelegramWebApp] = useState(false);
    const [telegramUser, setTelegramUser] = useState<TelegramUser | null>(null);
    const [error, setError] = useState<string | null>(null);

    const setUserProfile = useSetAtom(atoms.userProfile);

    useEffect(() => {
        async function authenticateTelegramUser() {
            // Check if running in Telegram WebApp context
            if (typeof window === 'undefined' || !window.Telegram?.WebApp) {
                setIsLoading(false);
                return;
            }

            const webApp = window.Telegram.WebApp;
            setIsTelegramWebApp(true);

            // Initialize Telegram WebApp
            webApp.ready();
            webApp.expand();

            // Get initData
            const initData = webApp.initData;
            if (!initData) {
                console.warn('Telegram WebApp initData is empty');
                setIsLoading(false);
                return;
            }

            try {
                // Call our auth API
                const response = await fetch('/api/auth/telegram', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ initData }),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Authentication failed');
                }

                const data = await response.json();

                if (data.success && data.user) {
                    setTelegramUser(data.user);

                    // Update Jotai userProfile atom with proper UserInfo type
                    setUserProfile({
                        id: data.user.id,
                        name: data.user.name,
                        telegramId: data.user.telegramId,
                        roles: data.user.roles,
                    });

                    console.log('Telegram user authenticated:', data.user);
                }
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Unknown error';
                setError(errorMessage);
                console.error('Telegram authentication error:', errorMessage);
            } finally {
                setIsLoading(false);
            }
        }

        authenticateTelegramUser();
    }, [setUserProfile]);

    const value: TelegramAuthContextValue = {
        isLoading,
        isTelegramWebApp,
        telegramUser,
        error,
    };

    return (
        <TelegramAuthContext.Provider value={value}>
            {children}
        </TelegramAuthContext.Provider>
    );
}
