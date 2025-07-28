# Http Request Library

A unified HTTP client that supports both **axios** and **superagent** with lazy loading and identical APIs.

## Overview

HttpReq is a HTTP client library designed to make RESTful API testing easier by allowing you to use your favorite JavaScript test runner and assertion library.
It provides:

- **Unified Interface**: Single class supporting both axios and superagent
- **Lazy Loading**: Only loads the HTTP client you actually use
- **Dependency Optimization**: Install only axios OR superagent, not both
- **Single File Distribution**: Copy `HttpReq.ts` directly into your project
- **Identical Behavior**: Both HTTP clients work exactly the same way

## Quick Start

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

## Installation Options

### Option 1: Single File Copy (Recommended)

1. Copy `src/HttpReq.ts` into your project
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
```

## Running Tests & Demo

```bash
# Run all unit tests 
npm run test

# Run all acceptance tests against a real localhost server 
npm run test:acceptance

# Run demo showing all usage patterns
npm run demo

# Compile TypeScript
npx tsc
```

## Key Features

- ✅ **Unified Interface**: Single `HttpReq` class for both HTTP clients
- ✅ **Lazy Loading**: HTTP clients load only when first method is called
- ✅ **HTTP Methods**: GET, POST, PUT, PATCH, DELETE
- ✅ **Custom Headers**: Full header support
- ✅ **Query Parameters**: Advanced query object support with type conversion
- ✅ **URL Parameter Merging**: Query objects override URL parameters
- ✅ **Data Type Handling**: Arrays, primitives, null/undefined filtering
- ✅ **Request/Response Logging**: Detailed logging with timing
- ✅ **Security**: Automatic obfuscation of passwords, access keys, Basic/Bearer auth tokens
- ✅ **Dependency Injection**: Custom logger support
- ✅ **Timeout**: 70-second timeout protection
- ✅ **Retry Logic**: Automatic retry for network errors (4 attempts max)
- ✅ **Error Handling**: Graceful error handling and clear messages
- ✅ **TypeScript**: Full type support with interfaces and enums

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
