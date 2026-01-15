import '@testing-library/jest-dom';

// Mock next-intl
jest.mock('next-intl', () => ({
    useLocale: jest.fn(() => 'en'),
    useTranslations: jest.fn(() => (key: string) => key),
}));

// Mock next/navigation
jest.mock('next/navigation', () => ({
    useRouter: jest.fn(() => ({
        push: jest.fn(),
        replace: jest.fn(),
        prefetch: jest.fn(),
    })),
    usePathname: jest.fn(() => '/'),
    useSearchParams: jest.fn(() => new URLSearchParams()),
}));
