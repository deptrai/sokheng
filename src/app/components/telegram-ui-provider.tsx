'use client';

import { useEffect } from 'react';

// Window.Telegram type is defined in src/types/telegram-webapp.d.ts

export function TelegramUIProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Only run in browser and when Telegram WebApp is available
    if (typeof window === 'undefined' || !window.Telegram?.WebApp) {
      return;
    }

    try {
      const webApp = window.Telegram.WebApp;
      webApp.ready();
      webApp.expand();

      // Set theme colors
      const theme = webApp.themeParams;
      if (theme.bg_color) {
        document.body.style.backgroundColor = theme.bg_color;
      }
      if (theme.text_color) {
        document.body.style.color = theme.text_color;
      }

      // Handle theme changes
      // TODO: Add onEvent to TelegramWebApp type definition
      // webApp.onEvent('themeChanged', () => {
      //   const newTheme = webApp.themeParams;
      //   if (newTheme.bg_color) {
      //     document.body.style.backgroundColor = newTheme.bg_color;
      //   }
      //   if (newTheme.text_color) {
      //     document.body.style.color = newTheme.text_color;
      //   }
      // });

      console.log('Telegram Web App initialized', webApp.initDataUnsafe.user);
    } catch (error) {
      // Silent fail when not in Telegram environment
      // Only log in development
      if (process.env.NODE_ENV === 'development') {
        console.warn('Telegram Web App not available:', error);
      }
    }
  }, []);

  return <>{children}</>;
}
