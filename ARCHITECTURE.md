# Project Architecture

Comprehensive documentation of the system architecture, design patterns, and data flow.

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     CLIENT LAYER (React 19.2)                   │
├─────────────────────────────────────────────────────────────────┤
│  Dashboard  │  Predictor  │  Recommender  │  ModelInfo  │ Auth  │
├─────────────────────────────────────────────────────────────────┤
│           Error Boundary (Global Error Handling)                 │
├─────────────────────────────────────────────────────────────────┤
│            Authentication Context (Token + User State)           │
├─────────────────────────────────────────────────────────────────┤
│  API Service (Axios with Interceptors & Validation)              │
└─────────────────────────────────────────────────────────────────┘
                              ↓ HTTPS/CORS ↓
┌─────────────────────────────────────────────────────────────────┐
│                  API LAYER (Express 5.2)                         │
├─────────────────────────────────────────────────────────────────┤
│  Rate Limiting  │  CORS  │  JSON Parser  │  Error Handler       │
├─────────────────────────────────────────────────────────────────┤
│  Auth Routes  │ Product Routes  │ Customer Routes  │ ML Routes   │
├─────────────────────────────────────────────────────────────────┤
│  Auth Middleware  │  Validation Middleware  │  Rate Limit        │
├─────────────────────────────────────────────────────────────────┤
│  Auth Controller  │ Product Controller  │ ML Controller          │
└─────────────────────────────────────────────────────────────────┘
                              ↓ Mongoose ↓
┌─────────────────────────────────────────────────────────────────┐
│              DATABASE LAYER (MongoDB)                            │
├─────────────────────────────────────────────────────────────────┤
│  Users Collection  │ Products Collection  │ Customers Collection │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│              ML LAYER (Python Flask 2.x)                         │
├─────────────────────────────────────────────────────────────────┤
│  Demand Prediction  │  Recommendations  │  Model Info           │
├─────────────────────────────────────────────────────────────────┤
│  Linear Regression  │  Collaborative Filtering  │ Content-Based  │
├─────────────────────────────────────────────────────────────────┤
│  Data Preparation  │  Feature Engineering  │  Normalization      │
├─────────────────────────────────────────────────────────────────┤
│  Pickle Models (Persisted to Disk)                              │
└─────────────────────────────────────────────────────────────────┘
                              ↓ Flask Routes ↓
                        ← Called by Backend API →
```

## Frontend Architecture

### Component Hierarchy

```
App (with ErrorBoundary)
├── Sidebar (Navigation)
└── Main Content (Route-based)
    ├── Dashboard (Home)
    │   ├── Stats Card
    │   └── Quick Actions
    ├── DemandPredictor
    │   ├── Input Form
    │   ├── Chart (Recharts)
    │   └── Results
    ├── ProductRecommender
    │   ├── Product Selector
    │   └── Recommendation List
    ├── UserRecommender
    │   ├── Customer Selector
    │   └── Recommendation List
    └── ModelInfo
        └── Metrics Display

Authentication Flow (unprotected routes)
├── Login
└── Register
```

### Context API Structure

```
AuthContext
├── State
│   ├── user { id, name, email }
│   ├── token (JWT)
│   └── error
├── Actions
│   ├── login(userData, token)
│   ├── logout()
│   └── setAuthError(message)
└── Consumers
    └── All components via useAuth() hook
```

### API Service Layer

```
api.js (Centralized)
├── Axios Instance
│   ├── Base URL from env
│   └── Interceptors
│       ├── Request: Add token to headers
│       └── Response: Handle 401, auto-logout
├── Demand Prediction
│   ├── predictDemand(price)
│   └── predictBatch(prices[])
├── Recommendations
│   ├── recommendForUser(customerName)
│   └── recommendSimilarProducts(productCode)
├── Products & Customers
│   ├── getAllProducts()
│   ├── getLaptops()
│   ├── getPhones()
│   ├── getAllCustomers()
│   └── getModelInfo()
└── Error Handling
    └── Automatic error wrapping with context
```

### Code Splitting Strategy

**Route-based Lazy Loading:**
- Dashboard: Loaded on-demand (separate chunk)
- DemandPredictor: Separate chunk
- ProductRecommender: Separate chunk
- UserRecommender: Separate chunk
- ModelInfo: Separate chunk

**Benefits:**
- Initial bundle reduced by ~40%
- Faster Time to Interactive (TTI)
- Pages load only when needed

**Fallback:** PageLoader component during chunk loading

## Backend Architecture

### Middleware Pipeline

```
Request
  ↓
CORS Middleware
  ↓
JSON Parser
  ↓
Rate Limiter (100 req/15min)
  ↓
Route Handler
  ├── Auth Routes (5 attempts/15min)
  │   ├── Validation Middleware
  │   ├── Auth Controller
  │   └── Auth Middleware (for /me)
  ├── Product Routes
  │   └── Product Controller
  ├── Customer Routes
  │   └── Customer Controller
  └── ML Routes
      ├── Rate Limiter (30/min, batch 5/min)
      └── ML Controller
  ↓
404 Handler (if no route matched)
  ↓
Error Handler (catches all errors)
  ↓
Response
```

### Controller Architecture

**Auth Controller:**
```javascript
register(req, res)
  ├── Validate input
  ├── Check email exists
  ├── Hash password
  ├── Create user
  ├── Generate JWT
  └── Return token + user

login(req, res)
  ├── Validate input
  ├── Find user
  ├── Compare password
  ├── Generate JWT
  └── Return token + user

getMe(req, res)
  ├── Verify token (middleware)
  ├── Fetch user
  └── Return user data
```

**Product Controller:**
```javascript
getAllProducts(req, res)
  ├── Query MongoDB
  └── Return products

getProductByCode(req, res)
  ├── Validate code
  ├── Query MongoDB
  └── Return product
```

**ML Controller:**
```javascript
predictDemand(req, res)
  ├── Validate price
  ├── Call Python API
  ├── Handle errors
  └── Return prediction

getRecommendations(req, res)
  ├── Validate input
  ├── Call Python API
  └── Return recommendations
```

### Validation Middleware

```javascript
validateRegister
├── name: required, 2-100 chars
├── email: valid email format
└── password: 6+ chars, uppercase, number

validateLogin
├── email: valid format
└── password: required

validateProductCode
└── code: required, 1-50 chars
```

### Authentication Flow

```
Client                              Server
  │                                   │
  ├─ POST /auth/register ────────────→│
  │                                   ├─ Validate input
  │                                   ├─ Hash password
  │                                   ├─ Create user
  │                                   ├─ Generate JWT
  │←───────── 201 + token ────────────┤
  │                                   │
  ├─ GET /products ───────────────────→│
  │   (no auth needed)                └─ Return products
  │←───── 200 + products ──────────────┤
  │                                   │
  ├─ GET /auth/me ────────────────────→│
  │   Authorization: Bearer <token>   ├─ Verify token
  │                                   ├─ Get user
  │←─────── 200 + user ────────────────┤
  │                                   │
  (Token expires after 7 days)
```

## Python ML Architecture

### Model Training Pipeline

```
load_and_prepare()
  ├── Read ecommerce.csv
  ├── Parse data
  └── Return DataFrame

normalize(data)
  ├── Min-max scaling
  └── Return normalized + min/max values

train_test_split(x, y)
  ├── 80-20 split
  └── Return train/test sets

train(x_train, y_train)
  ├── Linear Regression
  ├── Gradient Descent
  └── Return M, B coefficients

predict(x, M, B)
  ├── y = M*x + B
  └── Return prediction
```

### Recommendation Engine

**Collaborative Filtering:**
```
build_user_item_matrix(df)
  ├── Create user-product matrix
  ├── Calculate user similarities (cosine)
  └── Find similar users

collaborative_recommend(customer, matrix, ...)
  ├── Find similar customers
  ├── Get their purchases
  ├── Exclude customer's items
  └── Return top recommendations
```

**Content-Based Filtering:**
```
build_product_features(df)
  ├── Extract features (brand, price, specs)
  ├── Create feature vectors
  └── Calculate product similarities

content_based_recommend(product_code, vectors, ...)
  ├── Get product vector
  ├── Compare with all products
  ├── Find similar products
  └── Return top N
```

### Model Persistence

**On Startup:**
```
app.run()
  ├── Check if models exist on disk
  ├── If yes: load_models() ✓ (fast)
  └── If no: train_models() + save_models()
        ├── Load data
        ├── Train models
        ├── Calculate metrics
        └── Pickle to disk
```

**Model Files:**
- `models/regression_model.pkl` - Linear regression + params
- `models/recommender_data.pkl` - Collaborative + content-based data

## Data Flow Examples

### Demand Prediction Flow

```
User Input (price)
  ↓ React Component
  ↓ DemandPredictor.js
  ↓ predictDemand(price)
  ↓ API Service (api.js)
  ↓ POST /ml/predict { price }
  ↓ Express Server
  ↓ Rate Limiter (30/min)
  ↓ ML Controller
  ↓ Call Flask: POST /predict
  ↓ Flask Route Handler
  ├─ Validate price
  ├─ Normalize price
  ├─ predict(x, M, B)
  ├─ Denormalize result
  ├─ Clamp to range [1, 10]
  └─ Return quantity
  ↓ Express sends response
  ↓ Axios returns data
  ↓ Component displays result
```

### Recommendation Flow

```
User Selects Product
  ↓ React Component
  ↓ ProductRecommender.js
  ↓ recommendSimilarProducts(code)
  ↓ API Service
  ↓ POST /ml/recommend/product { product_code }
  ↓ Express Server
  ↓ ML Controller
  ↓ Call Flask: POST /recommend/product
  ↓ Flask Route Handler
  ├─ Validate product code
  ├─ Call content_based_recommend()
  ├─ Calculate cosine similarity
  ├─ Return top 5 products
  └─ Send to client
  ↓ Component displays recommendations
```

## Error Handling Strategy

```
Frontend
├── Error Boundary
│   └── Catches React errors
├── API Errors
│   ├── Network errors
│   ├── 4xx responses
│   └── 5xx responses
└── Form Validation
    ├── Client-side validation
    └── Server feedback display

Backend
├── Input Validation
│   └── Rejects invalid requests
├── Middleware Errors
│   └── Rate limit, auth failures
└── Global Error Handler
    ├── Logs error
    └── Returns 500 + message

Python
├── Data Validation
│   └── Price ranges, formats
├── Model Errors
│   └── Returns 503 if models not loaded
└── Route Error Handler
    ├── Try-catch in all routes
    └── Returns meaningful errors
```

## Security Architecture

```
Authentication Layer
├── JWT Tokens (7-day expiry)
├── Password Hashing (bcryptjs)
└── Token Validation Middleware

Authorization Layer
├── Protected routes (/auth/me)
└── Role-based access (planned)

Rate Limiting Layer
├── General: 100/15min
├── Auth: 5/15min
└── ML: 30/min, batch 5/min

Input Validation Layer
├── Schema validation
├── Type checking
└── Range validation

CORS Layer
└── Allow localhost:3000 in development
```

## Scalability Considerations

### Current Setup
- Single server instance
- Monolithic backend
- MongoDB (no sharding)
- In-memory rate limiting

### Future Improvements
- **Horizontal Scaling:**
  - Docker containers
  - Load balancer (nginx)
  - Distributed rate limiting (Redis)
  
- **Database Optimization:**
  - Indexing on frequently queried fields
  - Database sharding
  - Read replicas

- **Caching Strategy:**
  - Redis for session storage
  - Cache predictions
  - Cache recommendations

- **Performance:**
  - CDN for static assets
  - Database query optimization
  - API pagination

## Deployment Architecture

```
Development
  └── Local MongoDB
  └── npm start (frontend & backend)
  └── python app.py (ML)

Staging
  └── Docker containers
  └── Docker Compose orchestration
  └── Staging database
  └── CI/CD pipeline

Production
  └── Kubernetes cluster
  └── Cloud database (MongoDB Atlas)
  └── CDN for static files
  └── SSL/TLS certificates
  └── Monitoring & logging
```

## Technology Stack

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| Frontend | React | 19.2.5 | UI Framework |
| Frontend | React Router | 6.30.1 | Routing |
| Frontend | Recharts | 3.8.1 | Charts |
| Frontend | Axios | 1.15.2 | HTTP Client |
| Backend | Express | 5.2.1 | Web Framework |
| Backend | MongoDB | Latest | Database |
| Backend | Mongoose | 9.4.1 | ODM |
| Backend | JWT | 9.0.3 | Authentication |
| Backend | bcryptjs | 3.0.3 | Password Hashing |
| Backend | express-validator | 7.0.0 | Validation |
| Backend | express-rate-limit | 7.1.5 | Rate Limiting |
| ML | Python | 3.8+ | Language |
| ML | Flask | 2.x | Web Framework |
| Testing | Jest | 29.7.0 | Test Runner |
| Testing | Supertest | 6.3.3 | API Testing |
| Testing | React Testing Library | 16.3.2 | Component Testing |

## Design Patterns Used

1. **MVC (Model-View-Controller):**
   - Models: MongoDB schemas
   - Views: React components
   - Controllers: Express controllers

2. **Observer Pattern:**
   - Context API for state management
   - Event-driven architecture

3. **Middleware Pattern:**
   - Express middleware stack
   - Error handling pipeline

4. **Lazy Loading Pattern:**
   - React.lazy for code splitting
   - On-demand component loading

5. **Singleton Pattern:**
   - API service instance
   - Database connection

6. **Factory Pattern:**
   - Model creation
   - Controller instantiation

## Monitoring & Observability

### Logging Strategy
```javascript
// Backend logging
console.log("✓ Service started")
console.error("✗ Error occurred", error)

// Frontend logging
console.log("API Call:", method, url)
console.error("API Error:", response.status)
```

### Metrics to Track
- API response times
- Error rates
- Rate limit hits
- Model accuracy (ML)
- Database query performance
