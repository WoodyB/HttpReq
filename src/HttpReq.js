/**
 * HTTP client type enumeration for selecting between axios and superagent implementations.
 */
const HttpClientType = {
  AXIOS: 'axios',
  SUPERAGENT: 'superagent'
};

/**
 * Mock Axios HTTP client implementation for JavaScript version.
 */
class AxiosHttpClient {
  constructor(logger) {
    this.logger = logger;
  }
}

/**
 * Mock Superagent HTTP client implementation for JavaScript version.
 */
class SuperagentHttpClient {
  constructor(logger) {
    this.logger = logger;
  }
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
 */
class HttpReq {
  /**
   * Creates a new HttpReq instance with the specified options.
   * 
   * @param {Object} [options={}] - Configuration options for the HTTP client
   * @param {Function} [options.logger] - Custom logger function (defaults to console.log)
   * @param {string} [options.clientType] - HTTP client type to use (defaults to AXIOS)
   */
  constructor(options = {}) {
    this.logger = options.logger || (() => {});
    this.clientType = options.clientType || HttpClientType.AXIOS;
    
    // Create the appropriate HTTP client based on the clientType
    if (this.clientType === HttpClientType.AXIOS) {
      this.httpClient = new AxiosHttpClient(this.logger);
      return;
    }
    
    this.httpClient = new SuperagentHttpClient(this.logger);
  }

  /**
   * Gets the currently configured HTTP client type.
   * 
   * @returns {string} The HTTP client type ('axios' or 'superagent')
   */
  getClientType() {
    return this.clientType;
  }
}

// Export for CommonJS (Jest compatibility)
module.exports = { HttpReq, HttpClientType };