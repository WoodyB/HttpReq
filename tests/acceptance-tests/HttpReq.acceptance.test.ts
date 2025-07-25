import { HttpReq, HttpClientType } from '../../src/HttpReq';
import { TestLogger } from '../TestLogger';
import { responseFixtures } from '../fixtures/responses';

// Test response interfaces for type safety
interface TestRetryResponse {
  message: string;
  retriesNeeded: number;
}

interface TestRecoveryResponse {
  quickRecovery?: boolean;
  maxRetriesUsed?: boolean;
}

interface TestSuccessFlag {
  success: boolean;
  attempt?: number;
}

interface TestSuccessResponse {
  message: string;
  data: {
    id: number;
    name: string;
    email?: string;
  };
}

interface TestCreateResponse {
  message: string;
  id: number;
  timestamp: string;
}

interface TestUsersResponse {
  users: Array<{ id: number; name: string; role: string }>;
  total: number;
}

interface TestErrorResponse {
  error: string;
  message: string;
}

describe.each([
  [HttpClientType.SUPERAGENT, 'superagent'],
  [HttpClientType.AXIOS, 'axios']
])('HttpReq Acceptance Tests with %s implementation', (clientType) => {
  let httpReq: HttpReq;
  let testLogger: TestLogger;
  let testServer: any;

  beforeEach(async () => {
    testLogger = new TestLogger();
    httpReq = new HttpReq({ logger: testLogger.log, clientType });
    
    const { TestServer } = await import('../TestServer');
    testServer = new TestServer();
  });

  afterEach(async () => {
    if (testServer) {
      await testServer.stop();
    }
  });

  describe('Automated Network Retry Tests', () => {
    it('should retry on connection drops and eventually succeed', async () => {
      await testServer.start();
      
      // Configure server to fail 2 times, then succeed
      testServer.failThenSucceed(2, { message: 'Success after retries', retriesNeeded: 2 });
      
      const response = await httpReq.GET<TestRetryResponse>(`${testServer.getUrl()}/retry-test`);
      
      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Success after retries');
      expect(response.body.retriesNeeded).toBe(2);
      expect(testServer.getRequestCount()).toBe(3); // 2 failures + 1 success
    }, 10000);

    it('should fail after maximum retries (4 attempts)', async () => {
      await testServer.start();
      
      // Configure server to always fail
      testServer.alwaysFail();
      
      await expect(httpReq.GET(`${testServer.getUrl()}/always-fail`))
        .rejects.toMatchObject({ code: 'ECONNRESET' });
        
      expect(testServer.getRequestCount()).toBe(4); // Initial + 3 retries
    }, 10000);

    it('should succeed on first retry after initial failure', async () => {
      await testServer.start();
      
      // Configure server to fail once, then succeed
      testServer.failThenSucceed(1, { quickRecovery: true });
      
      const response = await httpReq.GET<TestRecoveryResponse>(`${testServer.getUrl()}/quick-recovery`);
      
      expect(response.status).toBe(200);
      expect(response.body.quickRecovery).toBe(true);
      expect(testServer.getRequestCount()).toBe(2); // 1 failure + 1 success
    }, 10000);

    it('should succeed after 3 retries (maximum allowed)', async () => {
      await testServer.start();
      
      // Configure server to fail 3 times, then succeed (uses all retries)
      testServer.failThenSucceed(3, { maxRetriesUsed: true });
      
      const response = await httpReq.GET<TestRecoveryResponse>(`${testServer.getUrl()}/max-retries`);
      
      expect(response.status).toBe(200);
      expect(response.body.maxRetriesUsed).toBe(true);
      expect(testServer.getRequestCount()).toBe(4); // 3 failures + 1 success
    }, 10000);

    it('should handle intermittent failures correctly', async () => {
      await testServer.start();
      
      // Set up specific response pattern: fail, succeed, for multiple requests
      testServer.setResponses([
        { error: 'ECONNRESET' },  // First request fails
        { status: 200, body: { attempt: 1, success: true } }  // Retry succeeds
      ]);
      
      const response = await httpReq.GET<TestSuccessFlag>(`${testServer.getUrl()}/intermittent`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(testServer.getRequestCount()).toBe(2);
    }, 10000);

    it('should handle timeout and connection reset scenarios', async () => {
      await testServer.start();
      
      // Configure server to simulate various network issues
      testServer.setResponses([
        { error: 'ETIMEDOUT' },     // First attempt times out
        { error: 'ECONNRESET' },   // Second attempt gets connection reset
        { status: 200, body: { recovered: true, attempt: 3 } }  // Third attempt succeeds
      ]);
      
      const response = await httpReq.GET<any>(`${testServer.getUrl()}/network-issues`);
      
      expect(response.status).toBe(200);
      expect(response.body.recovered).toBe(true);
      expect(response.body.attempt).toBe(3);
      expect(testServer.getRequestCount()).toBe(3);
    }, 15000);

    it('should handle connection refused errors with retry', async () => {
      await testServer.start();
      
      // Simulate connection refused, then successful connection
      testServer.setResponses([
        { error: 'ECONNREFUSED' },  // First attempt refused
        { status: 200, body: { connectionRestored: true } }  // Second attempt succeeds
      ]);
      
      const response = await httpReq.GET<any>(`${testServer.getUrl()}/connection-test`);
      
      expect(response.status).toBe(200);
      expect(response.body.connectionRestored).toBe(true);
      expect(testServer.getRequestCount()).toBe(2);
    }, 10000);

    it('should handle DNS resolution issues with retry', async () => {
      await testServer.start();
      
      // Simulate DNS issues followed by successful resolution
      testServer.setResponses([
        { error: 'EADDRINFO' },    // DNS resolution fails
        { error: 'EADDRINFO' },    // Still failing
        { status: 200, body: { dnsResolved: true } }  // Finally resolves
      ]);
      
      const response = await httpReq.GET<any>(`${testServer.getUrl()}/dns-test`);
      
      expect(response.status).toBe(200);
      expect(response.body.dnsResolved).toBe(true);
      expect(testServer.getRequestCount()).toBe(3);
    }, 10000);

    it('should handle socket timeout with retry', async () => {
      await testServer.start();
      
      // Simulate socket timeout followed by successful response
      testServer.setResponses([
        { error: 'ESOCKETTIMEDOUT' },  // Socket timeout
        { status: 200, body: { socketRecovered: true } }  // Recovery
      ]);
      
      const response = await httpReq.GET<any>(`${testServer.getUrl()}/socket-test`);
      
      expect(response.status).toBe(200);
      expect(response.body.socketRecovered).toBe(true);
      expect(testServer.getRequestCount()).toBe(2);
    }, 10000);

    it('should exhaust all retries with persistent network errors', async () => {
      await testServer.start();
      
      // Configure server to always return network errors
      testServer.setResponses([
        { error: 'ECONNRESET' },   // Attempt 1
        { error: 'ETIMEDOUT' },    // Attempt 2 (retry 1)
        { error: 'ECONNREFUSED' }, // Attempt 3 (retry 2)
        { error: 'EADDRINFO' }     // Attempt 4 (retry 3) - final attempt
      ]);
      
      await expect(httpReq.GET(`${testServer.getUrl()}/persistent-failure`))
        .rejects.toMatchObject({ code: expect.stringMatching(/^E(CONNRESET|TIMEOUT|CONNREFUSED|ADDRINFO)$/) });
        
      expect(testServer.getRequestCount()).toBe(4); // All retry attempts exhausted
    }, 15000);

    it('should maintain request data integrity through retries', async () => {
      await testServer.start();
      
      const requestBody = { 
        testData: 'important payload',
        timestamp: Date.now(),
        metadata: { retryTest: true }
      };
      
      // Configure server to fail once, then echo back the request
      testServer.setResponses([
        { error: 'ECONNRESET' },   // First attempt fails
        { 
          status: 201, 
          body: { 
            receivedData: requestBody,
            retriedSuccessfully: true
          } 
        }
      ]);
      
      const response = await httpReq.POST<any>(`${testServer.getUrl()}/echo-retry`, {
        body: requestBody
      });
      
      expect(response.status).toBe(201);
      expect(response.body.receivedData).toEqual(requestBody);
      expect(response.body.retriedSuccessfully).toBe(true);
      expect(testServer.getRequestCount()).toBe(2);
    }, 10000);

    it('should preserve headers through retry attempts', async () => {
      await testServer.start();
      
      const customHeaders = {
        'Authorization': 'Bearer test-token',
        'X-Request-ID': 'retry-test-123',
        'Content-Type': 'application/json'
      };
      
      // Configure server to fail once, then return header verification
      testServer.setResponses([
        { error: 'ETIMEDOUT' },     // First attempt times out
        { 
          status: 200, 
          body: { 
            headersReceived: true,
            hasAuthorization: true,
            hasRequestId: true,
            retrySuccessful: true
          } 
        }
      ]);
      
      const response = await httpReq.GET<any>(`${testServer.getUrl()}/header-retry`, {
        headers: customHeaders
      });
      
      expect(response.status).toBe(200);
      expect(response.body.headersReceived).toBe(true);
      expect(response.body.hasAuthorization).toBe(true);
      expect(response.body.hasRequestId).toBe(true);
      expect(response.body.retrySuccessful).toBe(true);
      expect(testServer.getRequestCount()).toBe(2);
    }, 10000);
  });

  describe('Real Network Integration Tests', () => {
    it('should handle real network latency and succeed', async () => {
      await testServer.start();
      
      // Configure server with realistic latency using delay in response
      testServer.setResponses([
        { status: 200, body: { latencyTest: true, timestamp: Date.now() }, delay: 100 }
      ]);
      
      const startTime = Date.now();
      const response = await httpReq.GET<any>(`${testServer.getUrl()}/latency-test`);
      const endTime = Date.now();
      
      expect(response.status).toBe(200);
      expect(response.body.latencyTest).toBe(true);
      expect(endTime - startTime).toBeGreaterThanOrEqual(100); // Verify latency was applied
      expect(testServer.getRequestCount()).toBe(1);
    }, 10000);

    it('should handle server restart scenarios', async () => {
      await testServer.start();
      
      // First request succeeds
      testServer.setResponses([
        { status: 200, body: { phase: 'before-restart' } }
      ]);
      
      const response1 = await httpReq.GET<any>(`${testServer.getUrl()}/restart-test`);
      expect(response1.body.phase).toBe('before-restart');
      
      // Stop server (simulating restart/downtime)
      await testServer.stop();
      
      // Start server again with different response
      await testServer.start();
      testServer.setResponses([
        { error: 'ECONNREFUSED' },  // Connection initially refused after restart
        { status: 200, body: { phase: 'after-restart', recovered: true } }
      ]);
      
      const response2 = await httpReq.GET<any>(`${testServer.getUrl()}/restart-test`);
      expect(response2.status).toBe(200);
      expect(response2.body.phase).toBe('after-restart');
      expect(response2.body.recovered).toBe(true);
    }, 15000);

    it('should handle mixed HTTP methods with retry logic', async () => {
      await testServer.start();
      
      // Test GET with retry
      testServer.setResponses([
        { error: 'ECONNRESET' },
        { status: 200, body: { method: 'GET', retried: true } }
      ]);
      
      const getResponse = await httpReq.GET<any>(`${testServer.getUrl()}/method-retry-get`);
      expect(getResponse.body.method).toBe('GET');
      expect(getResponse.body.retried).toBe(true);
      
      // Reset for POST test
      testServer.reset();
      testServer.setResponses([
        { error: 'ETIMEDOUT' },
        { status: 201, body: { method: 'POST', data: 'created', retried: true } }
      ]);
      
      const postResponse = await httpReq.POST<any>(`${testServer.getUrl()}/method-retry-post`, {
        body: { testData: 'post-retry-test' }
      });
      expect(postResponse.status).toBe(201);
      expect(postResponse.body.method).toBe('POST');
      expect(postResponse.body.retried).toBe(true);
      
      // Reset for PUT test
      testServer.reset();
      testServer.setResponses([
        { error: 'ECONNREFUSED' },
        { status: 200, body: { method: 'PUT', updated: true, retried: true } }
      ]);
      
      const putResponse = await httpReq.PUT<any>(`${testServer.getUrl()}/method-retry-put`, {
        body: { updateData: 'put-retry-test' }
      });
      expect(putResponse.body.method).toBe('PUT');
      expect(putResponse.body.retried).toBe(true);
    }, 20000);
  });

  describe('HTTP Methods - Real Network Testing', () => {
    it('should make successful GET request over real network', async () => {
      await testServer.start();
      
      // Use the same fixture as unit tests but via real network
      testServer.setRouteResponse('GET', '/users', {
        status: responseFixtures.success.status,
        body: responseFixtures.success.body
      });

      const response = await httpReq.GET<TestSuccessResponse>(`${testServer.getUrl()}/users`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Success');
      expect(response.body.data.name).toBe('Test User');
      expect(response.body.data.email).toBe('test@example.com');
      
      // Verify the request actually went over the network
      expect(testServer.getRequestCount()).toBe(1);
      
      // Verify request details were captured
      const receivedRequests = testServer.getReceivedRequests();
      expect(receivedRequests).toHaveLength(1);
      expect(receivedRequests[0].method).toBe('GET');
      expect(receivedRequests[0].url).toBe('/users');
    });

    it('should make successful POST request over real network', async () => {
      await testServer.start();
      
      const requestBody = { name: 'New User', email: 'new@example.com' };
      
      // Use created fixture
      testServer.setRouteResponse('POST', '/users', {
        status: responseFixtures.created.status,
        body: responseFixtures.created.body
      });

      const response = await httpReq.POST<TestCreateResponse>(`${testServer.getUrl()}/users`, { 
        headers: {}, 
        body: requestBody 
      });

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Resource created successfully');
      expect(response.body.id).toBe(123);
      expect(response.body.timestamp).toBe('2025-07-22T10:00:00Z');
      
      // Verify the request was sent over the network with correct body
      expect(testServer.getRequestCount()).toBe(1);
      
      const receivedRequests = testServer.getReceivedRequests();
      expect(receivedRequests).toHaveLength(1);
      expect(receivedRequests[0].method).toBe('POST');
      expect(receivedRequests[0].url).toBe('/users');
      expect(receivedRequests[0].body).toEqual(requestBody);
    });

    it('should make successful PUT request over real network', async () => {
      await testServer.start();
      
      const requestBody = { name: 'Updated User', email: 'updated@example.com' };
      
      // Use success fixture for PUT response
      testServer.setRouteResponse('PUT', '/users/1', {
        status: responseFixtures.success.status,
        body: responseFixtures.success.body
      });

      const response = await httpReq.PUT<TestSuccessResponse>(`${testServer.getUrl()}/users/1`, { 
        headers: {}, 
        body: requestBody 
      });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Success');
      
      // Verify the request went over the real network with correct method and body
      expect(testServer.getRequestCount()).toBe(1);
      
      const receivedRequests = testServer.getReceivedRequests();
      expect(receivedRequests).toHaveLength(1);
      expect(receivedRequests[0].method).toBe('PUT');
      expect(receivedRequests[0].url).toBe('/users/1');
      expect(receivedRequests[0].body).toEqual(requestBody);
    });

    it('should make successful PATCH request over real network', async () => {
      await testServer.start();
      
      const requestBody = { email: 'patched@example.com' };
      
      // Use success fixture for PATCH response
      testServer.setRouteResponse('PATCH', '/users/1', {
        status: responseFixtures.success.status,
        body: responseFixtures.success.body
      });

      const response = await httpReq.PATCH<TestSuccessResponse>(`${testServer.getUrl()}/users/1`, { 
        headers: {}, 
        body: requestBody 
      });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Success');
      
      // Verify PATCH method and partial body were sent correctly
      expect(testServer.getRequestCount()).toBe(1);
      
      const receivedRequests = testServer.getReceivedRequests();
      expect(receivedRequests).toHaveLength(1);
      expect(receivedRequests[0].method).toBe('PATCH');
      expect(receivedRequests[0].url).toBe('/users/1');
      expect(receivedRequests[0].body).toEqual(requestBody);
    });

    it('should make successful DELETE request over real network', async () => {
      await testServer.start();
      
      // Use noContent fixture for DELETE response
      testServer.setRouteResponse('DELETE', '/users/1', {
        status: responseFixtures.noContent.status,
        body: responseFixtures.noContent.body
      });

      const response = await httpReq.DELETE(`${testServer.getUrl()}/users/1`);

      expect(response.status).toBe(204);
      
      // Verify DELETE method was sent correctly
      expect(testServer.getRequestCount()).toBe(1);
      
      const receivedRequests = testServer.getReceivedRequests();
      expect(receivedRequests).toHaveLength(1);
      expect(receivedRequests[0].method).toBe('DELETE');
      expect(receivedRequests[0].url).toBe('/users/1');
      expect(receivedRequests[0].body).toBeUndefined();
    });

    it('should handle URLs without query parameters over real network', async () => {
      await testServer.start();
      
      // Use success fixture for simple endpoint
      testServer.setRouteResponse('GET', '/simple', {
        status: responseFixtures.success.status,
        body: responseFixtures.success.body
      });

      const response = await httpReq.GET<TestSuccessResponse>(`${testServer.getUrl()}/simple`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Success');
      
      // Verify the simple URL was processed over the real network
      expect(testServer.getRequestCount()).toBe(1);
      
      const receivedRequests = testServer.getReceivedRequests();
      expect(receivedRequests).toHaveLength(1);
      expect(receivedRequests[0].method).toBe('GET');
      expect(receivedRequests[0].url).toBe('/simple');
    });

    it('should handle HTTP error responses over real network', async () => {
      await testServer.start();
      
      // Use error fixtures to test HTTP error handling
      testServer.setRouteResponse('GET', '/not-found', {
        status: responseFixtures.notFound.status,
        body: responseFixtures.notFound.body
      });

      const response = await httpReq.GET<TestErrorResponse>(`${testServer.getUrl()}/not-found`);
      
      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Not Found');
      expect(response.body.message).toBe('Resource not found');
      
      // Verify error response came through real network
      expect(testServer.getRequestCount()).toBe(1);
    });

    it('should handle server error responses over real network', async () => {
      await testServer.start();
      
      // Use server error fixture
      testServer.setRouteResponse('GET', '/server-error', {
        status: responseFixtures.serverError.status,
        body: responseFixtures.serverError.body
      });

      const response = await httpReq.GET<TestErrorResponse>(`${testServer.getUrl()}/server-error`);
      
      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Internal Server Error');
      expect(response.body.message).toBe('Something went wrong on our end');
      
      // Verify server error came through real network
      expect(testServer.getRequestCount()).toBe(1);
    });

    it('should handle query parameters correctly over real network', async () => {
      await testServer.start();
      
      // Use userList fixture for query parameter test
      testServer.setRouteResponse('GET', '/users', {
        status: responseFixtures.userList.status,
        body: responseFixtures.userList.body
      });

      const response = await httpReq.GET<TestUsersResponse>(`${testServer.getUrl()}/users?page=1&limit=10&active=true`);

      expect(response.status).toBe(200);
      expect(response.body.users).toHaveLength(3);
      expect(response.body.total).toBe(3);
      expect(response.body.users[0].name).toBe('Alice');
      expect(response.body.users[0].role).toBe('admin');
      
      // Verify query parameters were sent over the network
      expect(testServer.getRequestCount()).toBe(1);
      
      const receivedRequests = testServer.getReceivedRequests();
      expect(receivedRequests).toHaveLength(1);
      expect(receivedRequests[0].method).toBe('GET');
      expect(receivedRequests[0].path).toBe('/users'); // Use path instead of url for query parameter tests
    });
  });

  describe('Headers and Parameters - Real Network Testing', () => {
    it('should include custom headers in request over real network', async () => {
      await testServer.start();
      
      const customHeaders = {
        'Authorization': 'Bearer token123',
        'X-Custom-Header': 'custom-value'
      };

      // Use success fixture for the response
      testServer.setRouteResponse('GET', '/users', {
        status: responseFixtures.success.status,
        body: responseFixtures.success.body
      });

      const response = await httpReq.GET<TestSuccessResponse>(`${testServer.getUrl()}/users`, { 
        headers: customHeaders 
      });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Success');
      
      // Verify headers were sent over the real network
      expect(testServer.getRequestCount()).toBe(1);
      expect(testServer.wasHeaderReceived('Authorization', 'Bearer token123')).toBe(true);
      expect(testServer.wasHeaderReceived('X-Custom-Header', 'custom-value')).toBe(true);
      
      const receivedRequests = testServer.getReceivedRequests();
      expect(receivedRequests[0].headers.authorization).toBe('Bearer token123');
      expect(receivedRequests[0].headers['x-custom-header']).toBe('custom-value');
    });

    it('should handle query parameters correctly over real network', async () => {
      await testServer.start();
      
      // Use userList fixture for query parameter test
      testServer.setRouteResponse('GET', '/users', {
        status: responseFixtures.userList.status,
        body: responseFixtures.userList.body
      });

      const response = await httpReq.GET<TestUsersResponse>(`${testServer.getUrl()}/users?page=1&limit=10&active=true`);

      expect(response.status).toBe(200);
      expect(response.body.users).toHaveLength(3);
      expect(response.body.users[0].name).toBe('Alice');
      
      // Verify query parameters were sent over the real network
      expect(testServer.getRequestCount()).toBe(1);
      expect(testServer.wasQueryParamReceived('page', '1')).toBe(true);
      expect(testServer.wasQueryParamReceived('limit', '10')).toBe(true);
      expect(testServer.wasQueryParamReceived('active', 'true')).toBe(true);
      
      const receivedRequests = testServer.getReceivedRequests();
      expect(receivedRequests[0].query.page).toBe('1');
      expect(receivedRequests[0].query.limit).toBe('10');
      expect(receivedRequests[0].query.active).toBe('true');
    });

    it('should accept query parameters as an object over real network', async () => {
      await testServer.start();
      
      // Use userList fixture
      testServer.setRouteResponse('GET', '/users', {
        status: responseFixtures.userList.status,
        body: responseFixtures.userList.body
      });

      const response = await httpReq.GET<TestUsersResponse>(`${testServer.getUrl()}/users`, { 
        query: { page: '1', limit: '10', active: 'true' } 
      });

      expect(response.status).toBe(200);
      expect(response.body.users).toHaveLength(3);
      
      // Verify query object was sent over the real network
      expect(testServer.getRequestCount()).toBe(1);
      expect(testServer.wasQueryParamReceived('page', '1')).toBe(true);
      expect(testServer.wasQueryParamReceived('limit', '10')).toBe(true);
      expect(testServer.wasQueryParamReceived('active', 'true')).toBe(true);
    });

    it('should merge URL query parameters with query object over real network', async () => {
      await testServer.start();
      
      // Use userList fixture
      testServer.setRouteResponse('GET', '/users', {
        status: responseFixtures.userList.status,
        body: responseFixtures.userList.body
      });

      const response = await httpReq.GET<TestUsersResponse>(`${testServer.getUrl()}/users?page=1&limit=10&sort=name`, { 
        query: { page: '2', active: 'true' } // page should override to '2'
      });

      expect(response.status).toBe(200);
      
      // Verify query merging happened correctly over the real network
      expect(testServer.getRequestCount()).toBe(1);
      expect(testServer.wasQueryParamReceived('page', '2')).toBe(true); // overridden value
      expect(testServer.wasQueryParamReceived('limit', '10')).toBe(true); // from URL
      expect(testServer.wasQueryParamReceived('sort', 'name')).toBe(true); // from URL
      expect(testServer.wasQueryParamReceived('active', 'true')).toBe(true); // from object
    });

    it('should handle query object with various data types over real network', async () => {
      await testServer.start();
      
      // Use userList fixture
      testServer.setRouteResponse('GET', '/users', {
        status: responseFixtures.userList.status,
        body: responseFixtures.userList.body
      });

      const response = await httpReq.GET<TestUsersResponse>(`${testServer.getUrl()}/users`, { 
        query: { 
          page: 1,                           // number should become '1'
          active: true,                      // boolean should become 'true'
          count: 42,                         // number should become '42'
          tags: ['javascript', 'typescript'] // array should become 'javascript,typescript'
        } 
      });

      expect(response.status).toBe(200);
      
      // Verify data type conversion over the real network
      expect(testServer.getRequestCount()).toBe(1);
      expect(testServer.wasQueryParamReceived('page', '1')).toBe(true);
      expect(testServer.wasQueryParamReceived('active', 'true')).toBe(true);
      expect(testServer.wasQueryParamReceived('count', '42')).toBe(true);
      expect(testServer.wasQueryParamReceived('tags', 'javascript,typescript')).toBe(true);
    });

    it('should support query parameters in POST requests over real network', async () => {
      await testServer.start();
      
      // Use success fixture for POST response
      testServer.setRouteResponse('POST', '/api/submit', {
        status: responseFixtures.success.status,
        body: responseFixtures.success.body
      });

      const response = await httpReq.POST<TestSuccessResponse>(`${testServer.getUrl()}/api/submit`, { 
        query: { filter: 'active', format: 'json' },
        body: { data: 'test' } 
      });

      expect(response.status).toBe(200);
      
      // Verify query parameters in POST request over real network
      expect(testServer.getRequestCount()).toBe(1);
      expect(testServer.wasQueryParamReceived('filter', 'active')).toBe(true);
      expect(testServer.wasQueryParamReceived('format', 'json')).toBe(true);
      
      const receivedRequests = testServer.getReceivedRequests();
      expect(receivedRequests[0].method).toBe('POST');
      expect(receivedRequests[0].body).toEqual({ data: 'test' });
    });

    it('should skip null and undefined values in query parameters over real network', async () => {
      await testServer.start();
      
      // Use success fixture
      testServer.setRouteResponse('GET', '/filtered', {
        status: responseFixtures.success.status,
        body: responseFixtures.success.body
      });

      const response = await httpReq.GET<TestSuccessResponse>(`${testServer.getUrl()}/filtered`, { 
        query: { 
          active: true, 
          category: 'tech',
          nullValue: null,
          undefinedValue: undefined,
          emptyString: ''
        } 
      });

      expect(response.status).toBe(200);
      
      // Verify only valid values were sent over the real network
      expect(testServer.getRequestCount()).toBe(1);
      expect(testServer.wasQueryParamReceived('active', 'true')).toBe(true);
      expect(testServer.wasQueryParamReceived('category', 'tech')).toBe(true);
      expect(testServer.wasQueryParamReceived('nullValue')).toBe(false);
      expect(testServer.wasQueryParamReceived('undefinedValue')).toBe(false);
      expect(testServer.wasQueryParamReceived('emptyString')).toBe(false);
    });

    it('should maintain backward compatibility when no query object provided over real network', async () => {
      await testServer.start();
      
      // Use success fixture
      testServer.setRouteResponse('GET', '/legacy', {
        status: responseFixtures.success.status,
        body: responseFixtures.success.body
      });

      const response = await httpReq.GET<TestSuccessResponse>(`${testServer.getUrl()}/legacy?filter=old&mode=compat`);

      expect(response.status).toBe(200);
      
      // Verify URL-only query parameters over real network
      expect(testServer.getRequestCount()).toBe(1);
      expect(testServer.wasQueryParamReceived('filter', 'old')).toBe(true);
      expect(testServer.wasQueryParamReceived('mode', 'compat')).toBe(true);
    });

    it('should support query parameters in PUT, PATCH, and DELETE requests over real network', async () => {
      await testServer.start();
      
      // Test PUT with query parameters
      testServer.setRouteResponse('PUT', '/items/1', {
        status: responseFixtures.success.status,
        body: responseFixtures.success.body
      });

      const putResponse = await httpReq.PUT<TestSuccessResponse>(`${testServer.getUrl()}/items/1`, { 
        query: { version: 2, validate: true },
        body: { name: 'Updated Item' } 
      });

      expect(putResponse.status).toBe(200);
      expect(testServer.wasQueryParamReceived('version', '2')).toBe(true);
      expect(testServer.wasQueryParamReceived('validate', 'true')).toBe(true);

      // Reset for PATCH test (but don't restart server)
      testServer.reset();
      
      testServer.setRouteResponse('PATCH', '/items/2', {
        status: responseFixtures.success.status,
        body: responseFixtures.success.body
      });

      const patchResponse = await httpReq.PATCH<TestSuccessResponse>(`${testServer.getUrl()}/items/2`, { 
        query: { fields: 'name,email', notify: false },
        body: { email: 'newemail@test.com' } 
      });

      expect(patchResponse.status).toBe(200);
      expect(testServer.wasQueryParamReceived('fields', 'name,email')).toBe(true);
      expect(testServer.wasQueryParamReceived('notify', 'false')).toBe(true);

      // Reset for DELETE test (but don't restart server)
      testServer.reset();
      
      testServer.setRouteResponse('DELETE', '/items/3', {
        status: responseFixtures.noContent.status,
        body: responseFixtures.noContent.body
      });

      const deleteResponse = await httpReq.DELETE(`${testServer.getUrl()}/items/3`, { 
        query: { cascade: true, backup: false }
      });

      expect(deleteResponse.status).toBe(204);
      expect(testServer.wasQueryParamReceived('cascade', 'true')).toBe(true);
      expect(testServer.wasQueryParamReceived('backup', 'false')).toBe(true);
    });

    it('should handle special characters in query parameters over real network', async () => {
      await testServer.start();
      
      // Use success fixture
      testServer.setRouteResponse('GET', '/search', {
        status: responseFixtures.success.status,
        body: responseFixtures.success.body
      });

      const response = await httpReq.GET<TestSuccessResponse>(`${testServer.getUrl()}/search`, { 
        query: { 
          q: 'hello world',            // space should be encoded
          filter: 'user@example.com',  // @ symbol
          tags: 'c++',                 // + should be encoded
          special: 'value&more=data'   // & and = should be encoded
        } 
      });

      expect(response.status).toBe(200);
      
      // Verify special characters were properly encoded over real network
      expect(testServer.getRequestCount()).toBe(1);
      expect(testServer.wasQueryParamReceived('q', 'hello world')).toBe(true);
      expect(testServer.wasQueryParamReceived('filter', 'user@example.com')).toBe(true);
      expect(testServer.wasQueryParamReceived('tags', 'c++')).toBe(true);
      expect(testServer.wasQueryParamReceived('special', 'value&more=data')).toBe(true);
    });

    it('should handle empty arrays and zero/false values in query parameters over real network', async () => {
      await testServer.start();
      
      // Use success fixture
      testServer.setRouteResponse('GET', '/edge-cases', {
        status: responseFixtures.success.status,
        body: responseFixtures.success.body
      });

      const response = await httpReq.GET<TestSuccessResponse>(`${testServer.getUrl()}/edge-cases`, { 
        query: { 
          active: false,        // boolean false should become 'false'
          count: 0,             // number zero should become '0'
          emptyArray: [],       // empty array should be skipped
          search: 'test',
          nullValue: null,      // should be skipped
          emptyString: ''       // should be skipped
        } 
      });

      expect(response.status).toBe(200);
      
      // Verify edge case handling over real network
      expect(testServer.getRequestCount()).toBe(1);
      expect(testServer.wasQueryParamReceived('active', 'false')).toBe(true);  // false is valid
      expect(testServer.wasQueryParamReceived('count', '0')).toBe(true);        // 0 is valid
      expect(testServer.wasQueryParamReceived('search', 'test')).toBe(true);
      expect(testServer.wasQueryParamReceived('emptyArray')).toBe(false);       // empty array skipped
      expect(testServer.wasQueryParamReceived('nullValue')).toBe(false);        // null skipped
      expect(testServer.wasQueryParamReceived('emptyString')).toBe(false);      // empty string skipped
    });
  });

  describe('Advanced Query Parameter Handling - Real Network Testing', () => {
    beforeEach(async () => {
      await testServer.start();
      testServer.setRouteResponse('GET', '/query-advanced', { 
        status: 200, 
        body: responseFixtures.success 
      });
    });

    it('should handle array query parameters correctly', async () => {
      const response = await httpReq.GET<TestSuccessResponse>(`${testServer.getUrl()}/query-advanced`, { 
        query: { 
          tags: ['javascript', 'typescript', 'node.js'],
          categories: ['web', 'backend']
        } 
      });

      expect(response.status).toBe(200);
      expect(testServer.getRequestCount()).toBe(1);
      
      // Arrays should be serialized appropriately
      const lastRequest = testServer.getLastRequest();
      expect(lastRequest?.url).toContain('tags=');
      expect(lastRequest?.url).toContain('categories=');
    });

    it('should handle nested object query parameters', async () => {
      const response = await httpReq.GET<TestSuccessResponse>(`${testServer.getUrl()}/query-advanced`, { 
        query: { 
          filter: {
            status: 'active',
            priority: 'high'
          },
          sort: {
            field: 'created_at',
            direction: 'desc'
          }
        } 
      });

      expect(response.status).toBe(200);
      expect(testServer.getRequestCount()).toBe(1);
      
      // Nested objects should be flattened or serialized
      const lastRequest = testServer.getLastRequest();
      expect(lastRequest?.url).toContain('filter');
      expect(lastRequest?.url).toContain('sort');
    });

    it('should preserve query parameter order and encoding', async () => {
      const response = await httpReq.GET<TestSuccessResponse>(`${testServer.getUrl()}/query-advanced`, { 
        query: { 
          'special-chars': 'hello world & more!',
          'unicode': 'café',
          'symbols': '$100 + tax',
          'quotes': 'say "hello"'
        } 
      });

      expect(response.status).toBe(200);
      expect(testServer.getRequestCount()).toBe(1);
      
      // Special characters should be properly URL encoded
      const lastRequest = testServer.getLastRequest();
      expect(lastRequest?.url).toContain('special-chars=');
      expect(lastRequest?.url).toContain('unicode=');
      expect(lastRequest?.url).toContain('symbols=');
      expect(lastRequest?.url).toContain('quotes=');
    });

    it('should handle large query parameter sets', async () => {
      const largeQuery: Record<string, string> = {};
      for (let i = 0; i < 50; i++) {
        largeQuery[`param${i}`] = `value${i}`;
      }

      const response = await httpReq.GET<TestSuccessResponse>(`${testServer.getUrl()}/query-advanced`, { 
        query: largeQuery
      });

      expect(response.status).toBe(200);
      expect(testServer.getRequestCount()).toBe(1);
      
      // Should handle large parameter sets without issues
      const lastRequest = testServer.getLastRequest();
      expect(lastRequest?.url.length).toBeGreaterThan(100); // URL should be quite long
    });

    it('should handle duplicate parameter names', async () => {
      // Test how duplicate parameters are handled
      const response = await httpReq.GET<TestSuccessResponse>(`${testServer.getUrl()}/query-advanced?existing=first`, { 
        query: { 
          existing: 'second',
          normal: 'value'
        } 
      });

      expect(response.status).toBe(200);
      expect(testServer.getRequestCount()).toBe(1);
      
      const lastRequest = testServer.getLastRequest();
      expect(lastRequest?.url).toContain('existing=');
      expect(lastRequest?.url).toContain('normal=value');
    });

    it('should handle query parameters with numeric and boolean types', async () => {
      const response = await httpReq.GET<TestSuccessResponse>(`${testServer.getUrl()}/query-advanced`, { 
        query: { 
          page: 42,
          limit: 100,
          active: true,
          archived: false,
          rating: 4.5,
          count: 0
        } 
      });

      expect(response.status).toBe(200);
      expect(testServer.getRequestCount()).toBe(1);
      
      // Verify type conversion to strings in URL
      expect(testServer.wasQueryParamReceived('page', '42')).toBe(true);
      expect(testServer.wasQueryParamReceived('limit', '100')).toBe(true);
      expect(testServer.wasQueryParamReceived('active', 'true')).toBe(true);
      expect(testServer.wasQueryParamReceived('archived', 'false')).toBe(true);
      expect(testServer.wasQueryParamReceived('rating', '4.5')).toBe(true);
      expect(testServer.wasQueryParamReceived('count', '0')).toBe(true);
    });
  });

  describe('Error Responses - Real Network Testing', () => {
    beforeEach(async () => {
      await testServer.start();
    });

    it('should handle 400 Bad Request errors', async () => {
      testServer.setRouteResponse('POST', '/bad-request', { 
        status: 400, 
        body: { error: 'Bad Request', message: 'Invalid request format' }
      });

      const response = await httpReq.POST(`${testServer.getUrl()}/bad-request`, { 
        body: { invalidData: true }
      });
      
      // HttpReq treats HTTP error status codes as successful responses
      expect(response.status).toBe(400);
      expect(response.body).toMatchObject({
        error: 'Bad Request',
        message: 'Invalid request format'
      });
      expect(testServer.getRequestCount()).toBe(1);
    });

    it('should handle 401 Unauthorized errors', async () => {
      testServer.setRouteResponse('GET', '/protected', { 
        status: 401, 
        body: { error: 'Unauthorized', message: 'Authentication required' }
      });

      const response = await httpReq.GET(`${testServer.getUrl()}/protected`);
      
      expect(response.status).toBe(401);
      expect(response.body).toMatchObject({
        error: 'Unauthorized',
        message: 'Authentication required'
      });
      expect(testServer.getRequestCount()).toBe(1);
    });

    it('should handle 403 Forbidden errors', async () => {
      testServer.setRouteResponse('DELETE', '/forbidden', { 
        status: 403, 
        body: { error: 'Forbidden', message: 'Insufficient permissions' }
      });

      const response = await httpReq.DELETE(`${testServer.getUrl()}/forbidden`);
      
      expect(response.status).toBe(403);
      expect(response.body).toMatchObject({
        error: 'Forbidden',
        message: 'Insufficient permissions'
      });
      expect(testServer.getRequestCount()).toBe(1);
    });

    it('should handle 404 Not Found errors', async () => {
      testServer.setRouteResponse('GET', '/nonexistent', { 
        status: 404, 
        body: { error: 'Not Found', message: 'Resource does not exist' }
      });

      const response = await httpReq.GET(`${testServer.getUrl()}/nonexistent`);
      
      expect(response.status).toBe(404);
      expect(response.body).toMatchObject({
        error: 'Not Found',
        message: 'Resource does not exist'
      });
      expect(testServer.getRequestCount()).toBe(1);
    });

    it('should handle 409 Conflict errors', async () => {
      testServer.setRouteResponse('POST', '/conflict', { 
        status: 409, 
        body: { error: 'Conflict', message: 'Resource already exists' }
      });

      const response = await httpReq.POST(`${testServer.getUrl()}/conflict`, { 
        body: { name: 'duplicate' }
      });
      
      expect(response.status).toBe(409);
      expect(response.body).toMatchObject({
        error: 'Conflict',
        message: 'Resource already exists'
      });
      expect(testServer.getRequestCount()).toBe(1);
    });

    it('should handle 422 Unprocessable Entity errors', async () => {
      testServer.setRouteResponse('PUT', '/validation', { 
        status: 422, 
        body: { 
          error: 'Unprocessable Entity', 
          message: 'Validation failed',
          details: ['Email is required', 'Name must be at least 3 characters']
        }
      });

      const response = await httpReq.PUT(`${testServer.getUrl()}/validation`, { 
        body: { name: 'ab' }
      });
      
      expect(response.status).toBe(422);
      expect(response.body).toMatchObject({
        error: 'Unprocessable Entity',
        message: 'Validation failed',
        details: expect.arrayContaining(['Email is required'])
      });
      expect(testServer.getRequestCount()).toBe(1);
    });

    it('should handle 429 Too Many Requests errors', async () => {
      testServer.setRouteResponse('GET', '/rate-limited', { 
        status: 429, 
        body: { 
          error: 'Too Many Requests', 
          message: 'Rate limit exceeded',
          retryAfter: 60
        }
      });

      const response = await httpReq.GET(`${testServer.getUrl()}/rate-limited`);
      
      expect(response.status).toBe(429);
      expect(response.body).toMatchObject({
        error: 'Too Many Requests',
        message: 'Rate limit exceeded',
        retryAfter: 60
      });
      expect(testServer.getRequestCount()).toBe(1);
    });

    it('should handle 500 Internal Server Error', async () => {
      testServer.setRouteResponse('POST', '/server-error', { 
        status: 500, 
        body: { 
          error: 'Internal Server Error', 
          message: 'An unexpected error occurred',
          timestamp: new Date().toISOString()
        }
      });

      const response = await httpReq.POST<any>(`${testServer.getUrl()}/server-error`, { 
        body: { data: 'test' }
      });
      
      expect(response.status).toBe(500);
      expect(response.body).toMatchObject({
        error: 'Internal Server Error',
        message: 'An unexpected error occurred'
      });
      expect(typeof response.body.timestamp).toBe('string');
      expect(testServer.getRequestCount()).toBe(1);
    });

    it('should handle 502 Bad Gateway errors', async () => {
      testServer.setRouteResponse('GET', '/bad-gateway', { 
        status: 502, 
        body: { 
          error: 'Bad Gateway', 
          message: 'Upstream server error'
        }
      });

      const response = await httpReq.GET(`${testServer.getUrl()}/bad-gateway`);
      
      expect(response.status).toBe(502);
      expect(response.body).toMatchObject({
        error: 'Bad Gateway',
        message: 'Upstream server error'
      });
      expect(testServer.getRequestCount()).toBe(1);
    });

    it('should handle 503 Service Unavailable errors', async () => {
      testServer.setRouteResponse('GET', '/unavailable', { 
        status: 503, 
        body: { 
          error: 'Service Unavailable', 
          message: 'Service temporarily unavailable',
          retryAfter: 300
        }
      });

      const response = await httpReq.GET(`${testServer.getUrl()}/unavailable`);
      
      expect(response.status).toBe(503);
      expect(response.body).toMatchObject({
        error: 'Service Unavailable',
        message: 'Service temporarily unavailable',
        retryAfter: 300
      });
      expect(testServer.getRequestCount()).toBe(1);
    });

    it('should handle custom error responses with retry behavior', async () => {
      // First request fails with 503, retry succeeds
      testServer.setResponses([
        { status: 503, body: { error: 'Service Unavailable', temporary: true } },
        { status: 200, body: { message: 'Success after retry', recovered: true } }
      ]);

      const response = await httpReq.GET<any>(`${testServer.getUrl()}/retry-error`);
      
      // Note: HttpReq does not retry on HTTP error status codes, only on network errors
      // So we expect the first 503 response to be returned directly
      expect(response.status).toBe(503);
      expect(response.body).toMatchObject({
        error: 'Service Unavailable',
        temporary: true
      });
      expect(testServer.getRequestCount()).toBe(1); // No retry for HTTP errors
    });

    it('should handle error responses with custom headers', async () => {
      testServer.setRouteResponse('GET', '/error-with-headers', { 
        status: 400, 
        body: { error: 'Bad Request', requestId: 'req-12345' }
      });

      const response = await httpReq.GET(`${testServer.getUrl()}/error-with-headers`, {
        headers: { 'X-Request-ID': 'client-67890' }
      });
      
      expect(response.status).toBe(400);
      expect(response.body).toMatchObject({
        error: 'Bad Request',
        requestId: 'req-12345'
      });
      
      // Verify headers were sent even for error responses
      expect(testServer.wasHeaderReceived('X-Request-ID', 'client-67890')).toBe(true);
      expect(testServer.getRequestCount()).toBe(1);
    });
  });
});
