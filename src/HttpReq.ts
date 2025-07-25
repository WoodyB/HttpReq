const HTTP_REQUEST = {
  TIMEOUT: 70000,
};

/**
 * HTTP client type enumeration for selecting between axios and superagent implementations.
 */
export enum HttpClientType {
  // eslint-disable-next-line no-unused-vars
  AXIOS = 'axios',
  // eslint-disable-next-line no-unused-vars
  SUPERAGENT = 'superagent'
}

/**
 * Configuration options for HttpReq constructor.
 */
export interface HttpReqOptions {
  /** Custom logger function. Defaults to console.log if not provided. */
  // eslint-disable-next-line no-unused-vars
  logger?: (_message: string) => void;
  /** HTTP client type to use. Defaults to AXIOS if not provided. */
  clientType?: HttpClientType;
}

/**
 * Unified HTTP client that supports both axios and superagent with lazy loading.
 * 
 * Features:
 * - Lazy loading: Only loads the HTTP client you actually use
 * - Unified interface: Both HTTP clients work identically
 * - Automatic retry: Retries network failures up to 3 times
 * - Security: Automatically obfuscates sensitive data in logs
 * - Timeout: 70-second request timeout protection
 * 
 * @remarks
 * ## Response Object Structure
 * All HTTP methods return a Promise that resolves to a response object with:
 * ```typescript
 * {
 *   status: number;         // HTTP status code (200, 404, 500, etc.)
 *   body: any;              // Response body data (JSON, string, etc.)
 *   request: {              // Request metadata
 *     method: string;       // HTTP method used
 *     url: string;          // Full URL that was requested
 *     header: any;          // Headers that were sent
 *     _data: any;           // Request body that was sent
 *   }
 * }
 * ```
 * 
 * @example
 * ```typescript
 * // Using defaults (axios)
 * const client = new HttpReq();
 * 
 * // Explicitly choosing HTTP client
 * const superagentClient = new HttpReq({ clientType: HttpClientType.SUPERAGENT });
 * 
 * // Custom logger
 * const customClient = new HttpReq({ 
 *   logger: (msg) => console.log(`[CUSTOM] ${msg}`) 
 * });
 * 
 * // Make requests and handle responses
 * const response = await client.GET('https://api.example.com/data');
 * console.log(`Status: ${response.status}`);       // Status: 200
 * console.log(`Data:`, response.body);             // Data: { ... }
 * console.log(`Method:`, response.request.method); // Method: GET
 * ```
 */
export class HttpReq {
  // eslint-disable-next-line no-unused-vars
  private logger: (message: string) => void;
  private clientType: HttpClientType;
  private httpClient: IHttpClient;

  /**
   * Creates a new HttpReq instance with the specified options.
   * 
   * @param options - Configuration options for the HTTP client
   * @param options.logger - Custom logger function (defaults to console.log)
   * @param options.clientType - HTTP client type to use (defaults to AXIOS)
   * 
   * @example
   * ```typescript
   * // Default configuration (axios with console.log)
   * const client = new HttpReq();
   * 
   * // Custom logger
   * const client = new HttpReq({ 
   *   logger: (msg) => myLogger.info(msg) 
   * });
   * 
   * // Specific HTTP client
   * const client = new HttpReq({ 
   *   clientType: HttpClientType.SUPERAGENT 
   * });
   * ```
   */
  constructor(options: HttpReqOptions = {}) {
    this.logger = options.logger ?? console.log;
    this.clientType = options.clientType ?? HttpClientType.AXIOS;
    
    if (this.clientType === HttpClientType.AXIOS) {
      this.httpClient = new AxiosHttpClient(this.logger);
    } else {
      this.httpClient = new SuperagentHttpClient(this.logger);
    }
  }

  /**
   * Gets the currently configured HTTP client type.
   * 
   * @returns The HTTP client type ('axios' or 'superagent')
   * 
   * @example
   * ```typescript
   * const client = new HttpReq({ clientType: HttpClientType.AXIOS });
   * console.log(client.getClientType()); // 'axios'
   * ```
   */
  public getClientType(): string {
    return this.clientType;
  }

  /**
   * Performs an HTTP GET request.
   * 
   * @param url - The URL to request (can include query parameters)
   * @param data - Optional request configuration
   * @param data.headers - Custom headers to include in the request
   * @returns Promise that resolves to the response object
   * 
   * @remarks
   * The response object contains:
   * - `status`: HTTP status code (200, 404, 500, etc.)
   * - `body`: Response body data (parsed JSON object, string, etc.)
   * - `request`: Request metadata object with method, url, headers, and body data
   * 
   * @example
   * ```typescript
   * // Simple GET request
   * const response = await client.GET('https://api.example.com/users');
   * console.log(response.status);  // 200
   * console.log(response.body);    // { users: [...] }
   * 
   * // GET with custom headers
   * const response = await client.GET('https://api.example.com/users', {
   *   headers: { 'Authorization': 'Bearer token123' }
   * });
   * 
   * // GET with query parameters in URL
   * const response = await client.GET('https://api.example.com/users?limit=10&offset=0');
   * ```
   */
  public GET(url: string, data?: { headers?: object, query?: object }) {
    return this.httpClient.GET(url, data);
  }

  /**
   * Performs an HTTP POST request.
   * 
   * @param url - The URL to request
   * @param data - Optional request configuration
   * @param data.headers - Custom headers to include in the request
   * @param data.body - Request body data to send
   * @returns Promise that resolves to the response object
   * 
   * @remarks
   * The response object contains:
   * - `status`: HTTP status code (200, 201, 400, 500, etc.)
   * - `body`: Response body data (parsed JSON object, string, etc.)
   * - `request`: Request metadata object with method, url, headers, and body data
   * 
   * @example
   * ```typescript
   * // POST with JSON data
   * const response = await client.POST('https://api.example.com/users', {
   *   headers: { 'Content-Type': 'application/json' },
   *   body: { name: 'John Doe', email: 'john@example.com' }
   * });
   * console.log(response.status);  // 201
   * console.log(response.body);    // { id: 123, name: 'John Doe', email: 'john@example.com' }
   * 
   * // POST with form data
   * const response = await client.POST('https://api.example.com/upload', {
   *   headers: { 'Content-Type': 'multipart/form-data' },
   *   body: formData
   * });
   * ```
   */
  public POST(url: string, data?: { headers?: object, body?: object, query?: object }) {
    return this.httpClient.POST(url, data);
  }

  /**
   * Performs an HTTP DELETE request.
   * 
   * @param url - The URL to request
   * @param data - Optional request configuration
   * @param data.headers - Custom headers to include in the request
   * @param data.body - Optional request body data
   * @returns Promise that resolves to the response object
   * 
   * @remarks
   * The response object contains:
   * - `status`: HTTP status code (200, 204, 404, 500, etc.)
   * - `body`: Response body data (often empty for DELETE requests)
   * - `request`: Request metadata object with method, url, headers, and body data
   * 
   * @example
   * ```typescript
   * // Simple DELETE request
   * const response = await client.DELETE('https://api.example.com/users/123');
   * console.log(response.status);  // 204 (No Content)
   * console.log(response.body);    // {} (empty for successful deletion)
   * 
   * // DELETE with authorization header
   * const response = await client.DELETE('https://api.example.com/users/123', {
   *   headers: { 'Authorization': 'Bearer token123' }
   * });
   * ```
   */
  public DELETE(url: string, data?: { headers?: object, body?: object, query?: object }) {
    return this.httpClient.DELETE(url, data);
  }

  /**
   * Performs an HTTP PUT request.
   * 
   * @param url - The URL to request
   * @param data - Optional request configuration
   * @param data.headers - Custom headers to include in the request
   * @param data.body - Request body data to send
   * @returns Promise that resolves to the response object
   * 
   * @remarks
   * The response object contains:
   * - `status`: HTTP status code (200, 201, 400, 500, etc.)
   * - `body`: Response body data (updated resource data or confirmation)
   * - `request`: Request metadata object with method, url, headers, and body data
   * 
   * @example
   * ```typescript
   * // PUT request to update a resource
   * const response = await client.PUT('https://api.example.com/users/123', {
   *   headers: { 'Content-Type': 'application/json' },
   *   body: { name: 'Jane Doe', email: 'jane@example.com' }
   * });
   * console.log(response.status);  // 200
   * console.log(response.body);    // { id: 123, name: 'Jane Doe', email: 'jane@example.com' }
   * ```
   */
  public PUT(url: string, data?: { headers?: object, body?: object, query?: object }) {
    return this.httpClient.PUT(url, data);
  }

  /**
   * Performs an HTTP PATCH request.
   * 
   * @param url - The URL to request
   * @param data - Optional request configuration
   * @param data.headers - Custom headers to include in the request
   * @param data.body - Request body data with partial updates
   * @returns Promise that resolves to the response object
   * 
   * @remarks
   * The response object contains:
   * - `status`: HTTP status code (200, 204, 400, 500, etc.)
   * - `body`: Response body data (updated resource data or confirmation)
   * - `request`: Request metadata object with method, url, headers, and body data
   * 
   * @example
   * ```typescript
   * // PATCH request to partially update a resource
   * const response = await client.PATCH('https://api.example.com/users/123', {
   *   headers: { 'Content-Type': 'application/json' },
   *   body: { email: 'newemail@example.com' }  // Only update email
   * });
   * console.log(response.status);  // 200
   * console.log(response.body);    // { id: 123, name: 'John Doe', email: 'newemail@example.com' }
   * ```
   */
  public PATCH(url: string, data?: { headers?: object, body?: object, query?: object }) {
    return this.httpClient.PATCH(url, data);
  }

  /**
   * Checks if an error is retryable based on error codes.
   * 
   * This method determines whether a network error should trigger an automatic retry.
   * Only certain network-level errors are considered retryable (ECONNREFUSED, ECONNRESET, etc.).
   * HTTP status errors (4xx, 5xx) are NOT retried.
   * 
   * @param error - The error to check (can be string, error object, or any type)
   * @returns True if the error should trigger a retry, false otherwise
   * 
   * @example
   * ```typescript
   * const client = new HttpReq();
   * 
   * // These would return true (retryable network errors):
   * client.isValidRetryErr('ECONNREFUSED');     // Connection refused
   * client.isValidRetryErr('ETIMEDOUT');       // Timeout
   * client.isValidRetryErr({ code: 'ECONNRESET' }); // Connection reset
   * 
   * // These would return false (not retryable):
   * client.isValidRetryErr('404');             // HTTP status error
   * client.isValidRetryErr('ENOTFOUND');       // DNS lookup failed
   * ```
   */
  public isValidRetryErr(error: any): boolean {
    return this.httpClient.isValidRetryErr(error);
  }
}

/**
 * Internal interface that ensures both HTTP client implementations have identical methods.
 * This interface guarantees that axios and superagent implementations work exactly the same way.
 * 
 * @internal
 */
interface IHttpClient {
  // eslint-disable-next-line no-unused-vars
  GET(_url: string, _data?: { headers?: object, query?: object }): Promise<any>;
  // eslint-disable-next-line no-unused-vars
  POST(_url: string, _data?: { headers?: object, body?: object, query?: object }): Promise<any>;
  // eslint-disable-next-line no-unused-vars
  PUT(_url: string, _data?: { headers?: object, body?: object, query?: object }): Promise<any>;
  // eslint-disable-next-line no-unused-vars
  PATCH(_url: string, _data?: { headers?: object, body?: object, query?: object }): Promise<any>;
  // eslint-disable-next-line no-unused-vars
  DELETE(_url: string, _data?: { headers?: object, body?: object, query?: object }): Promise<any>;
  // eslint-disable-next-line no-unused-vars
  isValidRetryErr(_error: any): boolean;
}

// Superagent HTTP client implementation
class SuperagentHttpClient implements IHttpClient {
  // eslint-disable-next-line no-unused-vars
  private logger: (_message: string) => void;
  private _request: any = null;

  // eslint-disable-next-line no-unused-vars
  constructor(logger: (_message: string) => void) {
    this.logger = logger;
  }

  // Lazy load superagent - only try to load it when first needed
  // This allows users to only install the HTTP client they actually want
  private getRequest() {
    if (!this._request) {
      try {
        this._request = require('superagent');
      } catch (error: any) {
        throw new Error(
          `superagent is required but not found. Please install it with: npm install superagent\n` +
          `Original error: ${error.message}`
        );
      }
    }
    return this._request;
  }

  public GET(url: string, data?: { headers?: object, query?: object }) {
    const request = this.getRequest();
    return this.send(request.get, url, data);
  }

  public POST(url: string, data?: { headers?: object, body?: object, query?: object }) {
    const request = this.getRequest();
    return this.send(request.post, url, data);
  }

  public DELETE(url: string, data?: { headers?: object, body?: object, query?: object }) {
    const request = this.getRequest();
    return this.send(request.delete, url, data);
  }

  public PUT(url: string, data?: { headers?: object, body?: object, query?: object }) {
    const request = this.getRequest();
    return this.send(request.put, url, data);
  }

  public PATCH(url: string, data?: { headers?: object, body?: object, query?: object }) {
    const request = this.getRequest();
    return this.send(request.patch, url, data);
  }

  public isValidRetryErr(err: string | any): boolean {
    const validRetryErrs = [
      'ECONNREFUSED',
      'ECONNRESET',
      'ETIMEDOUT',
      'EADDRINFO',
      'ESOCKETTIMEDOUT',
    ];
    
    // Handle both string error codes and error objects
    const errorCode = typeof err === 'string' ? err : (err?.code ?? err?.message);
    return validRetryErrs.includes(errorCode);
  }

  private async send(method: any, url: string, data: any): Promise<any> {
    let headers: object = {};
    let body: object;
    let finalHeaders: any = {};

    if (data) {
      headers = data.headers;
      finalHeaders = headers || {}; // Ensure finalHeaders is always an object
      body = data.body;
    }

    // Use the utility functions for query parameter processing
    const { baseUrl, mergedQuery } = mergeQueryParameters(url, data?.query);
    const processedQuery = processQueryObject(mergedQuery);

    const request = this.getRequest();
    if (method === request.get) {
      finalHeaders = { Accept: 'application/json', ...headers };
    }

    const startDate = new Date();

    for (let attempt = 0; attempt <= 3; attempt++) {
      try {
        const response = await new Promise((resolve, reject) => {
          method(baseUrl)
            .timeout(HTTP_REQUEST.TIMEOUT)
            .set(finalHeaders)
            .send(body)
            .query(processedQuery)
            .ok((res: any) => res.status < 600)
            .end((error: any, res: any) => {
              if (error) {
                reject(error);
                return;
              }
              resolve(res);
            });
        });

        // Success - log and return
        const formattedRsp = logRequest(formatRsp(response), startDate);
        this.logger(formattedRsp);
        return response;

      } catch (error: any) {
        if (attempt < 3 && this.isValidRetryErr(error.code ?? error.message)) {
          continue;
        }
        throw error; // No more retries or not a retryable error
      }
    }
  }
}

// Axios HTTP client implementation
class AxiosHttpClient implements IHttpClient {
  // eslint-disable-next-line no-unused-vars
  private logger: (_message: string) => void;
  private axiosInstance: any;
  private _axios: any = null;

  // eslint-disable-next-line no-unused-vars
  constructor(logger: (_message: string) => void) {
    this.logger = logger;
  }

  // Lazy load axios - only try to load it when first needed
  // This allows users to only install the HTTP client they actually want
  private getAxios() {
    if (!this._axios) {
      try {
        this._axios = require('axios');
        this.axiosInstance = this._axios.create({
          timeout: HTTP_REQUEST.TIMEOUT,
        });
      } catch (error: any) {
        throw new Error(
          `axios is required but not found. Please install it with: npm install axios\n` +
          `Original error: ${error.message}`
        );
      }
    }
    return this._axios;
  }

  public GET(url: string, data?: { headers?: object, query?: object }) {
    this.getAxios();
    return this.send('GET', url, data);
  }

  public POST(url: string, data?: { headers?: object, body?: object, query?: object }) {
    this.getAxios();
    return this.send('POST', url, data);
  }

  public DELETE(url: string, data?: { headers?: object, body?: object, query?: object }) {
    this.getAxios();
    return this.send('DELETE', url, data);
  }

  public PUT(url: string, data?: { headers?: object, body?: object, query?: object }) {
    this.getAxios();
    return this.send('PUT', url, data);
  }

  public PATCH(url: string, data?: { headers?: object, body?: object, query?: object }) {
    this.getAxios();
    return this.send('PATCH', url, data);
  }

  public isValidRetryErr(error: any): boolean {
    const validRetryErrs = [
      'ECONNREFUSED',
      'ECONNRESET',
      'ETIMEDOUT',
      'EADDRINFO',
      'ESOCKETTIMEDOUT',
    ];
    
    // Handle both string error codes and error objects
    const errorCode = typeof error === 'string' ? error : (error?.code ?? error?.message);
    return validRetryErrs.includes(errorCode);
  }

  private async send(method: string, url: string, data: any): Promise<any> {
    let headers: object = {};
    let body: object | undefined;
    let finalHeaders: any = {};

    if (data) {
      headers = data.headers;
      finalHeaders = headers || {}; // Ensure finalHeaders is always an object
      body = data.body;
    }

    // Use the utility functions for query parameter processing
    const { baseUrl, mergedQuery } = mergeQueryParameters(url, data?.query);
    const processedQuery = processQueryObject(mergedQuery);

    if (method === 'GET') {
      finalHeaders = { Accept: 'application/json', ...headers };
    }

    const startDate = new Date();
    
    let response: any;
    
    // Configure axios request
    const config = {
      method: method.toLowerCase(),
      url: baseUrl,
      headers: finalHeaders,
      data: body,
      params: processedQuery,
      validateStatus: (status: number) => status < 600, // Same as superagent .ok()
    };

    // Retry logic
    for (let attempt = 0; attempt <= 3; attempt++) {
      try {
        response = await this.axiosInstance.request(config);
        break;
      } catch (error: any) {
        if (attempt < 3 && this.isValidRetryErr(error)) {
          continue;
        }
        throw error; // No more retries or not a retryable error
      }
    }

    const formattedResponse = {
      status: response!.status,
      body: response!.data,
      request: {
        method: method,
        url: url,
        header: finalHeaders,
        _data: body
      }
    };

    // Log the request and response
    const formattedRsp = logRequest(formatRsp(formattedResponse), startDate);
    this.logger(formattedRsp);

    return formattedResponse;
  }
}

/**
 * Shared utility functions used by both HTTP client implementations.
 * These functions handle common tasks like data obfuscation, request logging, 
 * response formatting, and query parameter parsing.
 */

/**
 * Obfuscates sensitive data in request objects for logging purposes.
 * @param args - Object that may contain sensitive fields
 * @returns Object with sensitive fields replaced with placeholder text
 */
function obfuscate(args: any) {
  const fixedArgs: any = args;
  if (args.access_key) {
    fixedArgs.access_key = 'ACCESS KEY HIDDEN';
  }

  if (args.password) {
    fixedArgs.password = 'PASSWORD HIDDEN';
  }

  return fixedArgs;
}

/**
 * Formats a request/response log entry with timing information.
 * @param reqObj - Formatted request/response object
 * @param startDate - Request start timestamp
 * @returns Formatted log string with timing
 */
function logRequest(reqObj: any, startDate: any): string {
  const endDate: any = new Date();
  const msec: number = Math.abs(endDate - startDate);

  const output = [
    `::: ${startDate.toISOString()} :::`,
    `${reqObj.req}`,
    `${reqObj.rsp}`,
    `::: Response Time: ${msec}ms :::`,
  ].join('\n');
  return (`${output}\n`);
}

/**
 * Formats a response object for logging with header obfuscation.
 * @param res - Response object to format
 * @returns Object with formatted request and response strings
 */
function formatRsp(res: any) {
  let data: any;

  const output: any = {};
  const regexBracesQuotesCommas = /({\n)|(")|(,)|(\n})/g;
  const regexBasicAuthToken = /Authorization:\s*Basic.*/gi;
  const regexBearerAuthToken = /Authorization:\s*Bearer.*/gi;
  const regexVerificationToken = /verification-token:\s.*/gi;

  let headers: string = JSON.stringify(res.request.header ?? {}, null, 4);
  headers = headers.replace(regexBracesQuotesCommas, '');
  headers = headers.replace(
    regexBasicAuthToken,
    'Authorization: Basic TOKEN HIDDEN',
  );
  headers = headers.replace(
    regexBearerAuthToken,
    'Authorization: Bearer TOKEN HIDDEN',
  );
  headers = headers.replace(
    regexVerificationToken,
    'verification-token: TOKEN HIDDEN',
  );

  output.req = [
    `${res.request.method} ${res.request.url}\n`,
    headers,
  ].join('');

   
  if (res.request._data) {
    data = `${JSON.stringify(
       
      obfuscate(res.request._data),
      null,
      4,
    )}`;
    output.req = output.req.concat(`\n${data}`).replace(/\\n/g, '\n');
  }

  output.rsp = [
    `RESPONSE: ${res.status}`,
    `${JSON.stringify(res.body, null, 4)}`,
  ].join('\n');

  return output;
}

/**
 * Parses a query string into a key-value object.
 * @param str - Query string to parse
 * @param options - Optional parsing configuration
 * @returns Object with parsed key-value pairs
 */
function processKeyPairs(str: string, options?: { delimiter: string, assignmentOp: string }): any {
  const delimiter: string = options ? options.delimiter : '&';
  const assignmentOp: string = options ? options.assignmentOp : '=';
  const pairs: string[] = str.split(delimiter);
  const resultMap = new Map();

  pairs.forEach((pairStr: string) => {
    const pairAr: string[] = pairStr.split(assignmentOp);
    resultMap.set(pairAr[0], pairAr[1]);
  });

  return Object.fromEntries(resultMap);
}

/**
 * Merges URL query parameters with a query object, with query object taking precedence.
 * @param url - URL that may contain query parameters
 * @param queryObj - Query object to merge (optional)
 * @returns Object containing { baseUrl, mergedQuery }
 */
function mergeQueryParameters(url: string, queryObj?: object): { baseUrl: string, mergedQuery: any } {
  const [baseUrl, queryStr] = url.split('?');
  let urlQuery: any = {};

  // Parse existing URL query parameters
  if (queryStr) {
    urlQuery = processKeyPairs(queryStr);
  }

  // Merge with query object (query object overrides URL parameters)
  const mergedQuery = { ...urlQuery, ...queryObj };

  return { baseUrl, mergedQuery };
}

/**
 * Converts a query object to a properly formatted query object for HTTP clients.
 * Handles type conversion and filtering out null/undefined values.
 * @param queryObj - Query object to process
 * @returns Processed query object suitable for HTTP client libraries
 */
function processQueryObject(queryObj: any): any {
  if (!queryObj || typeof queryObj !== 'object') {
    return {};
  }

  const processedQuery: any = {};

  Object.keys(queryObj).forEach(key => {
    const value = queryObj[key];
    
    // Skip null, undefined, and empty string values
    if (value === null || value === undefined || value === '') {
      return;
    }
    
    // Handle arrays by joining with commas (skip empty arrays)
    if (Array.isArray(value)) {
      if (value.length === 0) {
        return;
      }
      processedQuery[key] = value.join(',');
      return;
    }

    // Convert to string for consistent behavior
    processedQuery[key] = String(value);
  });

  return processedQuery;
}
