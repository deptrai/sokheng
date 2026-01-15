import { render, screen, fireEvent, within } from "@testing-library/react";
import Language from "../index";
import { LANGUAGES } from "@/app/data";

// Mock the Popover components
jest.mock("@/app/components/shared-ui/Popover", () => ({
    Popover: ({ children }: any) => <div>{children}</div>,
    PopoverTrigger: ({ children, asChild }: any) => <div data-testid="popover-trigger">{children}</div>,
    PopoverContent: ({ children }: any) => <div data-testid="popover-content">{children}</div>,
}));

// Mock icons
jest.mock("@/app/icons", () => ({
    EarthIcon: () => <svg data-testid="earth-icon" />,
    CheckIcon: () => <svg data-testid="check-icon" />,
}));

describe("Language Component", () => {
    const mockHandleChange = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should render current language title in button", () => {
        render(<Language languageTitle="English" handleChange={mockHandleChange} />);

        const trigger = screen.getByTestId("popover-trigger");
        expect(within(trigger).getByText("English")).toBeInTheDocument();
    });

    it("should render earth icon", () => {
        render(<Language languageTitle="English" handleChange={mockHandleChange} />);

        expect(screen.getByTestId("earth-icon")).toBeInTheDocument();
    });

    it("should call handleChange when selecting Vietnamese", () => {
        render(<Language languageTitle="English" handleChange={mockHandleChange} />);

        const content = screen.getByTestId("popover-content");
        const vietnameseOption = within(content).getByText("Tiếng Việt");
        fireEvent.click(vietnameseOption);

        expect(mockHandleChange).toHaveBeenCalledWith("vi");
    });

    it("should call handleChange when selecting Khmer", () => {
        render(<Language languageTitle="English" handleChange={mockHandleChange} />);

        const content = screen.getByTestId("popover-content");
        const khmerOption = within(content).getByText("ភាសាខ្មែរ");
        fireEvent.click(khmerOption);

        expect(mockHandleChange).toHaveBeenCalledWith("km");
    });

    it("should show checkmark for current language", () => {
        render(<Language languageTitle="English" handleChange={mockHandleChange} />);

        // Only one check icon should be visible (for English)
        const checkIcons = screen.getAllByTestId("check-icon");
        expect(checkIcons).toHaveLength(1);
    });

    it("should render all available languages in dropdown", () => {
        render(<Language languageTitle="English" handleChange={mockHandleChange} />);

        const content = screen.getByTestId("popover-content");
        LANGUAGES.forEach(({ title }) => {
            expect(within(content).getByText(title)).toBeInTheDocument();
        });
    });

    it("should show checkmark only for selected language", () => {
        const { rerender } = render(
            <Language languageTitle="English" handleChange={mockHandleChange} />
        );

        // English is selected, should have 1 checkmark
        expect(screen.getAllByTestId("check-icon")).toHaveLength(1);

        // Change to Vietnamese
        rerender(<Language languageTitle="Tiếng Việt" handleChange={mockHandleChange} />);

        // Still should have only 1 checkmark, but for Vietnamese now
        expect(screen.getAllByTestId("check-icon")).toHaveLength(1);
    });
});
