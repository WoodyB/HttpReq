/* eslint-disable no-unused-vars */
import { HttpResponse, HttpRequestConfig } from './HttpReq';

/**
 * HTTP client interface that all adapters must implement.
 * This defines the contract for HTTP client adapters (Axios, Superagent, etc.)
 */
export interface IHttpClient {
  /**
   * Performs an HTTP GET request
   * @param url - The URL to request
   * @param data - Optional request configuration
   * @returns Promise that resolves to the response object
   */
  GET<T = unknown>(url: string, data?: Partial<HttpRequestConfig>): Promise<HttpResponse<T>>;

  /**
   * Performs an HTTP POST request
   * @param url - The URL to request
   * @param data - Optional request configuration
   * @returns Promise that resolves to the response object
   */
  POST<T = unknown>(url: string, data?: HttpRequestConfig): Promise<HttpResponse<T>>;

  /**
   * Performs an HTTP DELETE request
   * @param url - The URL to request
   * @param data - Optional request configuration
   * @returns Promise that resolves to the response object
   */
  DELETE<T = unknown>(url: string, data?: HttpRequestConfig): Promise<HttpResponse<T>>;

  /**
   * Performs an HTTP PUT request
   * @param url - The URL to request
   * @param data - Optional request configuration
   * @returns Promise that resolves to the response object
   */
  PUT<T = unknown>(url: string, data?: HttpRequestConfig): Promise<HttpResponse<T>>;

  /**
   * Performs an HTTP PATCH request
   * @param url - The URL to request
   * @param data - Optional request configuration
   * @returns Promise that resolves to the response object
   */
  PATCH<T = unknown>(url: string, data?: HttpRequestConfig): Promise<HttpResponse<T>>;

  /**
   * Checks if an error code is valid for retry
   * @param error - The error code or error object
   * @returns True if the error should trigger a retry
   */
  isValidRetryErr(error: string | Error): boolean;
}
