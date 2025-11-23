import * as superagent from 'superagent';
import { IHttpClient } from './IHttpClient';
import { HttpResponse, HttpRequestConfig } from './HttpReq';

const HTTP_REQUEST = {
  TIMEOUT: 70000,
};

/**
 * Merges URL query parameters with a query object, with query object taking precedence.
 * @param url - URL that may contain query parameters
 * @param queryObj - Query object to merge (optional)
 * @returns Object containing { baseUrl, mergedQuery }
 */
function mergeQueryParameters(url: string, queryObj?: object): { baseUrl: string, mergedQuery: Record<string, unknown> } {
  const [baseUrl, queryStr] = url.split('?');
  let urlQuery: Record<string, string> = {};

  // Parse existing URL query parameters
  if (queryStr) {
    const pairs: string[] = queryStr.split('&');
    const resultMap = new Map<string, string>();

    pairs.forEach((pairStr: string) => {
      const pairAr: string[] = pairStr.split('=');
      resultMap.set(pairAr[0], pairAr[1]);
    });

    urlQuery = Object.fromEntries(resultMap);
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
function processQueryObject(queryObj: Record<string, unknown> | null | undefined): Record<string, string> {
  if (!queryObj || typeof queryObj !== 'object') {
    return {};
  }

  const processedQuery: Record<string, string> = {};

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

/**
 * Interface for objects that may contain sensitive data fields
 */
interface SensitiveDataObject {
  access_key?: string;
  password?: string;
  [key: string]: unknown;
}

/**
 * Obfuscates sensitive data in request objects for logging purposes.
 * @param args - Object that may contain sensitive fields
 * @returns Object with sensitive fields replaced with placeholder text
 */
function obfuscate<T extends SensitiveDataObject>(args: T): T {
  const fixedArgs: T = { ...args };
  if (args.access_key) {
    (fixedArgs as SensitiveDataObject).access_key = 'ACCESS KEY HIDDEN';
  }

  if (args.password) {
    (fixedArgs as SensitiveDataObject).password = 'PASSWORD HIDDEN';
  }

  return fixedArgs;
}

/**
 * Interface for formatted request/response log objects
 */
interface FormattedLogObject {
  req: string;
  rsp: string;
}

/**
 * Interface for response objects used in logging
 */
interface LoggableResponse {
  status: number;
  body: unknown;
  request: {
    method: string;
    url: string;
    header?: Record<string, unknown>;
    _data?: unknown;
  };
}

/**
 * Formats a response object for logging with header obfuscation.
 * @param res - Response object to format
 * @returns Object with formatted request and response strings
 */
function formatRsp(res: LoggableResponse): FormattedLogObject {
  let data: string;

  const output: FormattedLogObject = { req: '', rsp: '' };
  const regexBracesQuotesCommas = /({\n)|(")|(,)|(\n})/g;
  const regexAuthToken = /Authorization:\s*.*/gi;
  const regexVerificationToken = /verification-token:\s.*/gi;

  let headers: string = JSON.stringify(res.request.header ?? {}, null, 4);
  headers = headers.replace(regexBracesQuotesCommas, '');
  headers = headers.replace(
    regexAuthToken,
    'Authorization: TOKEN HIDDEN',
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
       
      obfuscate(res.request._data as SensitiveDataObject),
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
 * Formats a request/response log entry with timing information.
 * @param reqObj - Formatted request/response object
 * @param startDate - Request start timestamp
 * @returns Formatted log string with timing
 */
function logRequest(reqObj: FormattedLogObject, startDate: Date): string {
  const endDate = new Date();
  const msec: number = Math.abs(endDate.getTime() - startDate.getTime());

  const output = [
    `::: ${startDate.toISOString()} :::`,
    `${reqObj.req}`,
    `${reqObj.rsp}`,
    `::: Response Time: ${msec}ms :::`,
  ].join('\n');
  return (`${output}\n`);
}

/**
 * Superagent HTTP client adapter implementation.
 * This adapter implements the IHttpClient interface using the superagent library.
 */
export class SuperagentAdapter implements IHttpClient {
  // eslint-disable-next-line no-unused-vars
  private logger: (_message: string) => void;
  private _request: typeof superagent | null = null;

  // eslint-disable-next-line no-unused-vars
  constructor(logger: (_message: string) => void) {
    this.logger = logger;
    // Load superagent immediately in constructor for fail-fast behavior
    try {
      this._request = require('superagent') as typeof superagent;
    } catch (error: unknown) {
      const typedError = error as Error;
      throw new Error(
        `superagent is required but not found. Please install it with: npm install superagent\n` +
        `Original error: ${typedError.message}`
      );
    }
  }

  // Get the superagent instance (already loaded in constructor)
  private getRequest(): typeof superagent {
    if (!this._request) {
      throw new Error('Failed to initialize superagent instance');
    }
    return this._request;
  }

  public GET<T = unknown>(url: string, data?: Partial<HttpRequestConfig>): Promise<HttpResponse<T>> {
    const request = this.getRequest();
    return this.send<T>(request.get, 'GET', url, data);
  }

  public POST<T = unknown>(url: string, data?: HttpRequestConfig): Promise<HttpResponse<T>> {
    const request = this.getRequest();
    return this.send<T>(request.post, 'POST', url, data);
  }

  public DELETE<T = unknown>(url: string, data?: HttpRequestConfig): Promise<HttpResponse<T>> {
    const request = this.getRequest();
    return this.send<T>(request.delete, 'DELETE', url, data);
  }

  public PUT<T = unknown>(url: string, data?: HttpRequestConfig): Promise<HttpResponse<T>> {
    const request = this.getRequest();
    return this.send<T>(request.put, 'PUT', url, data);
  }

  public PATCH<T = unknown>(url: string, data?: HttpRequestConfig): Promise<HttpResponse<T>> {
    const request = this.getRequest();
    return this.send<T>(request.patch, 'PATCH', url, data);
  }

  public isValidRetryErr(err: string | Error): boolean {
    const validRetryErrs = [
      'ECONNREFUSED',
      'ECONNRESET',
      'ETIMEDOUT',
      'EADDRINFO',
      'ESOCKETTIMEDOUT',
    ];
    
    // Handle string error codes
    if (typeof err === 'string') {
      return validRetryErrs.includes(err);
    }
    
    // Handle error objects with code property
    if ('code' in err && typeof err.code === 'string') {
      return validRetryErrs.includes(err.code);
    }
    
    // Handle regular Error objects using message
    return validRetryErrs.includes(err.message);
  }

  // eslint-disable-next-line no-unused-vars
  private async send<T = unknown>(method: (arg: string) => superagent.SuperAgentRequest, methodName: string, requestUrl: string, data?: HttpRequestConfig): Promise<HttpResponse<T>> {
    let headers: object = {};
    let body: object | undefined;
    let finalHeaders: Record<string, string> = {};

    if (data) {
      headers = data.headers ?? {};
      finalHeaders = headers as Record<string, string>; // Ensure finalHeaders is always an object
      body = data.body;
    }

    // Use the utility functions for query parameter processing
    const { baseUrl, mergedQuery } = mergeQueryParameters(requestUrl, data?.query);
    const processedQuery = processQueryObject(mergedQuery);

    const request = this.getRequest();
    if (method === request.get) {
      finalHeaders = { Accept: 'application/json', ...finalHeaders };
    }

    const startDate = new Date();

    for (let attempt = 0; attempt <= 3; attempt++) {
      try {
        const response = await new Promise<superagent.Response>((resolve, reject) => {
          method(baseUrl)
            .timeout(HTTP_REQUEST.TIMEOUT)
            .set(finalHeaders)
            .send(body)
            .query(processedQuery)
            .ok((res: superagent.Response) => res.status < 600)
            .end((error: Error | null, res?: superagent.Response) => {
              if (error) {
                reject(error);
                return;
              }
              if (res) {
                resolve(res);
                return;
              }
              
              reject(new Error('No response received'));
            });
        });

        // Success - log and return
        const formattedResponse: HttpResponse<T> = {
          status: response.status,
          body: response.body as T,
          request: {
            method: methodName,
            url: requestUrl,
            header: finalHeaders,
            _data: body
          }
        };

        const formattedRsp = logRequest(formatRsp(formattedResponse), startDate);
        this.logger(formattedRsp);
        return formattedResponse;

      } catch (error: unknown) {
        const typedError = error as { code?: string; message?: string };
        if (attempt < 3 && this.isValidRetryErr(typedError.code ?? typedError.message ?? '')) {
          continue;
        }
        throw error; // No more retries or not a retryable error
      }
    }
    
    // This should never be reached due to the retry loop, but TypeScript needs it
    throw new Error('Request failed after all retries');
  }
}
