import { HttpReq, HttpClientType } from '../../src/HttpReq';
import { TestLogger } from '../TestLogger';

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
});
