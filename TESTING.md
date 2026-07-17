# Testing Guide

Complete testing setup and instructions for the E-Commerce ML Platform.

## Backend Testing (Jest + Supertest)

### Running Tests

```bash
cd node-backend
npm install  # Installs jest and supertest

# Run all tests
npm test

# Run specific test file
npm test __tests__/auth.test.js

# Run with coverage report
npm test -- --coverage

# Run in watch mode (for development)
npm test -- --watch

# Clear Jest cache
npm test -- --clearCache
```

### Test Structure

```
node-backend/
├── __tests__/
│   ├── auth.test.js          # Authentication endpoints
│   └── validation.test.js    # Input validation
├── jest.config.js            # Jest configuration
└── server.js                 # Exported for testing
```

### Example Backend Tests

**Auth Tests** (`__tests__/auth.test.js`):
- ✅ Register with valid credentials
- ✅ Reject invalid email format
- ✅ Reject weak passwords
- ✅ Login with correct credentials
- ✅ Reject wrong password
- ✅ Protected routes without token

### Writing Backend Tests

```javascript
// __tests__/example.test.js
const request = require("supertest")
const app = require("../server")

describe("API Endpoint", () => {
    it("should return success", async () => {
        const res = await request(app)
            .get("/products")
        
        expect(res.statusCode).toBe(200)
        expect(res.body).toHaveProperty("products")
    })

    it("should handle errors", async () => {
        const res = await request(app)
            .post("/auth/register")
            .send({ email: "invalid" })  // missing fields
        
        expect(res.statusCode).toBe(400)
        expect(res.body).toHaveProperty("error")
    })
})
```

## Frontend Testing (React Testing Library)

### Running Tests

```bash
cd react-frontend
npm install  # Installs React Testing Library

# Run all tests
npm test

# Run specific test
npm test AuthContext.test.js

# Run with coverage
npm test -- --coverage

# Run in watch mode
npm test -- --watch

# Clear Jest cache
npm test -- --clearCache
```

### Test Structure

```
react-frontend/src/
├── setupTests.js                        # Global test setup
├── context/
│   └── __tests__/
│       └── AuthContext.test.js         # Context tests
├── services/
│   └── __tests__/
│       └── api.test.js                 # API service tests
└── components/
    └── __tests__/
        ├── ErrorBoundary.test.js       # Error boundary tests
        └── Dashboard.test.js            # Component tests
```

### Example Frontend Tests

**AuthContext Tests**:
- ✅ Provide initial auth state
- ✅ Login user
- ✅ Logout user
- ✅ Token persistence

**ErrorBoundary Tests**:
- ✅ Render children without error
- ✅ Display error message on crash
- ✅ Show recovery button

### Writing Frontend Tests

```javascript
// src/components/__tests__/Example.test.js
import { render, screen, fireEvent } from '@testing-library/react'
import MyComponent from '../MyComponent'

describe('MyComponent', () => {
    it('should render correctly', () => {
        render(<MyComponent />)
        expect(screen.getByText('Hello')).toBeInTheDocument()
    })

    it('should handle click', () => {
        const handleClick = jest.fn()
        render(<MyComponent onClick={handleClick} />)
        
        fireEvent.click(screen.getByRole('button'))
        expect(handleClick).toHaveBeenCalled()
    })
})
```

## Common Testing Patterns

### Mocking API Calls

```javascript
// Mock axios in tests
jest.mock('axios')
import axios from 'axios'

it('should fetch data', async () => {
    axios.get.mockResolvedValue({ data: { products: [] } })
    
    const result = await fetchProducts()
    expect(result).toEqual({ products: [] })
})
```

### Testing with Context

```javascript
// Wrap component with provider
import { AuthProvider } from '../context/AuthContext'

it('should use auth context', () => {
    render(
        <AuthProvider>
            <MyComponent />
        </AuthProvider>
    )
})
```

### Testing Async Code

```javascript
import { waitFor } from '@testing-library/react'

it('should load data', async () => {
    render(<MyComponent />)
    
    await waitFor(() => {
        expect(screen.getByText('Data loaded')).toBeInTheDocument()
    })
})
```

## Coverage Goals

- **Backend**: Aim for 80%+ coverage
  - Controllers: 90%
  - Middleware: 85%
  - Routes: 75%

- **Frontend**: Aim for 70%+ coverage
  - Context: 90%
  - Components: 80%
  - Services: 85%

### Check Coverage

```bash
# Backend
cd node-backend && npm test -- --coverage

# Frontend
cd react-frontend && npm test -- --coverage
```

## CI/CD Integration

### GitHub Actions Example

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        node-version: [16.x, 18.x]
    
    steps:
    - uses: actions/checkout@v2
    - uses: actions/setup-node@v2
      with:
        node-version: ${{ matrix.node-version }}
    
    - run: cd node-backend && npm install && npm test
    - run: cd react-frontend && npm install && npm test
```

## Debugging Tests

### Backend Debugging

```bash
# Run with verbose output
npm test -- --verbose

# Debug in Node Inspector
node --inspect-brk node_modules/.bin/jest --runInBand

# Print all calls to console
npm test -- --verbose --no-coverage
```

### Frontend Debugging

```bash
# Debug mode with console output
npm test -- --no-coverage

# Stop on first test failure
npm test -- --bail

# Run single test
npm test -- -t "should login"
```

## Best Practices

1. **Test Naming**: Use descriptive names
   ```javascript
   it("should login user with valid credentials", () => {})
   ```

2. **Arrange-Act-Assert**: Follow AAA pattern
   ```javascript
   it("should work", () => {
       // Arrange - setup
       const data = { email: 'test@test.com' }
       
       // Act - execute
       const result = process.data(data)
       
       // Assert - verify
       expect(result).toEqual(expected)
   })
   ```

3. **DRY Tests**: Use beforeEach for common setup
   ```javascript
   beforeEach(() => {
       jest.clearAllMocks()
   })
   ```

4. **Test Edge Cases**: Test both happy and sad paths
   - Valid inputs
   - Invalid inputs
   - Boundary values
   - Error conditions

5. **Keep Tests Focused**: One assertion per test when possible
6. **Use Fixtures**: Create reusable test data
7. **Mock External Services**: Don't make real API calls

## Troubleshooting

**Tests timing out**:
```javascript
it("should work", async () => {
    // Increase timeout to 10 seconds
}, 10000)
```

**Mock not working**:
```javascript
// Make sure to mock before import
jest.mock('axios')
import axios from 'axios'
```

**localStorage errors**:
- Already mocked in `setupTests.js`
- Clear between tests: `localStorage.clear()`

**Async issues**:
- Use `waitFor` for async operations
- Use `act` wrapper for state updates
- Add `done` callback for callbacks

## Resources

- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [Supertest](https://github.com/visionmedia/supertest)
- [Testing Best Practices](https://testingjavascript.com/)
