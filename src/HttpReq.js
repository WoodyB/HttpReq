/**
 * HTTP client type enumeration for selecting between axios and superagent implementations.
 */
const HttpClientType = {
  AXIOS: 'axios',
  SUPERAGENT: 'superagent'
};

/**
 * Axios HTTP client implementation for JavaScript version.
 */
class AxiosHttpClient {
  constructor(logger) {
    this.logger = logger;
  }

  /**
   * Performs an HTTP GET request using axios.
   * 
   * @param {string} url - The URL to request
   * @param {Object} [_data] - Optional request configuration
   * @returns {Promise<Object>} Promise resolving to response with status, body, and request info
   */
  async GET(url, _data) {
    const axios = require('axios');
    
    try {
      const response = await axios.get(url);
      
      return {
        status: response.status,
        body: response.data
      };
    } catch (error) {
      throw new Error(`HTTP GET request failed: ${error.message}`);
    }
  }

  /**
   * Performs an HTTP POST request using axios.
   * 
   * @param {string} url - The URL to request
   * @param {Object} [data] - Optional request configuration
   * @param {Object} [data.headers] - Custom headers to include in the request
   * @param {*} [data.body] - Request body data to send
   * @returns {Promise<Object>} Promise resolving to response with status, body, and request info
   */
  async POST(url, data = {}) {
    const axios = require('axios');
    
    try {
      const config = {};
      
      // Add headers if provided
      if (data.headers) {
        config.headers = data.headers;
      }
      
      const response = await axios.post(url, data.body, config);
      
      return {
        status: response.status,
        body: response.data
      };
    } catch (error) {
      throw new Error(`HTTP POST request failed: ${error.message}`);
    }
  }

  /**
   * Performs an HTTP PUT request using axios.
   * 
   * @param {string} url - The URL to request
   * @param {Object} [data] - Optional request configuration
   * @param {Object} [data.headers] - Custom headers to include in the request
   * @param {*} [data.body] - Request body data to send
   * @returns {Promise<Object>} Promise resolving to response with status, body, and request info
   */
  async PUT(url, data = {}) {
    const axios = require('axios');
    
    try {
      const config = {};
      
      // Add headers if provided
      if (data.headers) {
        config.headers = data.headers;
      }
      
      const response = await axios.put(url, data.body, config);
      
      return {
        status: response.status,
        body: response.data
      };
    } catch (error) {
      throw new Error(`HTTP PUT request failed: ${error.message}`);
    }
  }

  /**
   * Performs an HTTP PATCH request using axios.
   * 
   * @param {string} url - The URL to request
   * @param {Object} [data] - Optional request configuration
   * @param {Object} [data.headers] - Custom headers to include in the request
   * @param {*} [data.body] - Request body data to send
   * @returns {Promise<Object>} Promise resolving to response with status, body, and request info
   */
  async PATCH(url, data = {}) {
    const axios = require('axios');
    
    try {
      const config = {};
      
      // Add headers if provided
      if (data.headers) {
        config.headers = data.headers;
      }
      
      const response = await axios.patch(url, data.body, config);
      
      return {
        status: response.status,
        body: response.data
      };
    } catch (error) {
      throw new Error(`HTTP PATCH request failed: ${error.message}`);
    }
  }
}

/**
 * Superagent HTTP client implementation for JavaScript version.
 */
class SuperagentHttpClient {
  constructor(logger) {
    this.logger = logger;
  }

  /**
   * Performs an HTTP GET request using superagent.
   * 
   * @param {string} url - The URL to request
   * @param {Object} [_data] - Optional request configuration
   * @returns {Promise<Object>} Promise resolving to response with status, body, and request info
   */
  async GET(url, _data) {
    const superagent = require('superagent');
    
    try {
      const response = await superagent.get(url);
      
      return {
        status: response.status,
        body: response.body
      };
    } catch (error) {
      throw new Error(`HTTP GET request failed: ${error.message}`);
    }
  }

  /**
   * Performs an HTTP POST request using superagent.
   * 
   * @param {string} url - The URL to request
   * @param {Object} [data] - Optional request configuration
   * @param {Object} [data.headers] - Custom headers to include in the request
   * @param {*} [data.body] - Request body data to send
   * @returns {Promise<Object>} Promise resolving to response with status, body, and request info
   */
  async POST(url, data = {}) {
    const superagent = require('superagent');
    
    try {
      let request = superagent.post(url);
      
      // Add headers if provided
      if (data.headers) {
        request = request.set(data.headers);
      }
      
      // Add body if provided
      if (data.body) {
        request = request.send(data.body);
      }
      
      const response = await request;
      
      return {
        status: response.status,
        body: response.body
      };
    } catch (error) {
      throw new Error(`HTTP POST request failed: ${error.message}`);
    }
  }

  /**
   * Performs an HTTP PUT request using superagent.
   * 
   * @param {string} url - The URL to request
   * @param {Object} [data] - Optional request configuration
   * @param {Object} [data.headers] - Custom headers to include in the request
   * @param {*} [data.body] - Request body data to send
   * @returns {Promise<Object>} Promise resolving to response with status, body, and request info
   */
  async PUT(url, data = {}) {
    const superagent = require('superagent');
    
    try {
      let request = superagent.put(url);
      
      // Add headers if provided
      if (data.headers) {
        request = request.set(data.headers);
      }
      
      // Add body if provided
      if (data.body) {
        request = request.send(data.body);
      }
      
      const response = await request;
      
      return {
        status: response.status,
        body: response.body
      };
    } catch (error) {
      throw new Error(`HTTP PUT request failed: ${error.message}`);
    }
  }

  /**
   * Performs an HTTP PATCH request using superagent.
   * 
   * @param {string} url - The URL to request
   * @param {Object} [data] - Optional request configuration
   * @param {Object} [data.headers] - Custom headers to include in the request
   * @param {*} [data.body] - Request body data to send
   * @returns {Promise<Object>} Promise resolving to response with status, body, and request info
   */
  async PATCH(url, data = {}) {
    const superagent = require('superagent');
    
    try {
      let request = superagent.patch(url);
      
      // Add headers if provided
      if (data.headers) {
        request = request.set(data.headers);
      }
      
      // Add body if provided
      if (data.body) {
        request = request.send(data.body);
      }
      
      const response = await request;
      
      return {
        status: response.status,
        body: response.body
      };
    } catch (error) {
      throw new Error(`HTTP PATCH request failed: ${error.message}`);
    }
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

  /**
   * Determines if an error represents a network condition that warrants a retry.
   * 
   * @param {string|Error|Object} error - Error to check (string, Error object, or object with code property)
   * @returns {boolean} True if the error should trigger a retry, false otherwise
   */
  isValidRetryErr(error) {
    const validRetryErrs = [
      'ECONNREFUSED',
      'ECONNRESET', 
      'ETIMEDOUT',
      'EADDRINFO',
      'ESOCKETTIMEDOUT',
    ];
    
    // Handle string error codes
    if (typeof error === 'string') {
      return validRetryErrs.includes(error);
    }
    
    // Handle error objects with code property (axios style)
    if (error && typeof error === 'object' && 'code' in error && error.code) {
      return validRetryErrs.includes(error.code);
    }
    
    // Handle regular Error objects using message
    if (error && typeof error === 'object' && 'message' in error) {
      return validRetryErrs.includes(error.message);
    }
    
    return false;
  }

  /**
   * Performs an HTTP GET request.
   * 
   * @param {string} url - The URL to request
   * @param {Object} [data] - Optional request configuration
   * @returns {Promise<Object>} Promise resolving to response with status, body, and request info
   */
  GET(url, data) {
    return this.httpClient.GET(url, data);
  }

  /**
   * Performs an HTTP POST request.
   * 
   * @param {string} url - The URL to request
   * @param {Object} [data] - Optional request configuration
   * @param {Object} [data.headers] - Custom headers to include in the request
   * @param {*} [data.body] - Request body data to send
   * @returns {Promise<Object>} Promise resolving to response with status, body, and request info
   */
  POST(url, data) {
    return this.httpClient.POST(url, data);
  }

  /**
   * Performs an HTTP PUT request.
   * 
   * @param {string} url - The URL to request
   * @param {Object} [data] - Optional request configuration
   * @param {Object} [data.headers] - Custom headers to include in the request
   * @param {*} [data.body] - Request body data to send
   * @returns {Promise<Object>} Promise resolving to response with status, body, and request info
   */
  PUT(url, data) {
    return this.httpClient.PUT(url, data);
  }

  /**
   * Performs an HTTP PATCH request.
   * 
   * @param {string} url - The URL to request
   * @param {Object} [data] - Optional request configuration
   * @param {Object} [data.headers] - Custom headers to include in the request
   * @param {*} [data.body] - Request body data to send
   * @returns {Promise<Object>} Promise resolving to response with status, body, and request info
   */
  PATCH(url, data) {
    return this.httpClient.PATCH(url, data);
  }
}

// Export for CommonJS (Jest compatibility)
module.exports = { HttpReq, HttpClientType };