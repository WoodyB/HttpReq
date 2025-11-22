# AI Agent Working Guide for HttpReq Project

## Project Overview

HttpReq is a unified HTTP client library supporting both TypeScript and JavaScript with dual implementations (axios and superagent). The project maintains 404 total tests across both versions.

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
   npm test                   # Run all 404 tests
   ```

   - **Expected outcome:** All tests pass (82+82+14+14+106+106 = 404)

5. **Iterate if Needed**
   - If tests fail, fix the code
   - If new edge cases discovered, add more tests
   - Keep iterating until all tests pass

### Manual Testing (Special Cases Only)

Manual testing is **only needed for special scenarios** like:

- Dependency loading/lazy loading verification
- Package installation scenarios
- Integration with external systems that can't be easily mocked

For routine bug fixes and features, TDD with automated tests is sufficient.

## Project Structure

### Source Files

- `src/HttpReq.ts` - TypeScript implementation (compiled to `bin/src/HttpReq.js`)
- `src/HttpReq.js` - JavaScript implementation (not transpiled)
- `src/demo.ts` - TypeScript demo file
- `src/demo.js` - JavaScript demo file

### Test Files

- `tests/unit-tests/HttpReq.test.ts` - Main test file (tests BOTH TS and JS versions)
- `tests/integration-tests/HttpReq.external-api.test.js` - Integration tests
- `tests/acceptance-tests/HttpReq.acceptance.test.ts` - Acceptance tests
- Test fixtures in `tests/fixtures/`
- Test utilities: `TestLogger.ts`, `TestServer.ts`

### Test Suites Breakdown (404 Total Tests)

- TypeScript unit tests: 82
- JavaScript unit tests: 82
- TypeScript integration tests: 14
- JavaScript integration tests: 14
- TypeScript acceptance tests: 106
- JavaScript acceptance tests: 106

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

### HTTP Client Implementations

Each version has two HTTP client implementations:

1. **AxiosHttpClient** - Using axios library
2. **SuperagentHttpClient** - Using superagent library

Both clients must support identical functionality:

- HTTP methods: GET, POST, PUT, PATCH, DELETE
- Custom headers
- Query parameters (object or string)
- Request body
- Retry logic (network errors only, not HTTP status errors)
- Logging with obfuscation of sensitive data

### Lazy Loading Pattern

- HTTP clients are loaded in constructors (fail-fast at instantiation)
- Users can install only ONE HTTP client (axios OR superagent)
- Module can be imported even if packages are missing
- Errors thrown with clear installation instructions

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

# Run all tests (404 total)
npm test

# Run specific test suites
npm run test:ts              # TypeScript unit tests (82)
npm run test:js              # JavaScript unit tests (82)
npm run test:integration     # TS integration (14)
npm run test:integration:js  # JS integration (14)
npm run test:acceptance      # TS acceptance (106)
npm run test:acceptance:js   # JS acceptance (106)

# Linting
npm run lint
npm run lint:fix

# Demo
npm run demo      # TypeScript demo (compiled)
npm run demo:js   # JavaScript demo
```

## Code Quality Standards

### Always Maintain

- ✅ All 404 tests passing
- ✅ TypeScript compilation succeeds
- ✅ No linting errors
- ✅ Both TS and JS versions in sync
- ✅ JSDoc comments in JavaScript match TypeScript types
- ✅ Sensitive data obfuscation in logs (Authorization headers, passwords, etc.)

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
   - All 404 tests pass
   - Build succeeds
   - No linting errors

5. **Ready to commit**
   - User handles git operations
   - Agent confirms readiness

## Issues Fixed in Recent Sessions

- Issue #13: Obfuscate ALL authorization headers (not just Basic/Bearer)
- Issue #12: Logger default behavior mismatch (JS used no-op, should use console.log)
- Issue #11: Fix lazy loading in TypeScript version (removed top-level imports)
- Issue #10: Implement lazy loading in JavaScript version (bonus fix with #11)
- JSDoc updates: Added missing parameter documentation for GET and DELETE methods

## Key Learnings

- **TDD is the default approach** - Write tests first, then implement
- **Both versions must stay in sync** - TypeScript AND JavaScript
- **Manual testing is rare** - Only for special dependency scenarios
- **Test count should always be 404** - If it changes, investigate why
- **Fail fast is good** - Constructor-time errors are better than runtime errors
- **User makes git decisions** - Agent prepares code, user commits

## Next Session Start

When starting a new session, agent should:

1. Read this file to understand workflow
2. Check current test count: `npm test`
3. Understand the issue/feature request
4. Confirm TDD approach before proceeding
5. Execute: Tests → Code → Verify → Complete
