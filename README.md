# Http Request Library

A unified HTTP client that supports both **axios** and **superagent** with lazy loading and identical APIs.

Available in both **TypeScript** and **JavaScript** (ES6+) implementations with full feature parity.

## Overview

HttpReq is a HTTP client library designed to make RESTful API testing easier by allowing you to use your favorite JavaScript test runner and assertion library.
It provides:

- **Dual Implementation**: Available as TypeScript (`src/HttpReq.ts`) or JavaScript (`src/HttpReq.js`)
- **Unified Interface**: Single class supporting both axios and superagent
- **Lazy Loading**: Only loads the HTTP client you actually use
- **Dependency Optimization**: Install only axios OR superagent, not both
- **Single File Distribution**: Copy either `HttpReq.ts` or `HttpReq.js` directly into your project
- **Identical Behavior**: Both HTTP clients work exactly the same way
- **Feature Parity**: TypeScript and JavaScript versions have identical functionality

## Quick Start

### TypeScript

```typescript
import { HttpReq, HttpClientType } from './HttpReq';

// Using defaults (axios with console logging)
const client = new HttpReq();

// Explicitly choosing HTTP client
const axiosClient = new HttpReq({ clientType: HttpClientType.AXIOS });
const superagentClient = new HttpReq({ clientType: HttpClientType.SUPERAGENT });

// Custom logger
const customClient = new HttpReq({ 
  logger: (msg) => console.log(`[CUSTOM] ${msg}`) 
});

// Make requests
const response = await client.GET('https://api.example.com/data');
```

### JavaScript

```javascript
const { HttpReq, HttpClientType } = require('./HttpReq');

// Using defaults (axios with console logging)
const client = new HttpReq();

// Explicitly choosing HTTP client
const axiosClient = new HttpReq({ clientType: HttpClientType.AXIOS });
const superagentClient = new HttpReq({ clientType: HttpClientType.SUPERAGENT });

// Custom logger
const customClient = new HttpReq({ 
  logger: (msg) => console.log(`[CUSTOM] ${msg}`) 
});

// Make requests
const response = await client.GET('https://api.example.com/data');
```

## Installation Options

### Option 1: Single File Copy (Recommended)

**For TypeScript Projects:**

1. Copy `src/HttpReq.ts` into your project
2. Install only the HTTP client you want:

   ```bash
   npm install axios    # For axios support
   # OR
   npm install superagent  # For superagent support
   ```

**For JavaScript Projects:**

1. Copy `src/HttpReq.js` into your project
2. Install only the HTTP client you want:

   ```bash
   npm install axios    # For axios support
   # OR
   npm install superagent  # For superagent support
   ```

### Option 2: Full Project

```bash
git clone <this-repo>
npm install  # Installs both axios and superagent for development
npm run build  # Compiles TypeScript to bin/ directory
```

## Running Tests & Demo

### Complete Test Suite (402 tests)

```bash
# Run ALL tests (unit, integration, acceptance for both TS and JS)
npm test  # Runs all 402 tests
```

### Individual Test Suites

**Unit Tests:**

```bash
npm run test:ts           # 81 TypeScript unit tests
npm run test:js           # 81 JavaScript unit tests
```

**Integration Tests (External API):**

```bash
npm run test:integration     # 14 TypeScript integration tests
npm run test:integration:js  # 14 JavaScript integration tests
```

**Acceptance Tests (Local Server):**

```bash
npm run test:acceptance      # 106 TypeScript acceptance tests
npm run test:acceptance:js   # 106 JavaScript acceptance tests
```

### Test Coverage Summary

| Test Type | TypeScript | JavaScript | Total |
|-----------|-----------|-----------|-------|
| Unit Tests | 81 | 81 | 162 |
| Integration Tests | 14 | 14 | 28 |
| Acceptance Tests | 106 | 106 | 212 |
| **Total** | **201** | **201** | **402** |

### Demos

```bash
npm run demo      # Run compiled TypeScript demo (from bin/)
npm run demo:js   # Run JavaScript demo (from src/)
```

### Build

```bash
npm run build     # Compile TypeScript to bin/ directory
```

## Key Features

- ✅ **Dual Implementation**: TypeScript and JavaScript versions with identical functionality
- ✅ **Unified Interface**: Single `HttpReq` class for both HTTP clients
- ✅ **Lazy Loading**: HTTP clients load only when first method is called
- ✅ **HTTP Methods**: GET, POST, PUT, PATCH, DELETE
- ✅ **Custom Headers**: Full header support
- ✅ **Query Parameters**: Advanced query object support with type conversion
- ✅ **URL Parameter Merging**: Query objects override URL parameters
- ✅ **Data Type Handling**: Arrays, primitives, null/undefined filtering
- ✅ **Request/Response Logging**: Detailed logging with timing
- ✅ **Security**: Automatic obfuscation of passwords, access keys, ALL Authorization headers (regardless of scheme)
- ✅ **Dependency Injection**: Custom logger support
- ✅ **Timeout**: 70-second timeout protection
- ✅ **Retry Logic**: Automatic retry for network errors (4 attempts max)
- ✅ **Error Handling**: Graceful error handling and clear messages
- ✅ **TypeScript**: Full type support with interfaces and enums
- ✅ **Comprehensive Testing**: 402 tests covering both implementations (unit, integration, acceptance)

## API Reference

### Constructor Options

```typescript
interface HttpReqOptions {
  logger?: (message: string) => void;    // Custom logger function
  clientType?: HttpClientType;           // AXIOS or SUPERAGENT
}

enum HttpClientType {
  AXIOS = 'axios',
  SUPERAGENT = 'superagent'
}
```

### HTTP Methods

All methods return a Promise with the response object:

```typescript
// GET request
const response = await client.GET('https://api.example.com/users');

// With headers
const responseWithHeaders = await client.GET('https://api.example.com/users', {
  headers: { 'Authorization': 'Bearer token' }
});

// With query parameters (object-based)
const filteredResponse = await client.GET('https://api.example.com/users', {
  query: { 
    page: 1, 
    active: true, 
    tags: ['javascript', 'typescript'] // Arrays become comma-separated
  }
});
// Results in: /users?page=1&active=true&tags=javascript,typescript

// Query objects override URL parameters
const overrideResponse = await client.GET('https://api.example.com/users?page=1', {
  query: { page: 2, active: true } // page=2 overrides page=1 from URL
});

// POST request  
const response = await client.POST('https://api.example.com/users', {
  headers: { 'Content-Type': 'application/json' },
  body: { name: 'John', email: 'john@example.com' },
  query: { notify: true } // Query params work with all HTTP methods
});

// PUT, PATCH, DELETE work the same way
await client.PUT(url, { headers, body });
await client.PATCH(url, { headers, body });
await client.DELETE(url, { headers, body });
```

## Error Handling

When a required HTTP client package is missing, you'll get clear error messages:

```text
axios is required but not found. Please install it with: npm install axios
Original error: Cannot find module 'axios'
```

## Lazy Loading Benefits

- **Reduced Bundle Size**: Only load what you use
- **Faster Startup**: No upfront loading of unused HTTP clients
- **Flexible Deployment**: Copy single file without dependency bloat
- **Clear Errors**: Immediate feedback when dependencies are missing

### Advanced Query Parameters

The library supports complex query parameter handling with automatic type conversion:

```typescript
// Supports complex data types with automatic conversion
await client.GET('/api/search', {
  query: {
    active: true,         // → "true"
    page: 1,              // → "1" 
    tags: ['js', 'ts'],   // → "js,ts"
    empty: [],            // → skipped
    nullValue: null,      // → skipped
    search: 'hello world' // → automatically URL encoded
  }
});
```

## License

MIT License

## History

I've been using different versions of this library for years. I always customize to fit the environment that it's in for a particular company. It is usually not standalone but part of a larger test utility library. While isolating for a week due to COVID I had a colleague reach out to me about REST API testing. She was working for a company that really needed to automate their API testing that they had brought back in house after ending a contract with a third party to develop and maintain it. As the technical lead for the project it was her problem now. Having worked together she remembered the good API testing we had at a former company and wanted to know how to go about it. I told her I was bored out of my mind and had just purchased a new MacBook Air and needed to make sure I had it all configured to be my new development machine anyway so I would be happy to make something she could use and expand on. That original code is listed below.


I have been experimenting a lot with AI assisted development lately especially now that AI agents are available in GitHub and VS Code. I'm not interested in so-called "vibe coding" when it comes to anything other than just playing around. However, I see AI assisted development as a huge innovation. The trick is taming the AI so that it will do what a good software engineer does and not go wild changing files all over the place. I thought of this code to use in an experiment to see if I can get the agent, "Claude Sonnet in CoPilot," to behave and develop the way I would while expanding this code into something more useful. It took some work and it did go astray a few times but I like the results. I actually had the agent doing TDD which is more than I can usually get my colleagues to do :-).

## Original Code the agent used as a base

```typescript
import * as request from 'superagent';

const HTTP_REQUEST = {
  TIMEOUT: 70000,
};

export class HttpReq {
  public GET(url: string, data?: { headers: object }) {
    return this.send(request.get, url, data);
  }

  public POST(url: string, data?: { headers: object, body: object }) {
    return this.send(request.post, url, data);
  }

  public DELETE(url: string, data?: { headers: object, body: object }) {
    return this.send(request.delete, url, data);
  }

  public PUT(url: string, data?: { headers: object, body: object }) {
    return this.send(request.put, url, data);
  }

  public PATCH(url: string, data?: { headers: object, body: object }) {
    return this.send(request.patch, url, data);
  }

  private send(method: any, url: string, data: any): Promise<any> {
    let headers: object = {};
    let body: object;
    let finalHeaders: any = {};

    if (data) {
      headers = data.headers;
      finalHeaders = headers;
      body = data.body;
    }

    const [uri, queryStr] = url.split('?');
    let query: any = {};

    if (queryStr) {
      query = this.processKeyPairs(queryStr);
    }

    if (method === request.get) {
      finalHeaders = { Accept: 'application/json', ...headers };
    }

    const startDate = new Date();
    return new Promise((resolve, reject) => {
      method(uri)
        .timeout(HTTP_REQUEST.TIMEOUT)
        .set(finalHeaders)
        .send(body)
        .query(query)
        .retry(3, (err: string) => this.isValidRetryErr(err))
        .ok((res: any) => res.status < 600)
        .end((error: any, res: any) => {
          if (error) {
            reject(error);
            return;
          }
          // Here's where you would add your logging. For example whatever you are using to log to a file.
          // I'll just put in a console.log so you can see it work
          // This formatted output obfuscates data like passwords and auth tokens
          // You may need to add more checks in the obfuscate method below depending on your api
          const formattedRsp = this.logRequest(this.formatRsp(res), startDate);  
          console.log(formattedRsp);
          resolve(res);
        });
    });
  }

  private obfuscate(args: any) {
    const fixedArgs: any = args;
    if (args.access_key) {
      fixedArgs.access_key = 'ACCESS KEY HIDDEN';
    }

    if (args.password) {
      fixedArgs.password = 'PASSWORD HIDDEN';
    }

    return fixedArgs;
  }

  private logRequest(reqObj: any, startDate: any): string {
    const endDate: any = new Date();
    const msec: number = Math.abs(endDate - startDate);

    const output = [
      `::: ${startDate.toISOString()} :::`,
      `${reqObj.req}`,
      `${reqObj.rsp}`,
      `::: Response Time: ${msec}ms :::`,
    ].join('\n');
    return (`${output}\n`);
  }

  private formatRsp(res: any) {
    let data: any;

    const output: any = {};
    const regexBracesQuotesCommas = /({\n)|(")|(,)|(\n})/g;
    const regexBasicAuthToken = /Authorization:\s*Basic.*/gi;
    const regexVerificationToken = /verification-token:\s.*/gi;

    let headers: string = JSON.stringify(res.request.header, null, 4);
    headers = headers.replace(regexBracesQuotesCommas, '');
    headers = headers.replace(
      regexBasicAuthToken,
      'Authorization: Basic TOKEN HIDDEN',
    );
    headers = headers.replace(
      regexVerificationToken,
      'verification-token: TOKEN HIDDEN',
    );

    output.req = [
      `${res.request.method} ${res.request.url}\n`,
      headers,
    ].join('');

    // eslint-disable-next-line no-underscore-dangle
    if (res.request._data) {
      data = `${JSON.stringify(
        // eslint-disable-next-line no-underscore-dangle
        this.obfuscate(res.request._data),
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

  private isValidRetryErr(err: string) {
    const validRetryErrs = [
      'ECONNREFUSED',
      'ECONNRESET',
      'ETIMEDOUT',
      'EADDRINFO',
      'ESOCKETTIMEDOUT',
    ];
    if (validRetryErrs.includes(err)) {
      return true;
    }
    return false;
  }

  private processKeyPairs(str: string, options?: { delimiter: string, assignmentOp: string }): any {
    const delimiter: string = options ? options.delimiter : '&';
    const assignmentOp: string = options ? options.assignmentOp : '=';
    const pairs: string[] = str.split(delimiter);
    const resultMap = new Map();

    pairs.forEach((pairStr: string) => {
      const pairAr: string[] = pairStr.split(assignmentOp);
      resultMap.set(pairAr[0], pairAr[1]);
    });

    return Object.fromEntries(resultMap);
  }
}
```
