from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import jwt
from jwt import PyJWKClient
from typing import Optional, Dict, Any
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Keycloak Protected API")

# Keycloak configuration
KEYCLOAK_URL = "https://naic-kc.ashen.no"
REALM = "naic-monitor"
JWKS_URL = f"{KEYCLOAK_URL}/realms/{REALM}/protocol/openid-connect/certs"
ISSUER = f"{KEYCLOAK_URL}/realms/{REALM}"

# JWT client for fetching public keys
jwks_client = PyJWKClient(JWKS_URL)

# Security scheme
security = HTTPBearer()

# CORS configuration - allow Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Response models
class UserInfo(BaseModel):
    sub: str
    email: Optional[str] = None
    name: Optional[str] = None
    preferred_username: Optional[str] = None
    email_verified: Optional[bool] = None

class MessageResponse(BaseModel):
    message: str
    user: Optional[Dict[str, Any]] = None

# Dependency to validate JWT token
async def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)) -> Dict[str, Any]:
    """
    Verify and decode JWT token from Keycloak
    """
    token = credentials.credentials

    try:
        # Get the signing key from JWKS
        signing_key = jwks_client.get_signing_key_from_jwt(token)

        # Decode and verify the token
        payload = jwt.decode(
            token,
            signing_key.key,
            algorithms=["RS256"],
            audience="account",  # Default Keycloak audience
            issuer=ISSUER,
            options={
                "verify_signature": True,
                "verify_exp": True,
                "verify_iat": True,
                "verify_aud": True,
                "verify_iss": True,
            }
        )

        logger.info(f"Token validated for user: {payload.get('preferred_username')}")
        return payload

    except jwt.ExpiredSignatureError:
        logger.error("Token has expired")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.InvalidTokenError as e:
        logger.error(f"Invalid token: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Could not validate credentials: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except Exception as e:
        logger.error(f"Token verification failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

# Public endpoint - no authentication required
@app.get("/", response_model=MessageResponse)
async def root():
    """
    Public endpoint - accessible without authentication
    """
    return {
        "message": "Welcome to the Keycloak Protected API",
        "user": None
    }

@app.get("/health")
async def health_check():
    """
    Health check endpoint
    """
    return {"status": "healthy"}

# Protected endpoints - authentication required
@app.get("/api/protected", response_model=MessageResponse)
async def protected_route(token_payload: Dict[str, Any] = Depends(verify_token)):
    """
    Protected endpoint - requires valid JWT token
    """
    return {
        "message": "This is a protected route. You are authenticated!",
        "user": {
            "sub": token_payload.get("sub"),
            "username": token_payload.get("preferred_username"),
            "email": token_payload.get("email"),
            "name": token_payload.get("name"),
        }
    }

@app.get("/api/user/profile", response_model=UserInfo)
async def get_user_profile(token_payload: Dict[str, Any] = Depends(verify_token)):
    """
    Get the current user's profile from token
    """
    return UserInfo(
        sub=token_payload.get("sub"),
        email=token_payload.get("email"),
        name=token_payload.get("name"),
        preferred_username=token_payload.get("preferred_username"),
        email_verified=token_payload.get("email_verified", False)
    )

@app.get("/api/user/roles")
async def get_user_roles(token_payload: Dict[str, Any] = Depends(verify_token)):
    """
    Get the current user's roles from token
    """
    # Extract realm roles
    realm_access = token_payload.get("realm_access", {})
    realm_roles = realm_access.get("roles", [])

    # Extract resource/client roles
    resource_access = token_payload.get("resource_access", {})

    return {
        "username": token_payload.get("preferred_username"),
        "realm_roles": realm_roles,
        "resource_access": resource_access
    }

@app.post("/api/data")
async def create_data(
    data: Dict[str, Any],
    token_payload: Dict[str, Any] = Depends(verify_token)
):
    """
    Example POST endpoint - create data
    """
    return {
        "message": "Data created successfully",
        "data": data,
        "created_by": token_payload.get("preferred_username")
    }

@app.get("/api/admin/users")
async def admin_only_endpoint(token_payload: Dict[str, Any] = Depends(verify_token)):
    """
    Admin-only endpoint - checks for admin role
    """
    # Check if user has admin role
    realm_access = token_payload.get("realm_access", {})
    roles = realm_access.get("roles", [])

    if "admin" not in roles:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions. Admin role required."
        )

    return {
        "message": "Admin access granted",
        "users": [
            {"id": 1, "username": "user1"},
            {"id": 2, "username": "user2"},
        ]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")
