import { GET } from "./route";
import { NextResponse } from "next/server";

// Mock fetch globally
global.fetch = jest.fn();

const mockedFetch = global.fetch as jest.MockedFunction<typeof fetch>;

describe("Health Check API Route", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Set environment variable for tests
    process.env.NEXT_PUBLIC_API_URL = "http://localhost:8000";
  });

  describe("GET /api/health", () => {
    it("should return success response when backend is reachable", async () => {
      // Arrange: Mock successful backend response
      const backendData = { message: "Backend is healthy" };
      mockedFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => backendData,
      } as Response);

      // Act: Call the GET handler
      const response = await GET();

      // Assert: Verify fetch was called correctly
      expect(mockedFetch).toHaveBeenCalledTimes(1);
      expect(mockedFetch).toHaveBeenCalledWith("http://localhost:8000/");

      // Assert: Verify response structure
      const responseData = await response.json();
      expect(responseData).toEqual({
        status: "success",
        message: "Backend data fetched successfully",
        backend_response: backendData,
      });
      expect(response.status).toBe(200);
    });

    it("should include backend response in success payload", async () => {
      // Arrange: Mock backend response with specific data
      const backendData = {
        message: "Hello from FastAPI",
        version: "1.0.0",
        timestamp: "2024-01-30T12:00:00Z",
      };
      mockedFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => backendData,
      } as Response);

      // Act: Call the GET handler
      const response = await GET();
      const responseData = await response.json();

      // Assert: Verify backend data is included
      expect(responseData.backend_response).toEqual(backendData);
      expect(responseData.backend_response.message).toBe("Hello from FastAPI");
      expect(responseData.backend_response.version).toBe("1.0.0");
    });

    it("should return error response when backend is unreachable", async () => {
      // Arrange: Mock network error
      mockedFetch.mockRejectedValueOnce(new Error("Network error"));

      // Act: Call the GET handler
      const response = await GET();

      // Assert: Verify error response
      const responseData = await response.json();
      expect(responseData).toEqual({
        status: "error",
        message: "Failed to fetch data from backend",
      });
      expect(response.status).toBe(503);
    });

    it("should return error response when backend returns non-JSON", async () => {
      // Arrange: Mock response that fails to parse JSON
      mockedFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => {
          throw new Error("Invalid JSON");
        },
      } as unknown as Response);

      // Act: Call the GET handler
      const response = await GET();

      // Assert: Verify error response
      const responseData = await response.json();
      expect(responseData.status).toBe("error");
      expect(responseData.message).toBe("Failed to fetch data from backend");
      expect(response.status).toBe(503);
    });

    it("should return error response when backend is down", async () => {
      // Arrange: Mock connection refused error
      mockedFetch.mockRejectedValueOnce(new Error("ECONNREFUSED"));

      // Act: Call the GET handler
      const response = await GET();

      // Assert: Verify service unavailable response
      expect(response.status).toBe(503);
      const responseData = await response.json();
      expect(responseData.status).toBe("error");
    });

    it("should return error response when backend returns 500", async () => {
      // Arrange: Mock server error from backend
      mockedFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ error: "Internal server error" }),
      } as Response);

      // Act: Call the GET handler
      const response = await GET();

      // Assert: Verify error handling
      const responseData = await response.json();
      expect(responseData.status).toBe("error");
      expect(response.status).toBe(503);
    });

    it("should handle timeout errors", async () => {
      // Arrange: Mock timeout error
      mockedFetch.mockRejectedValueOnce(new Error("Request timeout"));

      // Act: Call the GET handler
      const response = await GET();

      // Assert: Verify error response
      const responseData = await response.json();
      expect(responseData).toEqual({
        status: "error",
        message: "Failed to fetch data from backend",
      });
      expect(response.status).toBe(503);
    });
  });

  describe("Response Format", () => {
    it("should return NextResponse instance", async () => {
      // Arrange: Mock successful response
      mockedFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: "OK" }),
      } as Response);

      // Act: Call the GET handler
      const response = await GET();

      // Assert: Verify it's a NextResponse
      expect(response).toBeInstanceOf(NextResponse);
    });

    it("should have correct Content-Type header", async () => {
      // Arrange: Mock successful response
      mockedFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: "OK" }),
      } as Response);

      // Act: Call the GET handler
      const response = await GET();

      // Assert: Verify headers
      expect(response.headers.get("content-type")).toContain(
        "application/json"
      );
    });
  });

  describe("Environment Variables", () => {
    it("should use NEXT_PUBLIC_API_URL environment variable", async () => {
      // Arrange: Set custom API URL
      const originalUrl = process.env.NEXT_PUBLIC_API_URL;
      process.env.NEXT_PUBLIC_API_URL = "http://custom-backend:9000";

      mockedFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: "OK" }),
      } as Response);

      // Act: Call the GET handler
      await GET();

      // Assert: Verify custom URL was used
      expect(mockedFetch).toHaveBeenCalledWith("http://custom-backend:9000/");

      // Cleanup: Restore original URL
      process.env.NEXT_PUBLIC_API_URL = originalUrl;
    });

    it("should handle undefined API URL gracefully", async () => {
      // Arrange: Remove API URL
      const originalUrl = process.env.NEXT_PUBLIC_API_URL;
      delete process.env.NEXT_PUBLIC_API_URL;

      mockedFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: "OK" }),
      } as Response);

      // Act: Call the GET handler
      await GET();

      // Assert: Verify fetch was called (with undefined in URL)
      expect(mockedFetch).toHaveBeenCalledWith("undefined/");

      // Cleanup: Restore original URL
      process.env.NEXT_PUBLIC_API_URL = originalUrl;
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty backend response", async () => {
      // Arrange: Mock empty response
      mockedFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      } as Response);

      // Act: Call the GET handler
      const response = await GET();
      const responseData = await response.json();

      // Assert: Verify success with empty backend response
      expect(responseData.status).toBe("success");
      expect(responseData.backend_response).toEqual({});
    });

    it("should handle backend response with null values", async () => {
      // Arrange: Mock response with null
      const backendData = { message: null, data: null };
      mockedFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => backendData,
      } as Response);

      // Act: Call the GET handler
      const response = await GET();
      const responseData = await response.json();

      // Assert: Verify null values are preserved
      expect(responseData.backend_response).toEqual(backendData);
      expect(responseData.backend_response.message).toBeNull();
    });
  });
});
