import { jest } from '@jest/globals';

// Add any global test setup here
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock Next.js specific features
jest.mock('next/server', () => ({
  NextResponse: {
    json: (data, init) => {
      const response = new Response(JSON.stringify(data), {
        status: init?.status || 200,
        headers: {
          'content-type': 'application/json',
          ...(init?.headers || {})
        }
      });
      return response;
    }
  }
}));

// Mock console methods to reduce test noise
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

beforeAll(() => {
  console.error = jest.fn();
  console.warn = jest.fn();
});

afterAll(() => {
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
});

// Global test utilities
global.createMockRequest = (body = {}) => ({
  json: jest.fn().mockResolvedValue(body),
  headers: new Map(),
  url: 'http://localhost:3000/api/test'
});

global.createMockParams = (id) => ({
  params: { id }
});

global.createMockResponse = () => {
  const response = {
    status: 200,
    headers: new Map(),
    json: jest.fn().mockReturnValue({}),
    text: jest.fn().mockReturnValue(''),
  };
  return response;
}; 