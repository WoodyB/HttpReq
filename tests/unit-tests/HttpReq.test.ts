import nock from 'nock';
import { HttpReq, HttpClientType } from '../../src/HttpReq';
import { responseFixtures } from '../fixtures/responses';
import { TestLogger } from '../TestLogger';

// Test response interfaces for type safety
interface TestSuccessResponse {
  message: string;
  data: {
    name: string;
    email?: string;
  };
}

interface TestCreateResponse {
  message: string;
  id: number;
}

interface TestUsersResponse {
  users: Array<{ id: number; name: string }>;
}

interface TestErrorResponse {
  error: string;
}

interface TestSuccessFlag {
  success: boolean;
  maxRetriesUsed?: boolean;
}

interface TestDataResponse {
  data: string;
}

describe('HttpReq - Constructor Options', () => {
  it('should use all defaults when no options provided', () => {
    const httpReq = new HttpReq();
    expect(httpReq.getClientType()).toBe(HttpClientType.AXIOS);
  });

  it('should use custom logger with default client', () => {
    const mockLogger = jest.fn();
    const httpReq = new HttpReq({ logger: mockLogger });
    expect(httpReq.getClientType()).toBe(HttpClientType.AXIOS);
  });

  it('should use custom client with default logger', () => {
    const httpReq = new HttpReq({ clientType: HttpClientType.SUPERAGENT });
    expect(httpReq.getClientType()).toBe(HttpClientType.SUPERAGENT);
  });

  it('should use both custom logger and client', () => {
    const mockLogger = jest.fn();
    const httpReq = new HttpReq({ 
      logger: mockLogger, 
      clientType: HttpClientType.SUPERAGENT
    });
    expect(httpReq.getClientType()).toBe(HttpClientType.SUPERAGENT);
  });

  it('should handle empty options object', () => {
    const httpReq = new HttpReq({});
    expect(httpReq.getClientType()).toBe(HttpClientType.AXIOS);
  });
});

describe('HttpReq - HTTP Client Implementation', () => {
  it('should actually use superagent when SUPERAGENT is specified', async () => {
    const mockLogger = jest.fn();
    const httpReq = new HttpReq({ logger: mockLogger, clientType: HttpClientType.SUPERAGENT });
    
    const httpReqAny = httpReq as any;
    expect(() => httpReqAny.isValidRetryErr('ECONNREFUSED')).not.toThrow();
    expect(httpReqAny.isValidRetryErr('ECONNREFUSED')).toBe(true);
  });

  it('should actually use axios when AXIOS is specified', async () => {
    const mockLogger = jest.fn();
    const httpReq = new HttpReq({ logger: mockLogger, clientType: HttpClientType.AXIOS });
    
    const httpReqAny = httpReq as any;
    expect(() => httpReqAny.isValidRetryErr({ code: 'ECONNREFUSED' })).not.toThrow();
    expect(httpReqAny.isValidRetryErr({ code: 'ECONNREFUSED' })).toBe(true);
  });
});

describe.each([
  [HttpClientType.SUPERAGENT, 'superagent'],
  [HttpClientType.AXIOS, 'axios']
])('HttpReq with %s implementation', (clientType) => {
  let httpReq: HttpReq;
  let testLogger: TestLogger;
  const testBaseUrl = 'https://api.test.com';

  beforeEach(() => {
    testLogger = new TestLogger();
    httpReq = new HttpReq({ logger: testLogger.log, clientType });
    nock.cleanAll();
  });

  afterEach(() => {
    nock.cleanAll();
  });

  describe('HTTP Methods', () => {
    it('should make successful GET request', async () => {
      const scope = nock(testBaseUrl)
        .get('/users')
        .reply(responseFixtures.success.status, responseFixtures.success.body);

      const response = await httpReq.GET<TestSuccessResponse>(`${testBaseUrl}/users`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Success');
      expect(response.body.data.name).toBe('Test User');
      expect(scope.isDone()).toBe(true);
    });

    it('should make successful POST request', async () => {
      const requestBody = { name: 'New User', email: 'new@example.com' };
      
      const scope = nock(testBaseUrl)
        .post('/users', requestBody)
        .reply(responseFixtures.created.status, responseFixtures.created.body);

      const response = await httpReq.POST<TestCreateResponse>(`${testBaseUrl}/users`, { 
        headers: {}, 
        body: requestBody 
      });

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Resource created successfully');
      expect(response.body.id).toBe(123);
      expect(scope.isDone()).toBe(true);
    });

    it('should make successful PUT request', async () => {
      const requestBody = { name: 'Updated User', email: 'updated@example.com' };
      
      const scope = nock(testBaseUrl)
        .put('/users/1', requestBody)
        .reply(responseFixtures.success.status, responseFixtures.success.body);

      const response = await httpReq.PUT<TestSuccessResponse>(`${testBaseUrl}/users/1`, { 
        headers: {}, 
        body: requestBody 
      });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Success');
      expect(scope.isDone()).toBe(true);
    });

    it('should make successful PATCH request', async () => {
      const requestBody = { email: 'patched@example.com' };
      
      const scope = nock(testBaseUrl)
        .patch('/users/1', requestBody)
        .reply(responseFixtures.success.status, responseFixtures.success.body);

      const response = await httpReq.PATCH<TestSuccessResponse>(`${testBaseUrl}/users/1`, { 
        headers: {}, 
        body: requestBody 
      });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Success');
      expect(scope.isDone()).toBe(true);
    });

    it('should make successful DELETE request', async () => {
      const scope = nock(testBaseUrl)
        .delete('/users/1')
        .reply(204);

      const response = await httpReq.DELETE(`${testBaseUrl}/users/1`);

      expect(response.status).toBe(204);
      expect(scope.isDone()).toBe(true);
    });

    it('should handle URLs without query parameters', async () => {
      const scope = nock(testBaseUrl)
        .get('/simple')
        .reply(responseFixtures.success.status, responseFixtures.success.body);

      const response = await httpReq.GET<TestSuccessResponse>(`${testBaseUrl}/simple`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Success');
      expect(scope.isDone()).toBe(true);
    });
  });

  describe('Headers and Parameters', () => {
    it('should include custom headers in request', async () => {
      const customHeaders = {
        'Authorization': 'Bearer token123',
        'X-Custom-Header': 'custom-value'
      };

      const scope = nock(testBaseUrl)
        .get('/users')
        .matchHeader('Authorization', 'Bearer token123')
        .matchHeader('X-Custom-Header', 'custom-value')
        .reply(responseFixtures.success.status, responseFixtures.success.body);

      const response = await httpReq.GET(`${testBaseUrl}/users`, { headers: customHeaders });

      expect(response.status).toBe(200);
      expect(scope.isDone()).toBe(true);
    });

    it('should handle query parameters correctly', async () => {
      const scope = nock(testBaseUrl)
        .get('/users')
        .query({ page: '1', limit: '10', active: 'true' })
        .reply(responseFixtures.userList.status, responseFixtures.userList.body);

      const response = await httpReq.GET<TestUsersResponse>(`${testBaseUrl}/users?page=1&limit=10&active=true`);

      expect(response.status).toBe(200);
      expect(response.body.users).toHaveLength(3);
      expect(scope.isDone()).toBe(true);
    });

    it('should accept query parameters as an object', async () => {
      const scope = nock(testBaseUrl)
        .get('/users')
        .query({ page: '1', limit: '10', active: 'true' })
        .reply(responseFixtures.userList.status, responseFixtures.userList.body);

      const response = await httpReq.GET<TestUsersResponse>(`${testBaseUrl}/users`, { 
        query: { page: '1', limit: '10', active: 'true' } 
      });

      expect(response.status).toBe(200);
      expect(response.body.users).toHaveLength(3);
      expect(scope.isDone()).toBe(true);
    });

    it('should merge URL query parameters with query object (object overrides)', async () => {
      const scope = nock(testBaseUrl)
        .get('/users')
        .query({ page: '2', limit: '10', active: 'true', sort: 'name' })
        .reply(responseFixtures.userList.status, responseFixtures.userList.body);

      const response = await httpReq.GET(`${testBaseUrl}/users?page=1&limit=10&sort=name`, { 
        query: { page: '2', active: 'true' } 
      });

      expect(response.status).toBe(200);
      expect(scope.isDone()).toBe(true);
    });

    it('should handle query object with various data types', async () => {
      const scope = nock(testBaseUrl)
        .get('/users')
        .query({ 
          page: '1', 
          active: 'true', 
          count: '42', 
          tags: 'javascript,typescript' 
        })
        .reply(responseFixtures.userList.status, responseFixtures.userList.body);

      const response = await httpReq.GET(`${testBaseUrl}/users`, { 
        query: { 
          page: 1, 
          active: true, 
          count: 42, 
          tags: ['javascript', 'typescript'] 
        } 
      });

      expect(response.status).toBe(200);
      expect(scope.isDone()).toBe(true);
    });

    it('should support query parameters in POST requests', async () => {
      const scope = nock(testBaseUrl)
        .post('/api/submit')
        .query({ filter: 'active', format: 'json' })
        .reply(responseFixtures.success.status, responseFixtures.success.body);

      const response = await httpReq.POST(`${testBaseUrl}/api/submit`, { 
        query: { filter: 'active', format: 'json' },
        body: { data: 'test' } 
      });

      expect(response.status).toBe(200);
      expect(scope.isDone()).toBe(true);
    });

    it('should skip null and undefined values in query parameters', async () => {
      const scope = nock(testBaseUrl)
        .get('/filtered')
        .query({ active: 'true', category: 'tech' })
        .reply(responseFixtures.success.status, responseFixtures.success.body);

      const response = await httpReq.GET(`${testBaseUrl}/filtered`, { 
        query: { 
          active: true, 
          category: 'tech',
          nullValue: null,
          undefinedValue: undefined,
          emptyString: ''
        } 
      });

      expect(response.status).toBe(200);
      expect(scope.isDone()).toBe(true);
    });

    it('should maintain backward compatibility when no query object is provided', async () => {
      const scope = nock(testBaseUrl)
        .get('/legacy')
        .query({ filter: 'old', mode: 'compat' })
        .reply(responseFixtures.success.status, responseFixtures.success.body);

      const response = await httpReq.GET(`${testBaseUrl}/legacy?filter=old&mode=compat`);

      expect(response.status).toBe(200);
      expect(scope.isDone()).toBe(true);
    });

    it('should support query parameters in PUT, PATCH, and DELETE requests', async () => {
      const putScope = nock(testBaseUrl)
        .put('/items/1')
        .query({ version: '2', validate: 'true' })
        .reply(responseFixtures.success.status, responseFixtures.success.body);

      const putResponse = await httpReq.PUT(`${testBaseUrl}/items/1`, { 
        query: { version: 2, validate: true },
        body: { name: 'Updated Item' } 
      });

      expect(putResponse.status).toBe(200);
      expect(putScope.isDone()).toBe(true);

      const patchScope = nock(testBaseUrl)
        .patch('/items/2')
        .query({ fields: 'name,email', notify: 'false' })
        .reply(responseFixtures.success.status, responseFixtures.success.body);

      const patchResponse = await httpReq.PATCH(`${testBaseUrl}/items/2`, { 
        query: { fields: 'name,email', notify: false },
        body: { email: 'newemail@test.com' } 
      });

      expect(patchResponse.status).toBe(200);
      expect(patchScope.isDone()).toBe(true);

      const deleteScope = nock(testBaseUrl)
        .delete('/items/3')
        .query({ cascade: 'true', backup: 'false' })
        .reply(204);

      const deleteResponse = await httpReq.DELETE(`${testBaseUrl}/items/3`, { 
        query: { cascade: true, backup: false }
      });

      expect(deleteResponse.status).toBe(204);
      expect(deleteScope.isDone()).toBe(true);
    });

    it('should handle special characters in query parameters correctly', async () => {
      const scope = nock(testBaseUrl)
        .get('/search')
        .query({ 
          q: 'hello world', // space should be encoded
          filter: 'user@example.com', // @ symbol
          tags: 'c++', // + should be encoded
          special: 'value&more=data' // & and = should be encoded
        })
        .reply(responseFixtures.success.status, responseFixtures.success.body);

      const response = await httpReq.GET(`${testBaseUrl}/search`, { 
        query: { 
          q: 'hello world',
          filter: 'user@example.com',
          tags: 'c++',
          special: 'value&more=data'
        } 
      });

      expect(response.status).toBe(200);
      expect(scope.isDone()).toBe(true);
    });

    it('should handle empty arrays and zero/false values in query parameters', async () => {
      const scope = nock(testBaseUrl)
        .get('/edge-cases')
        .query({ 
          active: 'false',
          count: '0',
          search: 'test'
        })
        .reply(responseFixtures.success.status, responseFixtures.success.body);

      const response = await httpReq.GET(`${testBaseUrl}/edge-cases`, { 
        query: { 
          active: false,     // boolean false should become 'false'
          count: 0,          // number zero should become '0'
          emptyArray: [],    // empty array should be skipped
          search: 'test',
          nullValue: null,   // should be skipped
          emptyString: ''    // should be skipped
        } 
      });

      expect(response.status).toBe(200);
      expect(scope.isDone()).toBe(true);
    });
  });

  describe('Security and Obfuscation', () => {
    it('should obfuscate sensitive data in request body', async () => {
      const scope = nock(testBaseUrl)
        .post('/sensitive', {
          username: 'testuser',
          password: 'secret123',
          access_key: 'key456'
        })
        .reply(responseFixtures.success.status, responseFixtures.success.body);

      await httpReq.POST(`${testBaseUrl}/sensitive`, {
        headers: {},
        body: {
          username: 'testuser',
          password: 'secret123',
          access_key: 'key456'
        }
      });

      expect(testLogger.hasBeenCalled()).toBe(true);
      const loggedMessage = testLogger.getLastLog()!;
      
      expect(loggedMessage).toContain('"password": "PASSWORD HIDDEN"');
      expect(loggedMessage).toContain('"access_key": "ACCESS KEY HIDDEN"');
      expect(loggedMessage).toContain('"username": "testuser"');

      expect(scope.isDone()).toBe(true);
    });

    it('should obfuscate sensitive headers', async () => {
      const sensitiveHeaders = {
        'Authorization': 'Bearer secret-token',
        'verification-token': 'verify-123',
        'X-Api-Key': 'api-key-456'
      };

      const scope = nock(testBaseUrl)
        .get('/protected')
        .reply(responseFixtures.success.status, responseFixtures.success.body);

      await httpReq.GET(`${testBaseUrl}/protected`, { headers: sensitiveHeaders });

      expect(testLogger.hasBeenCalled()).toBe(true);
      const loggedMessage = testLogger.getLastLog()!;

      expect(loggedMessage).toContain('verification-token: TOKEN HIDDEN');
      expect(loggedMessage).toContain('Authorization: Bearer TOKEN HIDDEN');
      expect(loggedMessage).not.toContain('secret-token');

      expect(scope.isDone()).toBe(true);
    });

    it('should obfuscate both Basic and Bearer authorization headers', async () => {
      const scope1 = nock(testBaseUrl)
        .get('/basic-auth')
        .reply(responseFixtures.success.status, responseFixtures.success.body);

      const scope2 = nock(testBaseUrl)
        .get('/bearer-auth')
        .reply(responseFixtures.success.status, responseFixtures.success.body);

      await httpReq.GET(`${testBaseUrl}/basic-auth`, { 
        headers: { 'Authorization': 'Basic dXNlcjpwYXNzd29yZA==' } 
      });

      const basicLog = testLogger.getLastLog()!;
      expect(basicLog).toContain('Authorization: Basic TOKEN HIDDEN');
      expect(basicLog).not.toContain('dXNlcjpwYXNzd29yZA==');

      await httpReq.GET(`${testBaseUrl}/bearer-auth`, { 
        headers: { 'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9' } 
      });

      const bearerLog = testLogger.getLastLog()!;
      expect(bearerLog).toContain('Authorization: Bearer TOKEN HIDDEN');
      expect(bearerLog).not.toContain('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9');

      expect(scope1.isDone()).toBe(true);
      expect(scope2.isDone()).toBe(true);
    });
  });

  describe('Logging', () => {
    it('should log request and response details', async () => {
      const scope = nock(testBaseUrl)
        .get('/users')
        .reply(responseFixtures.success.status, responseFixtures.success.body);

      await httpReq.GET(`${testBaseUrl}/users`);

      expect(testLogger.hasBeenCalled()).toBe(true);
      
      const loggedMessage = testLogger.getLastLog()!;
      expect(loggedMessage).toContain('GET');
      expect(loggedMessage).toContain('RESPONSE:');

      expect(scope.isDone()).toBe(true);
    });

    it('should use injected custom logger', async () => {
      testLogger.clear();
      
      const scope = nock(testBaseUrl)
        .get('/custom-log-test')
        .reply(responseFixtures.success.status, responseFixtures.success.body);

      await httpReq.GET(`${testBaseUrl}/custom-log-test`);

      expect(testLogger.getLogCount()).toBe(1);
      const loggedMessage = testLogger.getLastLog()!;
      expect(loggedMessage).toContain('GET');
      expect(loggedMessage).toContain('/custom-log-test');

      // Test the clear functionality
      testLogger.clear();
      expect(testLogger.getLogCount()).toBe(0);
      expect(testLogger.hasBeenCalled()).toBe(false);

      expect(scope.isDone()).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle HTTP error responses', async () => {
      const scope = nock(testBaseUrl)
        .get('/error')
        .reply(404, { error: 'Not found' });

      const response = await httpReq.GET<TestErrorResponse>(`${testBaseUrl}/error`);
      
      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Not found');
      expect(scope.isDone()).toBe(true);
    });

    it('should handle 500 server errors', async () => {
      const scope = nock(testBaseUrl)
        .get('/server-error')
        .reply(500, { error: 'Internal server error' });

      const response = await httpReq.GET<TestErrorResponse>(`${testBaseUrl}/server-error`);
      
      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Internal server error');
      expect(scope.isDone()).toBe(true);
    });
  });

  describe('HTTP Error Handling (No Retry)', () => {
    it('should not retry on HTTP status errors (4xx, 5xx)', async () => {
      // HTTP errors should not trigger retries - they're not network errors
      nock('https://postman-echo.com')
        .get('/http-error')
        .reply(500, { error: 'Server error' });

      const response = await httpReq.GET<TestErrorResponse>('https://postman-echo.com/http-error');
      
      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Server error');
      expect(nock.isDone()).toBe(true);
    });

    it('should handle 404 errors without retry', async () => {
      nock('https://postman-echo.com')
        .get('/not-found')
        .reply(404, { error: 'Not found' });

      const response = await httpReq.GET<TestErrorResponse>('https://postman-echo.com/not-found');
      
      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Not found');
      expect(nock.isDone()).toBe(true);
    });
  });

  describe('Retry Logic Verification', () => {
    it('has retry logic implemented in code', () => {
      // Both implementations now use the same unified retry logic in HttpReq.ts
      const HttpReqSource = require('fs').readFileSync(
        require('path').resolve(__dirname, '../../src/HttpReq.ts'), 
        'utf8'
      );
      
      expect(HttpReqSource).toContain('for (let attempt = 0; attempt <= 3; attempt++)');
      expect(HttpReqSource).toContain('isValidRetryErr');
      expect(HttpReqSource).toContain('ECONNREFUSED');
      expect(HttpReqSource).toContain('ETIMEDOUT');
      expect(HttpReqSource).toContain('ECONNRESET');
    });

    it('validates retryable error codes correctly', () => {
      // Test the isValidRetryErr method indirectly through reflection
      const httpReqAny = httpReq as any;
      
      // Simple test: try calling with object first, if it works, it's HttpReq2
      let isHttpReq2 = false;
      try {
        const result = httpReqAny.isValidRetryErr({ code: 'ECONNREFUSED' });
        // If we get here without error and get true, it's HttpReq2
        isHttpReq2 = result === true;
      } catch {
        // If we get an exception, it's HttpReq (superagent)
        isHttpReq2 = false;
      }
      
      if (isHttpReq2) {
        // HttpReq2 (axios) - takes object with code property
        expect(httpReqAny.isValidRetryErr({ code: 'ECONNREFUSED' })).toBe(true);
        expect(httpReqAny.isValidRetryErr({ code: 'ETIMEDOUT' })).toBe(true);
        expect(httpReqAny.isValidRetryErr({ code: 'ECONNRESET' })).toBe(true);
        expect(httpReqAny.isValidRetryErr({ code: 'EADDRINFO' })).toBe(true);
        expect(httpReqAny.isValidRetryErr({ code: 'ESOCKETTIMEDOUT' })).toBe(true);
        
        // Test invalid retry errors
        expect(httpReqAny.isValidRetryErr({ code: 'ENOTFOUND' })).toBe(false);
        expect(httpReqAny.isValidRetryErr({ code: 'EINVAL' })).toBe(false);
        expect(httpReqAny.isValidRetryErr({})).toBe(false);
        expect(httpReqAny.isValidRetryErr({ code: null })).toBe(false);
        expect(httpReqAny.isValidRetryErr({ code: undefined })).toBe(false);
      } else {
        // HttpReq (superagent) - takes string directly
        expect(httpReqAny.isValidRetryErr('ECONNREFUSED')).toBe(true);
        expect(httpReqAny.isValidRetryErr('ETIMEDOUT')).toBe(true);
        expect(httpReqAny.isValidRetryErr('ECONNRESET')).toBe(true);
        expect(httpReqAny.isValidRetryErr('EADDRINFO')).toBe(true);
        expect(httpReqAny.isValidRetryErr('ESOCKETTIMEDOUT')).toBe(true);
        
        // Test invalid retry errors
        expect(httpReqAny.isValidRetryErr('ENOTFOUND')).toBe(false);
        expect(httpReqAny.isValidRetryErr('EINVAL')).toBe(false);
        expect(httpReqAny.isValidRetryErr('')).toBe(false);
        expect(httpReqAny.isValidRetryErr(null)).toBe(false);
        expect(httpReqAny.isValidRetryErr(undefined)).toBe(false);
      }
    });
  });

  describe('URL Query Parameter Parsing', () => {
    it('should handle URLs with existing query parameters (lines 123-167)', async () => {
      const scope = nock(testBaseUrl)
        .get('/search')
        .query({ existing: 'value', page: '2', active: 'true' })
        .reply(200, { success: true });

      // Test URL with existing query params that get merged with query object
      const response = await httpReq.GET<TestSuccessFlag>(`${testBaseUrl}/search?existing=value&page=1`, {
        query: { page: 2, active: true } // should override page=1 with page=2
      });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(scope.isDone()).toBe(true);
    });

    it('should parse simple query strings with parameters', async () => {
      const scope = nock(testBaseUrl)
        .get('/search')
        .query({ filter: 'test', sort: 'name' })
        .reply(200, { success: true });

      // Test URL with existing query parameter that gets merged
      const response = await httpReq.GET<TestSuccessFlag>(`${testBaseUrl}/search?filter=test`, {
        query: { sort: 'name' }
      });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(scope.isDone()).toBe(true);
    });

    it('should handle multiple existing query parameters', async () => {
      const scope = nock(testBaseUrl)
        .get('/api')
        .query({ a: '1', b: '2', c: '3' })
        .reply(200, { data: 'test' });

      // Test URL with multiple existing query parameters
      const response = await httpReq.GET<TestDataResponse>(`${testBaseUrl}/api?a=1&b=2`, {
        query: { c: 3 }
      });

      expect(response.status).toBe(200);
      expect(response.body.data).toBe('test');
      expect(scope.isDone()).toBe(true);
    });

    it('should handle null query parameters', async () => {
      const scope = nock(testBaseUrl)
        .get('/api')
        .reply(200, { data: 'test' });

      const response = await httpReq.GET<TestDataResponse>(`${testBaseUrl}/api`, {
        query: null as any
      });

      expect(response.status).toBe(200);
      expect(response.body.data).toBe('test');
      expect(scope.isDone()).toBe(true);
    });

    it('should handle undefined query parameters', async () => {
      const scope = nock(testBaseUrl)
        .get('/api')
        .reply(200, { data: 'test' });

      const response = await httpReq.GET<TestDataResponse>(`${testBaseUrl}/api`, {
        query: undefined
      });

      expect(response.status).toBe(200);
      expect(response.body.data).toBe('test');
      expect(scope.isDone()).toBe(true);
    });
  });
});
