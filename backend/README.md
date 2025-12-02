# Keycloak FastAPI Backend

A Python FastAPI REST API with Keycloak JWT authentication.

## Setup

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

Or using a virtual environment:

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 2. Run the Server

```bash
python main.py
```

Or using uvicorn directly:

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`

### 3. API Documentation

FastAPI provides automatic interactive documentation:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## Endpoints

### Public Endpoints (No Authentication)

- `GET /` - Welcome message
- `GET /health` - Health check

### Protected Endpoints (Requires JWT Token)

- `GET /api/protected` - Basic protected route, returns user info
- `GET /api/user/profile` - Get current user profile
- `GET /api/user/roles` - Get user's roles
- `POST /api/data` - Create data (example POST endpoint)
- `GET /api/admin/users` - Admin-only endpoint (requires 'admin' role)

## Testing with Frontend

### 1. Start both servers:

```bash
# Terminal 1 - Backend
cd backend
python main.py

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### 2. Use the API service in your React app:

The frontend uses axios with automatic token injection. The API service is already configured in `frontend/src/services/api.ts`:

```typescript
// Example usage in a component
import { useApi } from '../services/api';

function MyComponent() {
  const { get, post } = useApi();

  const fetchData = async () => {
    // Token is automatically added via axios interceptor
    const data = await get('/api/protected');
    console.log(data);
  };

  return { callApi };
};
```

### 3. Use in components:

```typescript
import { useApi } from '../services/api';

function MyComponent() {
  const { callApi } = useApi();

  const createData = async () => {
    const result = await post('/api/data', { key: 'value' });
    console.log(result);
  };

  return (
    <>
      <button onClick={fetchData}>Fetch Protected Data</button>
      <button onClick={createData}>Create Data</button>
    </>
  );
}
```

**Key Features:**
- Automatic Bearer token injection via axios interceptors
- Better error handling with detailed messages
- Type-safe responses with TypeScript generics
- Supports GET, POST, PUT, DELETE, PATCH methods

## Testing with cURL

### Public endpoint:
```bash
curl http://localhost:8000/
```

### Protected endpoint (replace TOKEN with your actual JWT):
```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" http://localhost:8000/api/protected
```

### Get user profile:
```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" http://localhost:8000/api/user/profile
```

### POST request:
```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"key": "value"}' \
  http://localhost:8000/api/data
```

## How It Works

1. **Token Verification**: The API validates JWT tokens using Keycloak's public keys (JWKS)
2. **CORS**: Configured to allow requests from `http://localhost:5173` (your frontend)
3. **Role-Based Access**: Some endpoints check for specific roles (e.g., admin)
4. **Automatic Docs**: FastAPI generates OpenAPI/Swagger documentation

## Configuration

Update these values in `main.py` if your Keycloak setup differs:

```python
KEYCLOAK_URL = "http://158.39.75.110"
REALM = "naic-monitor"
```
