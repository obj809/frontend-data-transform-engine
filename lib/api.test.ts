import { apiGet, apiPost, uploadFile, ApiError } from "./api";

// Mock fetch globally
global.fetch = jest.fn();

const mockedFetch = global.fetch as jest.MockedFunction<typeof fetch>;

describe("API Utilities", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Set environment variable for tests
    process.env.NEXT_PUBLIC_API_URL = "http://localhost:8000";
  });

  describe("ApiError", () => {
    it("should create ApiError with message and status", () => {
      // Act: Create an ApiError
      const error = new ApiError("Not found", 404);

      // Assert: Check error properties
      expect(error.message).toBe("Not found");
      expect(error.status).toBe(404);
      expect(error.name).toBe("ApiError");
      expect(error).toBeInstanceOf(Error);
    });
  });

  describe("apiGet", () => {
    it("should make GET request to correct URL", async () => {
      // Arrange: Mock successful response
      const mockData = { id: 1, name: "Test" };
      mockedFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      } as Response);

      // Act: Call apiGet
      const result = await apiGet<typeof mockData>("/test");

      // Assert: Verify fetch was called correctly
      expect(mockedFetch).toHaveBeenCalledTimes(1);
      expect(mockedFetch).toHaveBeenCalledWith("http://localhost:8000/test", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      expect(result).toEqual(mockData);
    });

    it("should return parsed JSON data on success", async () => {
      // Arrange: Mock successful response
      const mockData = { message: "Success", items: [1, 2, 3] };
      mockedFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      } as Response);

      // Act: Call apiGet
      const result = await apiGet("/data");

      // Assert: Check returned data
      expect(result).toEqual(mockData);
    });

    it("should throw ApiError when response is not ok", async () => {
      // Arrange: Mock failed response
      mockedFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        text: async () => "Not found",
      } as Response);

      // Act & Assert: Call apiGet and expect error
      await expect(apiGet("/missing")).rejects.toThrow(ApiError);
    });

    it("should handle response with error status code", async () => {
      // Arrange: Mock 500 error response
      mockedFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: async () => "Internal Server Error",
      } as Response);

      // Act & Assert: Verify error thrown with correct status
      try {
        await apiGet("/error");
        fail("Should have thrown an error");
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        expect((error as ApiError).status).toBe(500);
        expect((error as ApiError).message).toBe("Internal Server Error");
      }
    });

    it("should handle response text extraction failure", async () => {
      // Arrange: Mock response where text() fails
      mockedFetch.mockResolvedValueOnce({
        ok: false,
        status: 503,
        text: async () => {
          throw new Error("Failed to read response");
        },
      } as unknown as Response);

      // Act & Assert: Verify fallback error message
      try {
        await apiGet("/bad-response");
        fail("Should have thrown an error");
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        expect((error as ApiError).message).toBe("Request failed");
      }
    });
  });

  describe("apiPost", () => {
    it("should make POST request with JSON body", async () => {
      // Arrange: Mock successful response
      const requestData = { name: "Test", value: 123 };
      const responseData = { id: 1, ...requestData };
      mockedFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => responseData,
      } as Response);

      // Act: Call apiPost
      const result = await apiPost("/create", requestData);

      // Assert: Verify fetch was called with correct parameters
      expect(mockedFetch).toHaveBeenCalledTimes(1);
      expect(mockedFetch).toHaveBeenCalledWith("http://localhost:8000/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });
      expect(result).toEqual(responseData);
    });

    it("should handle complex nested data structures", async () => {
      // Arrange: Mock complex data
      const complexData = {
        user: { id: 1, name: "John" },
        items: [{ id: 1 }, { id: 2 }],
        metadata: { created: "2024-01-01" },
      };
      mockedFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      } as Response);

      // Act: Call apiPost
      await apiPost("/data", complexData);

      // Assert: Verify JSON stringification
      expect(mockedFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: JSON.stringify(complexData),
        })
      );
    });

    it("should throw ApiError on failed POST request", async () => {
      // Arrange: Mock failed response
      mockedFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        text: async () => "Bad Request",
      } as Response);

      // Act & Assert: Verify error handling
      await expect(apiPost("/create", { data: "test" })).rejects.toThrow(
        ApiError
      );
    });
  });

  describe("uploadFile", () => {
    it("should upload file using FormData", async () => {
      // Arrange: Create a mock file
      const file = new File(["test content"], "test.txt", {
        type: "text/plain",
      });
      const responseData = { fileId: "123", filename: "test.txt" };
      mockedFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => responseData,
      } as Response);

      // Act: Call uploadFile
      const result = await uploadFile("/upload", file);

      // Assert: Verify fetch was called with FormData
      expect(mockedFetch).toHaveBeenCalledTimes(1);
      const callArgs = mockedFetch.mock.calls[0];
      expect(callArgs[0]).toBe("http://localhost:8000/upload");
      expect(callArgs[1]?.method).toBe("POST");
      expect(callArgs[1]?.body).toBeInstanceOf(FormData);

      // Verify the FormData contains the file
      const formData = callArgs[1]?.body as FormData;
      expect(formData.get("file")).toBe(file);
      expect(result).toEqual(responseData);
    });

    it("should handle file upload errors", async () => {
      // Arrange: Mock failed upload
      const file = new File(["content"], "test.pdf", {
        type: "application/pdf",
      });
      mockedFetch.mockResolvedValueOnce({
        ok: false,
        status: 413,
        text: async () => "File too large",
      } as Response);

      // Act & Assert: Verify error handling
      try {
        await uploadFile("/upload", file);
        fail("Should have thrown an error");
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        expect((error as ApiError).status).toBe(413);
        expect((error as ApiError).message).toBe("File too large");
      }
    });

    it("should not include Content-Type header for file uploads", async () => {
      // Arrange: Create a mock file
      const file = new File(["test"], "test.jpg", { type: "image/jpeg" });
      mockedFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      } as Response);

      // Act: Call uploadFile
      await uploadFile("/upload", file);

      // Assert: Verify no Content-Type header (browser sets it automatically for FormData)
      const callArgs = mockedFetch.mock.calls[0];
      expect(callArgs[1]?.headers).toBeUndefined();
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty response body", async () => {
      // Arrange: Mock response with empty JSON
      mockedFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      } as Response);

      // Act: Call apiGet
      const result = await apiGet("/empty");

      // Assert: Should return empty object
      expect(result).toEqual({});
    });

    it("should handle null values in response", async () => {
      // Arrange: Mock response with null values
      const mockData = { value: null, optional: undefined };
      mockedFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      } as Response);

      // Act: Call apiGet
      const result = await apiGet("/nullable");

      // Assert: Should preserve null values
      expect(result).toEqual({ value: null });
    });

    it("should construct URLs correctly with leading slash", async () => {
      // Arrange: Mock successful response
      mockedFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      } as Response);

      // Act: Call apiGet with leading slash
      await apiGet("/path/to/resource");

      // Assert: Verify URL construction
      expect(mockedFetch).toHaveBeenCalledWith(
        "http://localhost:8000/path/to/resource",
        expect.any(Object)
      );
    });
  });
});
