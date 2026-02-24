# Air Quality Forecasting Portal - Node.js Middleware

This is the Node.js middleware/API Gateway layer that sits between the React frontend and Python ML service.

## Architecture

```
Frontend (React/Vite:3000) → Node.js Middleware (Express:3001) → Python ML Service (FastAPI:8000)
```

## Features

- **API Gateway**: Routes requests from frontend to Python ML service
- **Rate Limiting**: Prevents abuse with configurable limits
- **Request Logging**: Comprehensive logging with Morgan
- **Error Handling**: Centralized error handling middleware
- **CORS**: Configured for frontend communication
- **Security**: Helmet.js for HTTP header security
- **Compression**: Response compression for better performance
- **MongoDB**: Mongoose integration for data persistence

## Setup

### 1. Install Dependencies

```bash
cd backend_new
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Edit `.env`:

```env
PORT=3001
PYTHON_SERVICE_URL=http://localhost:8000
MONGODB_URI=mongodb://localhost:27017/air_quality
CORS_ORIGIN=http://localhost:3000
```

### 3. Start the Server

Development mode with auto-reload:

```bash
npm run dev
```

Production mode:

```bash
npm start
```

## API Endpoints

All endpoints are prefixed with `/api`:

### ML Predictions

- `POST /api/predict` - Predict pollutant concentrations
- `POST /api/forecast` - Get forecast data
- `GET /api/metrics/:pollutantType` - Get model metrics (NO2 or O3)

### Dashboard

- `GET /api/dashboard-data` - Get comprehensive dashboard data
- `GET /api/cities` - Get available cities/sites

### Upload

- `POST /api/upload-csv` - Upload CSV file for batch predictions

### Health

- `GET /health` - Health check for all services

## Project Structure

```
backend_new/
├── src/
│   ├── config/
│   │   ├── index.js           # Environment configuration
│   │   └── database.js        # MongoDB connection
│   ├── middleware/
│   │   ├── errorHandler.js    # Error handling
│   │   ├── logger.js          # Request logging
│   │   └── rateLimiter.js     # Rate limiting
│   ├── services/
│   │   └── pythonMLService.js # Python ML service client
│   ├── controllers/
│   │   ├── mlController.js    # ML predictions logic
│   │   ├── dashboardController.js
│   │   └── uploadController.js
│   ├── routes/
│   │   ├── mlRoutes.js
│   │   ├── dashboardRoutes.js
│   │   └── uploadRoutes.js
│   └── server.js              # Express app entry point
├── package.json
├── .env.example
└── README.md
```

## Dependencies

- **express**: Web framework
- **axios**: HTTP client for Python service
- **mongoose**: MongoDB ODM
- **cors**: CORS middleware
- **helmet**: Security headers
- **express-rate-limit**: Rate limiting
- **morgan**: HTTP request logger
- **compression**: Response compression
- **multer**: File upload handling
- **form-data**: Multipart form data

## Running All Services

1. **MongoDB**: Start MongoDB on port 27017
2. **Python ML Service**: Start Python backend on port 8000
3. **Node.js Middleware**: Start this service on port 3001
4. **React Frontend**: Start Vite dev server on port 3000

## Testing

Test the middleware health:

```bash
curl http://localhost:3001/health
```

Test ML prediction through middleware:

```bash
curl -X POST http://localhost:3001/api/predict \
  -H "Content-Type: application/json" \
  -d '{
    "site_id": "site1",
    "pollutant_type": "NO2",
    "datetime": "2024-01-15T12:00:00",
    "temperature": 25.5,
    "humidity": 60,
    "wind_speed": 3.2
  }'
```

## Frontend Integration

Update your frontend `.env` file to point to the Node.js middleware:

```env
VITE_BACKEND_URL=http://localhost:3001
```

The frontend will now communicate with Node.js middleware instead of directly with Python backend.
