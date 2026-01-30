// Learn more: https://github.com/testing-library/jest-dom
import "@testing-library/jest-dom";
import { TextEncoder, TextDecoder } from "util";
import "whatwg-fetch";

// Mock environment variables for testing
process.env.NEXT_PUBLIC_API_URL = "http://localhost:8000";

// Polyfill Web APIs for Next.js Edge Runtime
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder as typeof global.TextDecoder;
