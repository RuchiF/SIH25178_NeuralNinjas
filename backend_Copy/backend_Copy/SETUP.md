# Quick Setup Guide - Node.js Middleware

## Step 1: Install Dependencies

```powershell
cd D:\SIH\SIH_178\backend_new
npm install
```

## Step 2: Create Environment File

```powershell
Copy-Item .env.example .env
```

## Step 3: Verify Python Backend is Running

Make sure your Python backend is running on port 8000:

```powershell
cd D:\SIH\SIH_178\backend
python server.py
# OR
python server_modular.py
```

## Step 4: Start Node.js Middleware

```powershell
cd D:\SIH\SIH_178\backend_new
npm run dev
```

The server will start on http://localhost:3001

## Step 5: Update Frontend Configuration

Update `D:\SIH\SIH_178\frontend\.env`:

```env
VITE_BACKEND_URL=http://localhost:3001
```

## Step 6: Restart Frontend

```powershell
cd D:\SIH\SIH_178\frontend
npm run dev
```

## Complete Service Stack

After setup, you should have:

1. ✅ MongoDB running on port 27017
2. ✅ Python ML Service on http://localhost:8000
3. ✅ Node.js Middleware on http://localhost:3001
4. ✅ React Frontend on http://localhost:3000

## Testing the Setup

Test Node.js health:

```powershell
Invoke-WebRequest -Uri http://localhost:3001/health | Select-Object -Expand Content
```

Test prediction through middleware:

```powershell
$body = @{
    site_id = "site1"
    pollutant_type = "NO2"
    datetime = "2024-01-15T12:00:00"
    temperature = 25.5
    humidity = 60
    wind_speed = 3.2
} | ConvertTo-Json

Invoke-WebRequest -Uri http://localhost:3001/api/predict -Method POST -Body $body -ContentType "application/json" | Select-Object -Expand Content
```

## Architecture Flow

```
User Browser
    ↓
React App (localhost:3000)
    ↓ HTTP requests
Node.js Middleware (localhost:3001)
    ↓ Proxied requests
Python ML Service (localhost:8000)
    ↓
XGBoost Models + MongoDB
```

## Benefits

- ✅ Separation of concerns (API Gateway vs ML Service)
- ✅ Rate limiting and security in Node.js
- ✅ Python focused on ML predictions
- ✅ Better scalability
- ✅ Request logging and monitoring
- ✅ Error handling and validation
