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
class AxiosAdapter {
  constructor(logger) {
    this.logger = logger;
    // Load axios immediately in constructor for fail-fast behavior
    try {
      this.axiosInstance = require('axios');
    } catch (error) {
      throw new Error(
        `axios is required but not found. Please install it with: npm install axios\n` +
        `Original error: ${error.message}`
      );
    }
  }

  /**
   * Get the axios instance (already loaded in constructor).
   * @returns {Object} axios module
   */
  getAxios() {
    if (!this.axiosInstance) {
      throw new Error('Failed to initialize axios instance');
    }
    return this.axiosInstance;
  }

  /**
   * Performs an HTTP GET request using axios.
   * 
   * @param {string} url - The URL to request
   * @param {Object} [data] - Optional request configuration
   * @param {Object} [data.headers] - Custom headers to include in the request
   * @param {Object} [data.query] - Query parameters to append to the URL
   * @returns {Promise<Object>} Promise resolving to response with status, body, and request info
   */
  async GET(url, data = {}) {
    const { URLSearchParams } = require('url');
    
    const startDate = new Date();
    
    try {
      const config = {
        validateStatus: (status) => status < 600
      };
      
      // Add headers if provided
      if (data.headers) {
        config.headers = data.headers;
      }
      
      // Parse URL and merge query parameters
      let baseUrl = url;
      let mergedQuery = {};
      
      if (url.includes('?')) {
        const [base, queryString] = url.split('?');
        baseUrl = base;
        
        // Parse existing query parameters from URL
        const urlParams = new URLSearchParams(queryString);
        urlParams.forEach((value, key) => {
          mergedQuery[key] = value;
        });
      }
      
      // Merge with query object (query object takes precedence)
      if (data.query) {
        mergedQuery = { ...mergedQuery, ...data.query };
      }
      
      // Process query values: convert arrays to comma-separated strings, convert primitives to strings
      const processedQuery = {};
      for (const [key, value] of Object.entries(mergedQuery)) {
        // Skip null, undefined, and empty string values
        if (value === null || value === undefined || value === '') {
          continue;
        }
        
        // Handle arrays by joining with commas (skip empty arrays)
        if (Array.isArray(value)) {
          if (value.length === 0) {
            continue;
          }
          processedQuery[key] = value.join(',');
        } else {
          processedQuery[key] = String(value);
        }
      }
      
      // Add merged query parameters if any exist
      if (Object.keys(processedQuery).length > 0) {
        config.params = processedQuery;
      }
      
      const axios = this.getAxios();
      const response = await axios.get(baseUrl, config);
      
      const formattedResponse = {
        status: response.status,
        body: response.data,
        request: {
          method: 'GET',
          url: url,
          header: data.headers || {},
          _data: undefined
        }
      };
      
      const formattedRsp = logRequest(formatRsp(formattedResponse), startDate);
      this.logger(formattedRsp);
      
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
   * @param {Object} [data.query] - Query parameters to append to the URL
   * @param {*} [data.body] - Request body data to send
   * @returns {Promise<Object>} Promise resolving to response with status, body, and request info
   */
  async POST(url, data = {}) {
    const { URLSearchParams } = require('url');
    
    const startDate = new Date();
    
    try {
      const config = {
        validateStatus: (status) => status < 600
      };
      
      // Add headers if provided
      if (data.headers) {
        config.headers = data.headers;
      }
      
      // Parse URL and merge query parameters
      let baseUrl = url;
      let mergedQuery = {};
      
      if (url.includes('?')) {
        const [base, queryString] = url.split('?');
        baseUrl = base;
        
        // Parse existing query parameters from URL
        const urlParams = new URLSearchParams(queryString);
        urlParams.forEach((value, key) => {
          mergedQuery[key] = value;
        });
      }
      
      // Merge with query object (query object takes precedence)
      if (data.query) {
        mergedQuery = { ...mergedQuery, ...data.query };
      }
      
      // Process query values
      const processedQuery = {};
      for (const [key, value] of Object.entries(mergedQuery)) {
        if (value === null || value === undefined || value === '') {
          continue;
        }
        
        if (Array.isArray(value)) {
          if (value.length === 0) {
            continue;
          }
          processedQuery[key] = value.join(',');
        } else {
          processedQuery[key] = String(value);
        }
      }
      
      // Add query parameters if any exist
      if (Object.keys(processedQuery).length > 0) {
        config.params = processedQuery;
      }
      
      const axios = this.getAxios();
      const response = await axios.post(baseUrl, data.body, config);
      
      const formattedResponse = {
        status: response.status,
        body: response.data,
        request: {
          method: 'POST',
          url: url,
          header: data.headers || {},
          _data: data.body
        }
      };
      
      const formattedRsp = logRequest(formatRsp(formattedResponse), startDate);
      this.logger(formattedRsp);
      
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
   * @param {Object} [data.query] - Query parameters to append to the URL
   * @param {*} [data.body] - Request body data to send
   * @returns {Promise<Object>} Promise resolving to response with status, body, and request info
   */
  async PUT(url, data = {}) {
    const { URLSearchParams } = require('url');
    
    const startDate = new Date();
    
    try {
      const config = {
        validateStatus: (status) => status < 600
      };
      
      // Add headers if provided
      if (data.headers) {
        config.headers = data.headers;
      }
      
      // Parse URL and merge query parameters
      let baseUrl = url;
      let mergedQuery = {};
      
      if (url.includes('?')) {
        const [base, queryString] = url.split('?');
        baseUrl = base;
        
        const urlParams = new URLSearchParams(queryString);
        urlParams.forEach((value, key) => {
          mergedQuery[key] = value;
        });
      }
      
      if (data.query) {
        mergedQuery = { ...mergedQuery, ...data.query };
      }
      
      // Process query values
      const processedQuery = {};
      for (const [key, value] of Object.entries(mergedQuery)) {
        if (value === null || value === undefined || value === '') {
          continue;
        }
        
        if (Array.isArray(value)) {
          if (value.length === 0) {
            continue;
          }
          processedQuery[key] = value.join(',');
        } else {
          processedQuery[key] = String(value);
        }
      }
      
      if (Object.keys(processedQuery).length > 0) {
        config.params = processedQuery;
      }
      
      const axios = this.getAxios();
      const response = await axios.put(baseUrl, data.body, config);
      
      const formattedResponse = {
        status: response.status,
        body: response.data,
        request: {
          method: 'PUT',
          url: url,
          header: data.headers || {},
          _data: data.body
        }
      };
      
      const formattedRsp = logRequest(formatRsp(formattedResponse), startDate);
      this.logger(formattedRsp);
      
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
   * @param {Object} [data.query] - Query parameters to append to the URL
   * @param {*} [data.body] - Request body data to send
   * @returns {Promise<Object>} Promise resolving to response with status, body, and request info
   */
  async PATCH(url, data = {}) {
    const { URLSearchParams } = require('url');
    
    const startDate = new Date();
    
    try {
      const config = {
        validateStatus: (status) => status < 600
      };
      
      // Add headers if provided
      if (data.headers) {
        config.headers = data.headers;
      }
      
      // Parse URL and merge query parameters
      let baseUrl = url;
      let mergedQuery = {};
      
      if (url.includes('?')) {
        const [base, queryString] = url.split('?');
        baseUrl = base;
        
        const urlParams = new URLSearchParams(queryString);
        urlParams.forEach((value, key) => {
          mergedQuery[key] = value;
        });
      }
      
      if (data.query) {
        mergedQuery = { ...mergedQuery, ...data.query };
      }
      
      // Process query values
      const processedQuery = {};
      for (const [key, value] of Object.entries(mergedQuery)) {
        if (value === null || value === undefined || value === '') {
          continue;
        }
        
        if (Array.isArray(value)) {
          if (value.length === 0) {
            continue;
          }
          processedQuery[key] = value.join(',');
        } else {
          processedQuery[key] = String(value);
        }
      }
      
      if (Object.keys(processedQuery).length > 0) {
        config.params = processedQuery;
      }
      
      const axios = this.getAxios();
      const response = await axios.patch(baseUrl, data.body, config);
      
      const formattedResponse = {
        status: response.status,
        body: response.data,
        request: {
          method: 'PATCH',
          url: url,
          header: data.headers || {},
          _data: data.body
        }
      };
      
      const formattedRsp = logRequest(formatRsp(formattedResponse), startDate);
      this.logger(formattedRsp);
      
      return {
        status: response.status,
        body: response.data
      };
    } catch (error) {
      throw new Error(`HTTP PATCH request failed: ${error.message}`);
    }
  }

  /**
   * Performs an HTTP DELETE request using axios.
   * 
   * @param {string} url - The URL to request
   * @param {Object} [data] - Optional request configuration
   * @param {Object} [data.headers] - Custom headers to include in the request
   * @param {Object} [data.query] - Query parameters to append to the URL
   * @returns {Promise<Object>} Promise resolving to response with status, body, and request info
   */
  async DELETE(url, data = {}) {
    const { URLSearchParams } = require('url');
    
    const startDate = new Date();
    
    try {
      const config = {
        validateStatus: (status) => status < 600
      };
      
      // Add headers if provided
      if (data && data.headers) {
        config.headers = data.headers;
      }
      
      // Parse URL and merge query parameters
      let baseUrl = url;
      let mergedQuery = {};
      
      if (url.includes('?')) {
        const [base, queryString] = url.split('?');
        baseUrl = base;
        
        const urlParams = new URLSearchParams(queryString);
        urlParams.forEach((value, key) => {
          mergedQuery[key] = value;
        });
      }
      
      if (data && data.query) {
        mergedQuery = { ...mergedQuery, ...data.query };
      }
      
      // Process query values
      const processedQuery = {};
      for (const [key, value] of Object.entries(mergedQuery)) {
        if (value === null || value === undefined || value === '') {
          continue;
        }
        
        if (Array.isArray(value)) {
          if (value.length === 0) {
            continue;
          }
          processedQuery[key] = value.join(',');
        } else {
          processedQuery[key] = String(value);
        }
      }
      
      if (Object.keys(processedQuery).length > 0) {
        config.params = processedQuery;
      }
      
      const axios = this.getAxios();
      const response = await axios.delete(baseUrl, config);
      
      const formattedResponse = {
        status: response.status,
        body: response.data,
        request: {
          method: 'DELETE',
          url: url,
          header: data.headers || {},
          _data: undefined
        }
      };
      
      const formattedRsp = logRequest(formatRsp(formattedResponse), startDate);
      this.logger(formattedRsp);
      
      return {
        status: response.status,
        body: response.data
      };
    } catch (error) {
      throw new Error(`HTTP DELETE request failed: ${error.message}`);
    }
  }
}

/**
 * Superagent HTTP client implementation for JavaScript version.
 */
class SuperagentAdapter {
  constructor(logger) {
    this.logger = logger;
    // Load superagent immediately in constructor for fail-fast behavior
    try {
      this.superagent = require('superagent');
    } catch (error) {
      throw new Error(
        `superagent is required but not found. Please install it with: npm install superagent\n` +
        `Original error: ${error.message}`
      );
    }
  }

  /**
   * Get the superagent instance (already loaded in constructor).
   * @returns {Object} superagent module
   */
  getSuperagent() {
    if (!this.superagent) {
      throw new Error('Failed to initialize superagent instance');
    }
    return this.superagent;
  }

  /**
   * Performs an HTTP GET request using superagent.
   * 
   * @param {string} url - The URL to request
   * @param {Object} [data] - Optional request configuration
   * @param {Object} [data.headers] - Custom headers to include in the request
   * @param {Object} [data.query] - Query parameters to append to the URL
   * @returns {Promise<Object>} Promise resolving to response with status, body, and request info
   */
  async GET(url, data = {}) {
    const superagent = this.getSuperagent();
    const { URLSearchParams } = require('url');
    
    const startDate = new Date();
    
    try {
      // Parse URL and merge query parameters
      let baseUrl = url;
      let mergedQuery = {};
      
      if (url.includes('?')) {
        const [base, queryString] = url.split('?');
        baseUrl = base;
        
        // Parse existing query parameters from URL
        const urlParams = new URLSearchParams(queryString);
        urlParams.forEach((value, key) => {
          mergedQuery[key] = value;
        });
      }
      
      // Merge with query object (query object takes precedence)
      if (data.query) {
        mergedQuery = { ...mergedQuery, ...data.query };
      }
      
      // Process query values: convert arrays to comma-separated strings, convert primitives to strings
      const processedQuery = {};
      for (const [key, value] of Object.entries(mergedQuery)) {
        // Skip null, undefined, and empty string values
        if (value === null || value === undefined || value === '') {
          continue;
        }
        
        // Handle arrays by joining with commas (skip empty arrays)
        if (Array.isArray(value)) {
          if (value.length === 0) {
            continue;
          }
          processedQuery[key] = value.join(',');
        } else {
          processedQuery[key] = String(value);
        }
      }
      
      let request = superagent.get(baseUrl);
      
      // Add headers if provided
      if (data.headers) {
        request = request.set(data.headers);
      }
      
      // Add merged query parameters if any exist
      if (Object.keys(processedQuery).length > 0) {
        request = request.query(processedQuery);
      }
      
      const response = await request.ok((res) => res.status < 600);
      
      const formattedResponse = {
        status: response.status,
        body: response.body,
        request: {
          method: 'GET',
          url: url,
          header: data.headers || {},
          _data: undefined
        }
      };
      
      const formattedRsp = logRequest(formatRsp(formattedResponse), startDate);
      this.logger(formattedRsp);
      
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
   * @param {Object} [data.query] - Query parameters to append to the URL
   * @param {*} [data.body] - Request body data to send
   * @returns {Promise<Object>} Promise resolving to response with status, body, and request info
   */
  async POST(url, data = {}) {
    const superagent = this.getSuperagent();
    const { URLSearchParams } = require('url');
    
    const startDate = new Date();
    
    try {
      // Parse URL and merge query parameters
      let baseUrl = url;
      let mergedQuery = {};
      
      if (url.includes('?')) {
        const [base, queryString] = url.split('?');
        baseUrl = base;
        
        const urlParams = new URLSearchParams(queryString);
        urlParams.forEach((value, key) => {
          mergedQuery[key] = value;
        });
      }
      
      if (data.query) {
        mergedQuery = { ...mergedQuery, ...data.query };
      }
      
      // Process query values
      const processedQuery = {};
      for (const [key, value] of Object.entries(mergedQuery)) {
        if (value === null || value === undefined || value === '') {
          continue;
        }
        
        if (Array.isArray(value)) {
          if (value.length === 0) {
            continue;
          }
          processedQuery[key] = value.join(',');
        } else {
          processedQuery[key] = String(value);
        }
      }
      
      let request = superagent.post(baseUrl);
      
      // Add headers if provided
      if (data.headers) {
        request = request.set(data.headers);
      }
      
      // Add query parameters if any exist
      if (Object.keys(processedQuery).length > 0) {
        request = request.query(processedQuery);
      }
      
      // Add body if provided
      if (data.body) {
        request = request.send(data.body);
      }
      
      const response = await request.ok((res) => res.status < 600);
      
      const formattedResponse = {
        status: response.status,
        body: response.body,
        request: {
          method: 'POST',
          url: url,
          header: data.headers || {},
          _data: data.body
        }
      };
      
      const formattedRsp = logRequest(formatRsp(formattedResponse), startDate);
      this.logger(formattedRsp);
      
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
   * @param {Object} [data.query] - Query parameters to append to the URL
   * @param {*} [data.body] - Request body data to send
   * @returns {Promise<Object>} Promise resolving to response with status, body, and request info
   */
  async PUT(url, data = {}) {
    const superagent = this.getSuperagent();
    const { URLSearchParams } = require('url');
    
    const startDate = new Date();
    
    try {
      let baseUrl = url;
      let mergedQuery = {};
      
      if (url.includes('?')) {
        const [base, queryString] = url.split('?');
        baseUrl = base;
        
        const urlParams = new URLSearchParams(queryString);
        urlParams.forEach((value, key) => {
          mergedQuery[key] = value;
        });
      }
      
      if (data.query) {
        mergedQuery = { ...mergedQuery, ...data.query };
      }
      
      const processedQuery = {};
      for (const [key, value] of Object.entries(mergedQuery)) {
        if (value === null || value === undefined || value === '') {
          continue;
        }
        
        if (Array.isArray(value)) {
          if (value.length === 0) {
            continue;
          }
          processedQuery[key] = value.join(',');
        } else {
          processedQuery[key] = String(value);
        }
      }
      
      let request = superagent.put(baseUrl);
      
      if (data.headers) {
        request = request.set(data.headers);
      }
      
      if (Object.keys(processedQuery).length > 0) {
        request = request.query(processedQuery);
      }
      
      if (data.body) {
        request = request.send(data.body);
      }
      
      const response = await request.ok((res) => res.status < 600);
      
      const formattedResponse = {
        status: response.status,
        body: response.body,
        request: {
          method: 'PUT',
          url: url,
          header: data.headers || {},
          _data: data.body
        }
      };
      
      const formattedRsp = logRequest(formatRsp(formattedResponse), startDate);
      this.logger(formattedRsp);
      
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
   * @param {Object} [data.query] - Query parameters to append to the URL
   * @param {*} [data.body] - Request body data to send
   * @returns {Promise<Object>} Promise resolving to response with status, body, and request info
   */
  async PATCH(url, data = {}) {
    const superagent = this.getSuperagent();
    const { URLSearchParams } = require('url');
    
    const startDate = new Date();
    
    try {
      let baseUrl = url;
      let mergedQuery = {};
      
      if (url.includes('?')) {
        const [base, queryString] = url.split('?');
        baseUrl = base;
        
        const urlParams = new URLSearchParams(queryString);
        urlParams.forEach((value, key) => {
          mergedQuery[key] = value;
        });
      }
      
      if (data.query) {
        mergedQuery = { ...mergedQuery, ...data.query };
      }
      
      const processedQuery = {};
      for (const [key, value] of Object.entries(mergedQuery)) {
        if (value === null || value === undefined || value === '') {
          continue;
        }
        
        if (Array.isArray(value)) {
          if (value.length === 0) {
            continue;
          }
          processedQuery[key] = value.join(',');
        } else {
          processedQuery[key] = String(value);
        }
      }
      
      let request = superagent.patch(baseUrl);
      
      if (data.headers) {
        request = request.set(data.headers);
      }
      
      if (Object.keys(processedQuery).length > 0) {
        request = request.query(processedQuery);
      }
      
      if (data.body) {
        request = request.send(data.body);
      }
      
      const response = await request.ok((res) => res.status < 600);
      
      const formattedResponse = {
        status: response.status,
        body: response.body,
        request: {
          method: 'PATCH',
          url: url,
          header: data.headers || {},
          _data: data.body
        }
      };
      
      const formattedRsp = logRequest(formatRsp(formattedResponse), startDate);
      this.logger(formattedRsp);
      
      return {
        status: response.status,
        body: response.body
      };
    } catch (error) {
      throw new Error(`HTTP PATCH request failed: ${error.message}`);
    }
  }

  /**
   * Performs an HTTP DELETE request using superagent.
   * 
   * @param {string} url - The URL to request
   * @param {Object} [data] - Optional request configuration
   * @param {Object} [data.headers] - Custom headers to include in the request
   * @param {Object} [data.query] - Query parameters to append to the URL
   * @returns {Promise<Object>} Promise resolving to response with status, body, and request info
   */
  async DELETE(url, data = {}) {
    const superagent = this.getSuperagent();
    const { URLSearchParams } = require('url');
    
    const startDate = new Date();
    
    try {
      let baseUrl = url;
      let mergedQuery = {};
      
      if (url.includes('?')) {
        const [base, queryString] = url.split('?');
        baseUrl = base;
        
        const urlParams = new URLSearchParams(queryString);
        urlParams.forEach((value, key) => {
          mergedQuery[key] = value;
        });
      }
      
      if (data.query) {
        mergedQuery = { ...mergedQuery, ...data.query };
      }
      
      const processedQuery = {};
      for (const [key, value] of Object.entries(mergedQuery)) {
        if (value === null || value === undefined || value === '') {
          continue;
        }
        
        if (Array.isArray(value)) {
          if (value.length === 0) {
            continue;
          }
          processedQuery[key] = value.join(',');
        } else {
          processedQuery[key] = String(value);
        }
      }
      
      let request = superagent.delete(baseUrl);
      
      if (data && data.headers) {
        request = request.set(data.headers);
      }
      
      if (Object.keys(processedQuery).length > 0) {
        request = request.query(processedQuery);
      }
      
      const response = await request.ok((res) => res.status < 600);
      
      const formattedResponse = {
        status: response.status,
        body: response.body,
        request: {
          method: 'DELETE',
          url: url,
          header: data.headers || {},
          _data: undefined
        }
      };
      
      const formattedRsp = logRequest(formatRsp(formattedResponse), startDate);
      this.logger(formattedRsp);
      
      return {
        status: response.status,
        body: response.body
      };
    } catch (error) {
      throw new Error(`HTTP DELETE request failed: ${error.message}`);
    }
  }
}

/**
 * Obfuscates sensitive data in request objects for logging purposes.
 * @param {Object} args - Object that may contain sensitive fields
 * @returns {Object} Object with sensitive fields replaced with placeholder text
 */
function obfuscate(args) {
  const fixedArgs = { ...args };
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
 * @param {Object} reqObj - Formatted request/response object
 * @param {Date} startDate - Request start timestamp
 * @returns {string} Formatted log string with timing
 */
function logRequest(reqObj, startDate) {
  const endDate = new Date();
  const msec = Math.abs(endDate.getTime() - startDate.getTime());

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
 * @param {Object} res - Response object to format
 * @returns {Object} Object with formatted request and response strings
 */
function formatRsp(res) {
  let data;

  const output = { req: '', rsp: '' };
  const regexBracesQuotesCommas = /({\n)|(")|(,)|(\n})/g;
  const regexAuthToken = /Authorization:\s*.*/gi;
  const regexVerificationToken = /verification-token:\s.*/gi;

  let headers = JSON.stringify(res.request.header || {}, null, 4);
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
    // eslint-disable-next-line no-console
    this.logger = options.logger ?? console.log;
    this.clientType = options.clientType || HttpClientType.AXIOS;
    
    // Create the appropriate HTTP client based on the clientType
    if (this.clientType === HttpClientType.AXIOS) {
      this.httpClient = new AxiosAdapter(this.logger);
      return;
    }
    
    this.httpClient = new SuperagentAdapter(this.logger);
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
   * @param {Object} [data.headers] - Custom headers to include in the request
   * @param {Object} [data.query] - Query parameters to append to the URL
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

  /**
   * Performs an HTTP DELETE request.
   * 
   * @param {string} url - The URL to request
   * @param {Object} [data] - Optional request configuration
   * @param {Object} [data.headers] - Custom headers to include in the request
   * @param {Object} [data.query] - Query parameters to append to the URL
   * @returns {Promise<Object>} Promise resolving to response with status, body, and request info
   */
  DELETE(url, data) {
    return this.httpClient.DELETE(url, data);
  }
}

// Export for CommonJS (Jest compatibility)
module.exports = { HttpReq, HttpClientType };