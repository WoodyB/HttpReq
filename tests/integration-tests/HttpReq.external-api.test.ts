/**
 * External API Integration Tests
 * 
 * These tests use real external APIs (postman-echo.com) to validate HTTP behavior.
 * Unlike nock-based unit tests, these tests:
 * - Detect bugs in both TS and JS versions (no false positives)
 * - Validate actual headers sent over the network
 * - Test real HTTP client behavior
 * 
 * Note: These tests require internet connection and are slower than unit tests.
 */

import { HttpReq, HttpClientType } from '../../src/HttpReq';

describe('HttpReq External API Integration Tests', () => {
  describe.each([
    { clientType: HttpClientType.SUPERAGENT, name: 'superagent' },
    { clientType: HttpClientType.AXIOS, name: 'axios' }
  ])('HttpReq with $name implementation - External API', ({ clientType }) => {
    
    let httpReq: HttpReq;
    
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
        const receivedHeaders = (response.body as any).headers;
        
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
        
        const receivedHeaders = (response.body as any).headers;
        expect(receivedHeaders['authorization']).toBe('Bearer integration-test-token');
      });

      it('should send multiple custom headers to external API', async () => {
        const response = await httpReq.GET('https://postman-echo.com/get', {
          headers: {
            'X-API-Key': 'api-key-123',
            'X-Custom-Header-1': 'value-456',
            'X-Client-Version': '1.0.0'
          }
        });
        
        const receivedHeaders = (response.body as any).headers;
        expect(receivedHeaders['x-api-key']).toBe('api-key-123');
        expect(receivedHeaders['x-custom-header-1']).toBe('value-456');
        expect(receivedHeaders['x-client-version']).toBe('1.0.0');
      });
    });
    
    describe('POST with custom headers', () => {
      it('should send custom headers to external API', async () => {
        const response = await httpReq.POST('https://postman-echo.com/post', {
          headers: {
            'Authorization': 'Bearer post-token',
            'X-API-Key': 'api-key-123'
          },
          body: { test: 'data' }
        });
        
        const receivedHeaders = (response.body as any).headers;
        expect(receivedHeaders['authorization']).toBe('Bearer post-token');
        expect(receivedHeaders['x-api-key']).toBe('api-key-123');
      });
    });

    describe('PUT with custom headers', () => {
      it('should send custom headers to external API', async () => {
        const response = await httpReq.PUT('https://postman-echo.com/put', {
          headers: {
            'Authorization': 'Bearer put-token',
            'X-Update-ID': 'update-789'
          },
          body: { updated: 'data' }
        });
        
        const receivedHeaders = (response.body as any).headers;
        expect(receivedHeaders['authorization']).toBe('Bearer put-token');
        expect(receivedHeaders['x-update-id']).toBe('update-789');
      });
    });

    describe('PATCH with custom headers', () => {
      it('should send custom headers to external API', async () => {
        const response = await httpReq.PATCH('https://postman-echo.com/patch', {
          headers: {
            'Authorization': 'Bearer patch-token',
            'X-Patch-Version': 'v2'
          },
          body: { patched: 'field' }
        });
        
        const receivedHeaders = (response.body as any).headers;
        expect(receivedHeaders['authorization']).toBe('Bearer patch-token');
        expect(receivedHeaders['x-patch-version']).toBe('v2');
      });
    });

    describe('DELETE with custom headers', () => {
      it('should send custom headers to external API', async () => {
        const response = await httpReq.DELETE('https://postman-echo.com/delete', {
          headers: {
            'Authorization': 'Bearer delete-token',
            'X-Delete-Reason': 'cleanup'
          }
        });
        
        const receivedHeaders = (response.body as any).headers;
        expect(receivedHeaders['authorization']).toBe('Bearer delete-token');
        expect(receivedHeaders['x-delete-reason']).toBe('cleanup');
      });
    });
  });
});
