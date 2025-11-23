/**
 * External API Integration Tests (JavaScript)
 * 
 * These tests use real external APIs (postman-echo.com) to validate HTTP behavior.
 * Unlike nock-based unit tests, these tests:
 * - Detect bugs in both TS and JS versions (no false positives)
 * - Validate actual headers sent over the network
 * - Test real HTTP client behavior
 * 
 * Note: These tests require internet connection and are slower than unit tests.
 */

const { HttpReq, HttpClientType } = require('../../src/HttpReq');

describe('HttpReq External API Integration Tests (JavaScript)', () => {
  [
    { clientType: HttpClientType.SUPERAGENT, name: 'superagent' },
    { clientType: HttpClientType.AXIOS, name: 'axios' }
  ].forEach(({ clientType, name }) => {
    describe(`HttpReq with ${name} implementation - External API`, () => {
      
      let httpReq;
      
      beforeEach(() => {
        httpReq = new HttpReq({ 
          clientType,
          logger: () => {} // Suppress logging output in tests
        });
      });
      
      describe('GET with custom headers', () => {
        it('should send custom headers to external API', async () => {
          const response = await httpReq.GET('https://postman-echo.com/get', {
            headers: {
              'Authorization': 'Bearer test-token',
              'X-Custom-Header': 'test-value'
            }
          });
          
          // postman-echo returns the headers it received in response.body.headers
          const receivedHeaders = response.body.headers;
          
          // Check for headers (postman-echo lowercases header names)
          expect(receivedHeaders['authorization']).toBe('Bearer test-token');
          expect(receivedHeaders['x-custom-header']).toBe('test-value');
        });

        it('should send Authorization header to external API', async () => {
          const response = await httpReq.GET('https://postman-echo.com/get', {
            headers: {
              'Authorization': 'Bearer integration-test-token'
            }
          });
          
          const receivedHeaders = response.body.headers;
          expect(receivedHeaders['authorization']).toBe('Bearer integration-test-token');
        });

        it('should send multiple custom headers to external API', async () => {
          const response = await httpReq.GET('https://postman-echo.com/get', {
            headers: {
              'X-Custom-1': 'value1',
              'X-Custom-2': 'value2',
              'X-Custom-3': 'value3'
            }
          });
          
          const receivedHeaders = response.body.headers;
          expect(receivedHeaders['x-custom-1']).toBe('value1');
          expect(receivedHeaders['x-custom-2']).toBe('value2');
          expect(receivedHeaders['x-custom-3']).toBe('value3');
        });
      });

      describe('POST with custom headers', () => {
        it('should send custom headers to external API', async () => {
          const response = await httpReq.POST('https://postman-echo.com/post', {
            headers: {
              'X-Test-Header': 'post-test-value'
            },
            body: { test: 'data' }
          });
          
          const receivedHeaders = response.body.headers;
          expect(receivedHeaders['x-test-header']).toBe('post-test-value');
        });
      });

      describe('PUT with custom headers', () => {
        it('should send custom headers to external API', async () => {
          const response = await httpReq.PUT('https://postman-echo.com/put', {
            headers: {
              'X-Put-Header': 'put-test-value'
            },
            body: { test: 'data' }
          });
          
          const receivedHeaders = response.body.headers;
          expect(receivedHeaders['x-put-header']).toBe('put-test-value');
        });
      });

      describe('PATCH with custom headers', () => {
        it('should send custom headers to external API', async () => {
          const response = await httpReq.PATCH('https://postman-echo.com/patch', {
            headers: {
              'X-Patch-Header': 'patch-test-value'
            },
            body: { test: 'data' }
          });
          
          const receivedHeaders = response.body.headers;
          expect(receivedHeaders['x-patch-header']).toBe('patch-test-value');
        });
      });

      describe('DELETE with custom headers', () => {
        it('should send custom headers to external API', async () => {
          const response = await httpReq.DELETE('https://postman-echo.com/delete', {
            headers: {
              'X-Delete-Header': 'delete-test-value'
            }
          });
          
          const receivedHeaders = response.body.headers;
          expect(receivedHeaders['x-delete-header']).toBe('delete-test-value');
        });
      });
    });
  });
});
