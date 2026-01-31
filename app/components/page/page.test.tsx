import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import Home from "./page";
import { apiGet, uploadFile } from "@/lib/api";

// Mock the API module
jest.mock("@/lib/api", () => ({
  apiGet: jest.fn(),
  uploadFile: jest.fn(),
}));

const mockedApiGet = apiGet as jest.MockedFunction<typeof apiGet>;
const mockedUploadFile = uploadFile as jest.MockedFunction<typeof uploadFile>;

function createMockFile(name: string): File {
  return new File(["{}"], name, { type: "application/json" });
}

function createDragEvent(
  files: File[]
): Partial<React.DragEvent<HTMLDivElement>> {
  return {
    preventDefault: jest.fn(),
    stopPropagation: jest.fn(),
    dataTransfer: {
      files: files as unknown as FileList,
    } as DataTransfer,
  };
}

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
    it("should display connected status when API call succeeds", async () => {
      // Arrange: Mock successful API response
      mockedApiGet.mockResolvedValue({ message: "Hello from the backend!" });

      // Act: Render the component
      render(<Home />);

      // Assert: Wait for the connected state to appear
      await waitFor(() => {
        expect(screen.getByText("Connected to API")).toBeInTheDocument();
      });

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

  describe("Keyboard Submission", () => {
    it("should trigger upload when Enter is pressed with file selected", async () => {
      mockedApiGet.mockResolvedValue({ message: "Connected" });
      mockedUploadFile.mockResolvedValue({
        symbol: "^AXJO",
        name: "S&P/ASX 200",
        price: 8949.48,
        change: -1.7882,
        change_percent: -0.019918,
        day_high: 8972.83,
        day_low: 8927.76,
        previous_close: 8951.27,
        timestamp: "(current UTC time)",
      });

      render(<Home />);

      await waitFor(() => {
        expect(screen.getByText("Connected to API")).toBeInTheDocument();
      });

      const dropZone = screen.getByTestId("file-drop-zone");
      const jsonFile = createMockFile("test.json");

      fireEvent.drop(dropZone, createDragEvent([jsonFile]));

      expect(screen.getByTestId("submit-button")).toHaveAttribute(
        "data-state",
        "ready"
      );

      fireEvent.keyDown(document, { key: "Enter" });

      await waitFor(() => {
        expect(mockedUploadFile).toHaveBeenCalledWith("/upload", jsonFile);
      });
    });

    it("should not trigger upload when Enter is pressed without file", async () => {
      mockedApiGet.mockResolvedValue({ message: "Connected" });

      render(<Home />);

      await waitFor(() => {
        expect(screen.getByText("Connected to API")).toBeInTheDocument();
      });

      fireEvent.keyDown(document, { key: "Enter" });

      expect(mockedUploadFile).not.toHaveBeenCalled();
    });

    it("should not trigger upload when Enter is pressed during upload", async () => {
      mockedApiGet.mockResolvedValue({ message: "Connected" });
      mockedUploadFile.mockImplementation(() => new Promise(() => {}));

      render(<Home />);

      await waitFor(() => {
        expect(screen.getByText("Connected to API")).toBeInTheDocument();
      });

      const dropZone = screen.getByTestId("file-drop-zone");
      const jsonFile = createMockFile("test.json");

      fireEvent.drop(dropZone, createDragEvent([jsonFile]));
      fireEvent.click(screen.getByTestId("submit-button"));

      await waitFor(() => {
        expect(screen.getByTestId("submit-button")).toHaveAttribute(
          "data-state",
          "uploading"
        );
      });

      fireEvent.keyDown(document, { key: "Enter" });

      expect(mockedUploadFile).toHaveBeenCalledTimes(1);
    });
  });
});
