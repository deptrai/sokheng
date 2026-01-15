import { renderHook, act } from "@testing-library/react";
import { useRouter, usePathname } from "@/i18n/routing";
import { useLocale } from "next-intl";
import useChangeLanguage from "../useChangeLanguage";

// Mock dependencies
jest.mock("@/i18n/routing", () => ({
    useRouter: jest.fn(),
    usePathname: jest.fn(),
}));

jest.mock("next-intl", () => ({
    useLocale: jest.fn(),
}));

describe("useChangeLanguage", () => {
    const mockReplace = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        (useRouter as jest.Mock).mockReturnValue({ replace: mockReplace });
        (usePathname as jest.Mock).mockReturnValue("/test-path");
    });

    it("should not navigate on mount", () => {
        (useLocale as jest.Mock).mockReturnValue("en");

        renderHook(() => useChangeLanguage());

        expect(mockReplace).not.toHaveBeenCalled();
    });

    it("should update router when handleChange is called with different locale", () => {
        (useLocale as jest.Mock).mockReturnValue("en");

        const { result } = renderHook(() => useChangeLanguage());

        act(() => {
            result.current.handleChange("vi");
        });

        expect(mockReplace).toHaveBeenCalledWith("/test-path", { locale: "vi" });
    });

    it("should not update router when handleChange is called with same locale", () => {
        (useLocale as jest.Mock).mockReturnValue("en");

        const { result } = renderHook(() => useChangeLanguage());

        act(() => {
            result.current.handleChange("en");
        });

        expect(mockReplace).not.toHaveBeenCalled();
    });

    it("should return correct languageTitle for English", () => {
        (useLocale as jest.Mock).mockReturnValue("en");

        const { result } = renderHook(() => useChangeLanguage());

        expect(result.current.languageTitle).toBe("English");
    });

    it("should return correct languageTitle for Vietnamese", () => {
        (useLocale as jest.Mock).mockReturnValue("vi");

        const { result } = renderHook(() => useChangeLanguage());

        expect(result.current.languageTitle).toBe("Tiếng Việt");
    });

    it("should return correct languageTitle for Khmer", () => {
        (useLocale as jest.Mock).mockReturnValue("km");

        const { result } = renderHook(() => useChangeLanguage());

        expect(result.current.languageTitle).toBe("ភាសាខ្មែរ");
    });

    it("should return default English for unknown locale", () => {
        (useLocale as jest.Mock).mockReturnValue("unknown" as any);

        const { result } = renderHook(() => useChangeLanguage());

        expect(result.current.languageTitle).toBe("English");
    });

    it("should derive languageTitle from URL locale, not from state", () => {
        (useLocale as jest.Mock).mockReturnValue("vi");

        const { result } = renderHook(() => useChangeLanguage());

        // languageTitle should be Vietnamese because locale is "vi"
        expect(result.current.languageTitle).toBe("Tiếng Việt");
    });
});
