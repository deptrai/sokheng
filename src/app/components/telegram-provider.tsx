'use client';

import { useEffect } from 'react';
import { init } from '@telegram-apps/sdk';

export function TelegramProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const [webApp] = init();
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
        webApp.onEvent('themeChanged', () => {
          const newTheme = webApp.themeParams;
          if (newTheme.bg_color) {
            document.body.style.backgroundColor = newTheme.bg_color;
          }
          if (newTheme.text_color) {
            document.body.style.color = newTheme.text_color;
          }
        });
        
        console.log('Telegram Web App initialized', webApp.initDataUnsafe.user);
      } catch (error) {
        console.error('Failed to initialize Telegram Web App:', error);
      }
    }
  }, []);

  return <>{children}</>;
}
