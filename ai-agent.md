# AI Agent Working Guide for HttpReq Project

## Project Overview

HttpReq is a unified HTTP client library supporting both TypeScript and JavaScript with dual implementations (axios and superagent). This is a **copy-paste library** where users copy source files directly into their projects. Users can choose which HTTP client to use and only need to install that one - they don't need to install both.

## Test-Driven Development (TDD) Workflow

### Standard TDD Flow (Use This for All Issues/Features)

1. **Understand the Issue**
   - Read the issue description carefully
   - Identify what needs to change in BOTH TypeScript and JavaScript versions
   - Confirm understanding before proceeding

2. **Write Failing Tests FIRST**
   - Add tests to `tests/unit-tests/HttpReq.test.ts` for TypeScript
   - Add corresponding tests to JavaScript test files if needed
   - Run tests to verify they fail: `npm run test:ts` and `npm run test:js`
   - **Expected outcome:** New tests fail, existing tests still pass

3. **Implement the Fix**
   - Fix TypeScript version: `src/HttpReq.ts`
   - Fix JavaScript version: `src/HttpReq.js`
   - Keep both versions in sync (same functionality, different syntax)

4. **Run Tests to Verify**

   ```bash
   npm run build              # Compile TypeScript
   npm run lint               # Check for linting errors
   npm test                   # Run all tests
   ```

   - **Expected outcome:** All tests pass

5. **Iterate if Needed**
   - If tests fail, fix the code
   - If new edge cases discovered, add more tests
   - Keep iterating until all tests pass
   - **IMPORTANT:** Pause after each RED-GREEN-REFACTOR cycle for user review before writing next test

### Manual Testing (Special Cases Only)

Manual testing is **only needed for special scenarios** like:

- Dependency loading/lazy loading verification
- Package installation scenarios
- Integration with external systems that can't be easily mocked

For routine bug fixes and features, TDD with automated tests is sufficient.

## Project Structure

### Source Files

- `src/HttpReq.ts` - TypeScript implementation (compiled to `bin/src/HttpReq.js`)
- `src/AxiosAdapter.ts` - Axios adapter for TypeScript
- `src/SuperagentAdapter.ts` - Superagent adapter for TypeScript
- `src/IHttpClient.ts` - Interface for HTTP client adapters
- `src/HttpReq.js` - JavaScript implementation (not transpiled, includes both adapters)
- `src/demo.ts` - TypeScript demo file
- `src/demo.js` - JavaScript demo file

### Test Files

- `tests/unit-tests/HttpReq.test.ts` - Main test file (tests BOTH TS and JS versions)
- `tests/integration-tests/HttpReq.external-api.test.ts` - TypeScript integration tests
- `tests/integration-tests/HttpReq.external-api.test.js` - JavaScript integration tests  
- `tests/acceptance-tests/HttpReq.acceptance.test.ts` - Acceptance tests
- Test fixtures in `tests/fixtures/`
- Test utilities: `TestLogger.ts`, `TestServer.ts`

**Note:** Test suites run across multiple configurations. Test counts will vary as features are added/removed.

### Key Configuration Files

- `package.json` - Scripts and dependencies
- `tsconfig.json` / `tsconfig.build.json` - TypeScript config
- `jest.*.config.ts` - Jest configurations for different test suites
- `eslint.config.js` - Linting rules

## Important Implementation Details

### Dual Implementation Strategy

- **Always update BOTH versions** when fixing issues or adding features
- TypeScript version uses type annotations and interfaces
- JavaScript version uses JSDoc comments for IDE support
- Both versions must pass identical tests

### HTTP Client Architecture (Ports and Adapters Pattern)

**TypeScript Implementation:**

- Uses separate adapter files (`AxiosAdapter.ts`, `SuperagentAdapter.ts`)
- Both implement `IHttpClient` interface
- Adapters are loaded **dynamically via require()** in the constructor
- No static imports of adapters - only `IHttpClient` interface is statically imported
- Users copy only the files they need (HttpReq.ts + IHttpClient.ts + one adapter)
- Zero compile-time dependencies on HTTP client libraries

**JavaScript Implementation:**

- Single file `HttpReq.js` contains both adapter implementations
- Users choose which HTTP client to install and use

Both implementations support:

- HTTP methods: GET, POST, PUT, PATCH, DELETE
- Custom headers
- Query parameters (object or string)
- Request body
- Retry logic (network errors only, not HTTP status errors)
- Logging with obfuscation of sensitive data

### Dynamic Loading Pattern

- HTTP clients are loaded **dynamically via require()** in the constructor
- TypeScript: Adapters loaded when HttpReq instance is created (not at import time)
- JavaScript: Adapters loaded when HttpReq instance is created
- Users choose which HTTP client to use and only need to install that one
- TypeScript compiles successfully even with adapter files or packages missing
- Errors thrown with clear installation instructions if missing at runtime

### Testing Patterns

#### Unit Test Structure

```typescript
describe('Feature Name', () => {
  beforeEach(() => {
    // Setup mocks, servers, etc.
  });

  afterEach(() => {
    // Cleanup
  });

  it('should do something specific', async () => {
    // Arrange
    const httpReq = new HttpReq();
    
    // Act
    const result = await httpReq.GET('http://test.com');
    
    // Assert
    expect(result.status).toBe(200);
  });
});
```

#### Test Both HTTP Clients

Use `describe.each()` to test both axios and superagent:

```typescript
describe.each([
  ['axios', HttpClientType.AXIOS],
  ['superagent', HttpClientType.SUPERAGENT]
])('HttpReq with %s implementation', (clientName, clientType) => {
  it('should work correctly', async () => {
    const httpReq = new HttpReq({ clientType });
    // Test implementation
  });
});
```

## Common Commands

```bash
# Build TypeScript
npm run build

# Run all tests
npm test

# Run specific test suites
npm run test:ts              # TypeScript unit tests
npm run test:js              # JavaScript unit tests
npm run test:integration     # TS integration tests
npm run test:integration:js  # JS integration tests
npm run test:acceptance      # TS acceptance tests

# Linting
npm run lint
npm run lint:fix

# Demo
npm run demo      # TypeScript demo (compiled)
npm run demo:js   # JavaScript demo
```

## Code Quality Standards

### Always Maintain

- ✅ All tests passing
- ✅ TypeScript compilation succeeds
- ✅ No linting errors
- ✅ Both TS and JS versions in sync
- ✅ JSDoc comments in JavaScript match TypeScript types
- ✅ Sensitive data obfuscation in logs (Authorization headers, passwords, etc.)
- ✅ Zero compile-time dependencies on HTTP client libraries (TypeScript only imports IHttpClient)

### JSDoc Requirements for JavaScript

- Document all parameters including nested properties
- Example for GET method:

  ```javascript
  /**
   * @param {string} url - The URL to request
   * @param {Object} [data] - Optional request configuration
   * @param {Object} [data.headers] - Custom headers
   * @param {Object} [data.query] - Query parameters
   * @returns {Promise<Object>} Response object
   */
  ```

### TypeScript Type Safety

- Use interfaces for complex types
- All public methods should have return type annotations
- Use generics for flexible response types: `GET<T>()`

## Typical Session Flow

1. **User presents an issue or feature request**
   - Read and understand the requirement
   - Identify affected files

2. **Propose the approach**
   - Explain what tests will be written
   - Explain what code will be changed
   - Get user confirmation

3. **Execute TDD workflow**
   - Write failing tests
   - Implement fix in both TS and JS
   - Run tests until all pass

4. **Verify completion**
   - All tests pass
   - Build succeeds
   - No linting errors

5. **Ready to commit**
   - User handles git operations
   - Agent confirms readiness

## Issues Fixed in Recent Sessions

- **Ports and Adapters Architecture**: Split TypeScript into separate adapter files with dynamic loading (Issue #11)
- **Zero Compile-Time Dependencies**: Removed all static imports of adapters, only IHttpClient interface imported
- **Copy-Paste Library Philosophy**: Users copy 3 files for TS (HttpReq.ts + IHttpClient.ts + one adapter) or 1 file for JS
- Issue #13: Obfuscate ALL authorization headers (not just Basic/Bearer)
- Issue #12: Logger default behavior mismatch (JS used no-op, should use console.log)
- Issue #11: Fix lazy loading in TypeScript version (removed top-level imports)
- Issue #10: Implement lazy loading in JavaScript version (bonus fix with #11)
- JSDoc updates: Added missing parameter documentation for GET and DELETE methods

## Key Learnings

- **TDD is the default approach** - Write tests first, then implement
- **Pause between cycles** - Stop after each RED-GREEN-REFACTOR cycle for user review before writing the next test
- **Both versions must stay in sync** - TypeScript AND JavaScript
- **Manual testing is rare** - Only for special dependency scenarios (like testing copy-paste library behavior)
- **Dynamic loading via require()** - Prevents compile-time dependencies in TypeScript
- **Ports and Adapters pattern** - Separate adapter files implementing IHttpClient interface
- **Copy-paste library philosophy** - Users copy source files and install only what they need
- **Fail fast is good** - Constructor-time errors are better than runtime errors
- **User makes git decisions** - Agent prepares code, user commits

## Next Session Start

When starting a new session, agent should:

1. Read this file to understand workflow
2. Check current test status: `npm test`
3. Understand the issue/feature request
4. Confirm TDD approach before proceeding
5. Execute: Tests → Code → Verify → Complete
6. Remember: This is a copy-paste library - users choose which HTTP client to install
