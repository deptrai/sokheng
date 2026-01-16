/**
 * Global type definitions for user-related data structures
 */

/**
 * UserInfo - Main user profile type used in Jotai state management
 * This represents the authenticated user's information stored in localStorage
 */
interface UserInfo {
    id: string;
    name?: string | null;
    phone?: string | null;
    email?: string;
    telegramId?: string | null;
    roles?: string[];
    addresses?: {
        city?: string | null;
        district: string;
        apartment: string;
        houseNumber: string;
        entrance?: string | null;
        id?: string | null;
    }[] | null;
}

/**
 * UserData - Alias for UserInfo for backward compatibility
 * Used in some components that reference UserData type
 */
type UserData = UserInfo;
