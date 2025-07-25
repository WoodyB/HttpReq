import * as http from 'http';
import { AddressInfo } from 'net';

interface TestResponse {
  status?: number;
  body?: unknown;
  error?: string;
  delay?: number;
}

export class TestServer {
  private server: http.Server;
  private port: number = 0;
  private requestCount: number = 0;
  private responses: TestResponse[] = [];

  constructor() {
    this.server = http.createServer(this.handleRequest.bind(this));
  }

  private handleRequest(req: http.IncomingMessage, res: http.ServerResponse) {
    const requestIndex = this.requestCount++;
    const response = this.responses[requestIndex] || { status: 200, body: { success: true } };

    if (response.error) {
      req.socket.destroy();
      return;
    }

    const sendResponse = () => {
      const status = response.status ?? 200;
      const body: unknown = response.body ?? { success: true, requestNumber: requestIndex + 1 };
      
      res.writeHead(status, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(body));
    };

    if (response.delay) {
      setTimeout(sendResponse, response.delay);
    } else {
      sendResponse();
    }
  }

  start(): Promise<number> {
    return new Promise((resolve, reject) => {
      this.server.listen(0, 'localhost', (err?: Error) => {
        if (err) {
          reject(err);
          return;
        }
        
        this.port = (this.server.address() as AddressInfo).port;
        resolve(this.port);
      });
    });
  }

  stop(): Promise<void> {
    return new Promise((resolve) => {
      this.server.close(() => {
        resolve();
      });
    });
  }

  getUrl(): string {
    return `http://localhost:${this.port}`;
  }

  getRequestCount(): number {
    return this.requestCount;
  }

  reset(): void {
    this.requestCount = 0;
    this.responses = [];
  }

  // Configure how the server should respond to requests
  setResponses(responses: TestResponse[]): void {
    this.responses = responses;
  }

  // Helper methods for common test scenarios
  failThenSucceed(failures: number, successBody?: unknown): void {
    const responses: TestResponse[] = [];
    
    // Add failure responses (connection drops)
    for (let i = 0; i < failures; i++) {
      responses.push({ error: 'ECONNRESET' });
    }
    
    // Add success response
    responses.push({ 
      status: 200, 
      body: successBody ?? { success: true, retriesNeeded: failures }
    });
    
    this.setResponses(responses);
  }

  alwaysFail(): void {
    // Set up to always drop connections for 10 requests
    const responses: TestResponse[] = [];
    for (let i = 0; i < 10; i++) {
      responses.push({ error: 'ECONNRESET' }); // Use ECONNRESET for consistency
    }
    this.setResponses(responses);
  }

  slowThenFast(slowCount: number, delay: number = 80000): void {
    const responses: TestResponse[] = [];
    
    // Add slow responses that will timeout
    for (let i = 0; i < slowCount; i++) {
      responses.push({ delay });
    }
    
    // Add fast success response
    responses.push({ status: 200, body: { recovered: true } });
    
    this.setResponses(responses);
  }
}
