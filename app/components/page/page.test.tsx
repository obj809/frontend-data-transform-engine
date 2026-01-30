import { render, screen, waitFor } from "@testing-library/react";
import Home from "./page";
import { apiGet } from "@/lib/api";

// Mock the API module
jest.mock("@/lib/api", () => ({
  apiGet: jest.fn(),
}));

const mockedApiGet = apiGet as jest.MockedFunction<typeof apiGet>;

describe("Home Page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Initial Loading State", () => {
    it("should display loading message when component mounts", () => {
      // Arrange: Mock apiGet to return a pending promise
      mockedApiGet.mockImplementation(() => new Promise(() => {}));

      // Act: Render the component
      render(<Home />);

      // Assert: Loading state should be visible
      expect(screen.getByText("Connecting to backend...")).toBeInTheDocument();
    });
  });

  describe("Connected State", () => {
    it("should display connected status and backend message when API call succeeds", async () => {
      // Arrange: Mock successful API response
      const mockResponse = { message: "Hello from the backend!" };
      mockedApiGet.mockResolvedValue(mockResponse);

      // Act: Render the component
      render(<Home />);

      // Assert: Wait for the connected state to appear
      await waitFor(() => {
        expect(screen.getByText("Connected")).toBeInTheDocument();
      });

      expect(
        screen.getByText("Backend says: Hello from the backend!")
      ).toBeInTheDocument();
      expect(
        screen.queryByText("Connecting to backend...")
      ).not.toBeInTheDocument();
    });

    it("should display green indicator when connected", async () => {
      // Arrange: Mock successful API response
      mockedApiGet.mockResolvedValue({ message: "Test message" });

      // Act: Render the component
      render(<Home />);

      // Assert: Wait for connected state and check for green indicator
      await waitFor(() => {
        const greenIndicator = document.querySelector(".bg-green-500");
        expect(greenIndicator).toBeInTheDocument();
      });
    });

    it("should call apiGet with correct path on mount", async () => {
      // Arrange: Mock successful API response
      mockedApiGet.mockResolvedValue({ message: "Test" });

      // Act: Render the component
      render(<Home />);

      // Assert: Verify apiGet was called with correct parameters
      await waitFor(() => {
        expect(mockedApiGet).toHaveBeenCalledTimes(1);
        expect(mockedApiGet).toHaveBeenCalledWith("/");
      });
    });
  });

  describe("Error State", () => {
    it("should display error message when API call fails", async () => {
      // Arrange: Mock failed API response
      mockedApiGet.mockRejectedValue(new Error("Network error"));

      // Act: Render the component
      render(<Home />);

      // Assert: Wait for error state to appear
      await waitFor(() => {
        expect(screen.getByText("Connection failed")).toBeInTheDocument();
      });

      expect(
        screen.getByText("Make sure the backend is running at localhost:8000")
      ).toBeInTheDocument();
      expect(
        screen.queryByText("Connecting to backend...")
      ).not.toBeInTheDocument();
    });

    it("should display red indicator when connection fails", async () => {
      // Arrange: Mock failed API response
      mockedApiGet.mockRejectedValue(new Error("Network error"));

      // Act: Render the component
      render(<Home />);

      // Assert: Wait for error state and check for red indicator
      await waitFor(() => {
        const redIndicator = document.querySelector(".bg-red-500");
        expect(redIndicator).toBeInTheDocument();
      });
    });
  });

  describe("Page Structure", () => {
    it("should render the page title", () => {
      // Arrange: Mock pending promise to keep loading state
      mockedApiGet.mockImplementation(() => new Promise(() => {}));

      // Act: Render the component
      render(<Home />);

      // Assert: Title should always be present
      expect(screen.getByText("Data Transform Engine")).toBeInTheDocument();
    });

    it("should have proper layout structure", () => {
      // Arrange: Mock pending promise
      mockedApiGet.mockImplementation(() => new Promise(() => {}));

      // Act: Render the component
      const { container } = render(<Home />);

      // Assert: Check for main container structure
      const mainElement = container.querySelector("main");
      expect(mainElement).toBeInTheDocument();
      expect(mainElement).toHaveClass("flex", "min-h-screen");
    });
  });
});
