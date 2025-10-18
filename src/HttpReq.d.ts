/**
 * HTTP client type enumeration for selecting between axios and superagent implementations.
 */
declare enum HttpClientType {
  AXIOS = 'axios',
  SUPERAGENT = 'superagent'
}

/**
 * Configuration options for HttpReq constructor.
 */
interface HttpReqOptions {
  logger?: (message: string) => void;
  clientType?: HttpClientType;
}

/**
 * Unified HTTP client that supports both axios and superagent with lazy loading.
 */
declare class HttpReq {
  constructor(options?: HttpReqOptions);
  getClientType(): HttpClientType;
  isValidRetryErr(error: string | Error | object): boolean;
  GET<T = unknown>(url: string, data?: object): Promise<{ status: number; body: T }>;
  POST<T = unknown>(url: string, data?: { headers?: object; body?: any }): Promise<{ status: number; body: T }>;
  PUT<T = unknown>(url: string, data?: { headers?: object; body?: any }): Promise<{ status: number; body: T }>;
  PATCH<T = unknown>(url: string, data?: { headers?: object; body?: any }): Promise<{ status: number; body: T }>;
}

export = { HttpReq, HttpClientType };