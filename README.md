<<<<<<< HEAD
# E-Commerce ML Platform

A full-stack application combining React frontend, Node.js backend, and Python ML models for demand prediction and product recommendations.

## Project Structure

```
├── node-backend/          # Express.js REST API with validation & rate limiting
├── react-frontend/        # React web application with code splitting
├── python-ml/             # Flask ML service with model persistence
└── .env.example          # Environment template
```

## Prerequisites

- Node.js 16+ and npm
- Python 3.8+
- MongoDB (local or Atlas)

## Setup Instructions

### 1. Backend Setup

```bash
cd node-backend
cp .env.example .env
npm install
```

Update `.env` with your MongoDB URI and JWT secret:
```
PORT=4000
MONGO_URI=mongodb://localhost:27017/ecommerce
JWT_SECRET=your_secret_key_here_min_32_chars
NODE_ENV=development
```

Start the backend:
```bash
npm start
```

**Run tests:**
```bash
npm test
```

### 2. Frontend Setup

```bash
cd react-frontend
cp .env.example .env
npm install
npm start
```

Frontend will run on `http://localhost:3000`

**Update `.env`:**
```
REACT_APP_API_URL=http://localhost:4000
REACT_APP_ENV=development
```

**Run tests:**
```bash
npm test
```

### 3. Python ML Setup

```bash
cd python-ml
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install flask flask-cors requests

python app.py
```

Python service runs on `http://localhost:5000`

- **First run**: Models train from scratch and are saved to `models/` directory
- **Subsequent runs**: Models load from cache (instant startup)

## Key Features Implemented

### ✅ Backend Improvements
- **Environment Validation**: Server validates required env vars on startup
- **Global Error Handling**: Middleware for uncaught errors and 404 routes
- **Request Validation**: Express-validator for schema validation on auth/product endpoints
- **Rate Limiting**: 
  - General: 100 req/15min
  - Auth: 5 attempts/15min
  - ML Predictions: 30/min, Batch: 5/min
- **Input Validation**: Email format, password strength, field length checks
- **Auth Improvements**: Secure password hashing with bcryptjs, JWT token validation

### ✅ Frontend Improvements
- **Error Boundary**: Component-level error handling with graceful fallbacks
- **Code Splitting**: Lazy loading of routes with React.lazy & Suspense
- **API Error Handling**: Centralized Axios interceptors for error handling
- **Token Management**: Auto-logout on 401, token injection in headers
- **Environment Variables**: API URL from env config, not hardcoded
- **Loading States**: Custom page loader during component load

### ✅ Python ML Improvements
- **Error Handling**: Try-catch in all routes with meaningful error messages
- **Input Validation**: Price ranges, list size limits, data type validation
- **Model Persistence**: Models saved to disk with pickle
- **Cache Loading**: Models load from cache on startup (90% faster)
- **Status Codes**: Proper HTTP status codes (503 if models not loaded)
- **Request Documentation**: Docstrings for all endpoints

### ✅ Testing Setup
- **Backend (Jest)**: Auth tests, validation tests, integration tests
- **Frontend (React Testing Library)**: AuthContext tests, ErrorBoundary tests
- **Configuration**: Jest config, test setup with mocks

### ✅ Documentation
- **.env.example** files for all services
- **.gitignore** to prevent committing secrets
- **README.md** with full setup and API documentation

## API Endpoints

### Auth
- `POST /auth/register` - Create account (validated)
- `POST /auth/login` - Login (rate limited)
- `GET /auth/me` - Get current user (protected)

### Products
- `GET /products` - All products
- `GET /products/:code` - Single product
- `GET /products/filter/laptops` - Laptops only
- `GET /products/filter/phones` - Phones only

### Customers
- `GET /customers` - All customers
- `GET /customers/:name` - Single customer

### ML/Predictions
- `POST /ml/predict` - Single demand prediction
- `POST /ml/predict/batch` - Batch predictions (validated, rate limited)
- `POST /ml/recommend/user` - User recommendations
- `POST /ml/recommend/product` - Similar products
- `POST /ml/recommend/by-name` - Search by product name
- `GET /ml/model/info` - Model metrics & cache status

## Features

- **Authentication**: JWT-based login/registration with password validation
- **Demand Prediction**: Linear regression model for quantity forecasting
- **Recommendations**: 
  - Collaborative filtering for user-based recommendations
  - Content-based filtering for product similarities
- **Error Handling**: Comprehensive error boundaries and middleware
- **Security**: Password hashing, token validation, rate limiting
- **Performance**: Code splitting, lazy loading, model caching
- **Testing**: Unit and integration test coverage

## Running Tests

### Backend Tests
```bash
cd node-backend
npm test

# Run specific test file
npm test auth.test.js

# Run with coverage
npm test -- --coverage
```

### Frontend Tests
```bash
cd react-frontend
npm test

# Run with coverage
npm test -- --coverage

# Run specific test file
npm test AuthContext.test.js
```

## Project Architecture

```
Frontend (React 19.2)
├── Pages (lazy loaded)
│   ├── Dashboard
│   ├── DemandPredictor
│   ├── ProductRecommender
│   ├── UserRecommender
│   └── ModelInfo
├── Context (AuthContext)
├── Services (Centralized API calls)
├── Components (Reusable UI)
└── Error Boundary (Global error handling)
        ↓
Backend (Express 5.2)
├── Routes (Auth, Products, Customers, ML)
├── Controllers (Business logic)
├── Middleware (Auth, Validation, Rate limit)
├── Models (MongoDB schemas)
└── Error Handler (Global)
        ↓
Python ML (Flask)
├── Data Preparation
├── Linear Regression Model
├── Recommendation Engine
└── Model Persistence (Pickle)
        ↓
Database (MongoDB)
```

## Environment Variables

**Backend (.env)**
```
PORT=4000
MONGO_URI=mongodb://localhost:27017/ecommerce
JWT_SECRET=your_secret_key_here_change_in_production
NODE_ENV=development
```

**Frontend (.env)**
```
REACT_APP_API_URL=http://localhost:4000
REACT_APP_ENV=development
```

## Deployment Checklist

Before production deployment:
- [ ] Set `NODE_ENV=production`
- [ ] Update `JWT_SECRET` to strong random value (32+ chars)
- [ ] Update `MONGO_URI` to production database
- [ ] Update `REACT_APP_API_URL` to production backend URL
- [ ] Build React: `npm run build`
- [ ] Enable HTTPS/SSL
- [ ] Configure CORS appropriately
- [ ] Set up environment secrets manager
- [ ] Run full test suite
- [ ] Review rate limiting thresholds
- [ ] Set up logging and monitoring

## Troubleshooting

**Backend won't start**: 
- Check `.env` file exists with required variables
- Verify MongoDB connection string
- Run `npm install` to ensure all dependencies

**Frontend not connecting to backend**:
- Verify `REACT_APP_API_URL` in `.env`
- Check backend is running on port 4000
- Review browser console for CORS errors

**Python models not loading**:
- Check `python-ml/models/` directory permissions
- Verify data file path `data/ecommerce.csv` exists
- Run `python app.py` directly to see initialization logs

**Tests failing**:
- Clear node_modules: `rm -rf node_modules && npm install`
- Clear Jest cache: `npm test -- --clearCache`
- Check database is running (for backend tests)

## Future Improvements

- [ ] Add more comprehensive unit tests (80%+ coverage)
- [ ] Implement caching layer (Redis)
- [ ] Add API documentation (Swagger/OpenAPI)
- [ ] Database migrations (Liquibase/Migrations)
- [ ] API versioning (/api/v1/)
- [ ] Email verification for registration
- [ ] Password reset functionality
- [ ] Enhanced monitoring & analytics
- [ ] WebSocket support for real-time updates
- [ ] Docker containerization
- [ ] CI/CD pipeline (GitHub Actions)

## License

ISC

## Support

For issues or questions, please check the test files for usage examples or review the API endpoint documentation above.
=======
# DemandPredictionAndProductRecommendation1
>>>>>>> 2ca31629721ba16cb62a2008236a5b2895c81356
