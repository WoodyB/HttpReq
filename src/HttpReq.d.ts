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
}

export = { HttpReq, HttpClientType };