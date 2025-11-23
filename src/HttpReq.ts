import { IHttpClient } from './IHttpClient';
import { SuperagentAdapter } from './SuperagentAdapter';

/**
 * HTTP response object structure returned by all HTTP methods
 */
export interface HttpResponse<T = unknown> {
  /** HTTP status code (200, 404, 500, etc.) */
  status: number;
  /** Response body data (JSON, string, etc.) */
  body: T;
  /** Request metadata */
  request: {
    /** HTTP method used */
    method: string;
    /** Full URL that was requested */
    url: string;
    /** Request headers */
    header?: Record<string, string>;
    /** Request body data */
    _data?: unknown;
  };
}

/**
 * Configuration options for HTTP requests
 */
export interface HttpRequestConfig {
  /** Request body data (for POST, PUT, PATCH) */
  body?: object;
  /** HTTP headers to include in request */
  headers?: Record<string, string>;
  /** Query parameters as an object (will be appended to URL) */
  query?: object;
  /** Request timeout in milliseconds */
  timeout?: number;
}

/**
 * Enum representing available HTTP client types
 */
/* eslint-disable no-unused-vars */
export enum HttpClientType {
  AXIOS = 'axios',
  SUPERAGENT = 'superagent',
}
/* eslint-enable no-unused-vars */

/**
 * Options for configuring the HttpReq instance
 */
export interface HttpReqOptions {
  /** Optional custom logger function */
  // eslint-disable-next-line no-unused-vars
  logger?: (message: string) => void;
  /** HTTP client type to use (default: AXIOS) */
  clientType?: HttpClientType;
}

/**
 * HttpReq - A unified HTTP client that supports multiple underlying implementations.
 * 
 * This class provides a consistent interface for making HTTP requests while allowing
 * users to choose their preferred HTTP client library (axios or superagent).
 * 
 * Features:
 * - Support for GET, POST, PUT, PATCH, DELETE methods
 * - Automatic retries for network errors
 * - Query parameter support
 * - Custom headers
 * - Request/response logging
 * - Pluggable HTTP client adapters
 * 
 * @example
 * ```typescript
 * // Using axios (default)
 * const client = new HttpReq();
 * const response = await client.GET('https://api.example.com/users');
 * 
 * // Using superagent
 * const client = new HttpReq({ clientType: HttpClientType.SUPERAGENT });
 * const response = await client.POST('https://api.example.com/users', { 
 *   body: { name: 'John' } 
 * });
 * ```
 */
export class HttpReq {
  // eslint-disable-next-line no-unused-vars
  private logger: (message: string) => void;
  private clientType: HttpClientType;
  private httpClient: IHttpClient;

  /**
   * Creates a new HttpReq instance
   * @param options - Configuration options
   */
  constructor(options: HttpReqOptions = {}) {
    // eslint-disable-next-line no-console
    this.logger = options.logger ?? console.log;
    this.clientType = options.clientType ?? HttpClientType.AXIOS;

    // Create the appropriate HTTP client adapter
    if (this.clientType === HttpClientType.AXIOS) {
      // Dynamically load AxiosAdapter only when needed
      // This allows users to copy only the adapter they want
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const { AxiosAdapter } = require('./AxiosAdapter');
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
      this.httpClient = new AxiosAdapter(this.logger);
    } else {
      this.httpClient = new SuperagentAdapter(this.logger);
    }
  }

  /**
   * Gets the currently configured HTTP client type.
   * @returns The HTTP client type being used
   */
  getClientType(): HttpClientType {
    return this.clientType;
  }

  /**
   * Performs an HTTP GET request
   * 
   * @param url - The URL to request
   * @param data - Optional request configuration (headers, query params, etc.)
   * @returns Promise that resolves to the response object
   * 
   * @example
   * ```typescript
   * const response = await httpReq.GET('https://api.example.com/users', {
   *   headers: { 'Authorization': 'Bearer token' },
   *   query: { page: 1, limit: 10 }
   * });
   * ```
   */
  async GET<T = unknown>(url: string, data?: Partial<HttpRequestConfig>): Promise<HttpResponse<T>> {
    return this.httpClient.GET<T>(url, data);
  }

  /**
   * Performs an HTTP POST request
   * 
   * @param url - The URL to request
   * @param data - Optional request configuration (body, headers, query params, etc.)
   * @returns Promise that resolves to the response object
   * 
   * @example
   * ```typescript
   * const response = await httpReq.POST('https://api.example.com/users', {
   *   body: { name: 'John Doe', email: 'john@example.com' },
   *   headers: { 'Content-Type': 'application/json' }
   * });
   * ```
   */
  async POST<T = unknown>(url: string, data?: HttpRequestConfig): Promise<HttpResponse<T>> {
    return this.httpClient.POST<T>(url, data);
  }

  /**
   * Performs an HTTP DELETE request
   * 
   * @param url - The URL to request
   * @param data - Optional request configuration (headers, query params, etc.)
   * @returns Promise that resolves to the response object
   * 
   * @example
   * ```typescript
   * const response = await httpReq.DELETE('https://api.example.com/users/123', {
   *   headers: { 'Authorization': 'Bearer token' }
   * });
   * ```
   */
  async DELETE<T = unknown>(url: string, data?: HttpRequestConfig): Promise<HttpResponse<T>> {
    return this.httpClient.DELETE<T>(url, data);
  }

  /**
   * Performs an HTTP PUT request
   * 
   * @param url - The URL to request
   * @param data - Optional request configuration (body, headers, query params, etc.)
   * @returns Promise that resolves to the response object
   * 
   * @example
   * ```typescript
   * const response = await httpReq.PUT('https://api.example.com/users/123', {
   *   body: { name: 'Jane Doe', email: 'jane@example.com' },
   *   headers: { 'Content-Type': 'application/json' }
   * });
   * ```
   */
  async PUT<T = unknown>(url: string, data?: HttpRequestConfig): Promise<HttpResponse<T>> {
    return this.httpClient.PUT<T>(url, data);
  }

  /**
   * Performs an HTTP PATCH request
   * 
   * @param url - The URL to request
   * @param data - Optional request configuration (body, headers, query params, etc.)
   * @returns Promise that resolves to the response object
   * 
   * @example
   * ```typescript
   * const response = await httpReq.PATCH('https://api.example.com/users/123', {
   *   body: { email: 'newemail@example.com' },
   *   headers: { 'Content-Type': 'application/json' }
   * });
   * ```
   */
  async PATCH<T = unknown>(url: string, data?: HttpRequestConfig): Promise<HttpResponse<T>> {
    return this.httpClient.PATCH<T>(url, data);
  }

  /**
   * Checks if an error code is valid for retry
   * @param error - The error code or error object
   * @returns True if the error should trigger a retry
   */
  isValidRetryErr(error: string | Error): boolean {
    return this.httpClient.isValidRetryErr(error);
  }
}
