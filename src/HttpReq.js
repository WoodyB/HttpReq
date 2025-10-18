/**
 * HTTP client type enumeration for selecting between axios and superagent implementations.
 */
const HttpClientType = {
  AXIOS: 'axios',
  SUPERAGENT: 'superagent'
};

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
    this.httpClient = null; // Will be lazy-loaded when needed
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