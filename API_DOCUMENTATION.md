# Hospital SaaS API Documentation

## Base URL
```
http://localhost:3000/api/v1
```

## Authentication
The API uses JWT tokens for authentication. Tokens are stored in HTTP-only cookies and can also be sent via Authorization header.

### Cookie Authentication
```javascript
// Token is automatically set in HTTP-only cookie after login
```

### Header Authentication
```javascript
Authorization: Bearer <your-jwt-token>
```

---

## 🏥 Health Check

### Check API Status
```http
GET /health
```

**Response:**
```json
{
  "success": true,
  "message": "Hospital SaaS API is running",
  "timestamp": "2025-09-03T10:00:00.000Z"
}
```

---

## 👑 SuperAdmin Endpoints

### 1. SuperAdmin Login
```http
POST /superadmin/login
```

**Request Body:**
```json
{
  "email": "superadmin@hospital.com",
  "password": "superadmin123"
}
```

**Response:**
```json
{
  "statusCode": 200,
  "data": {
    "superAdmin": {
      "id": "uuid",
      "name": "Super Admin",
      "email": "superadmin@hospital.com",
      "isActive": true,
      "createdAt": "2025-09-03T10:00:00.000Z",
      "updatedAt": "2025-09-03T10:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Login successful",
  "success": true
}
```

### 2. Create Subscription Plan
```http
POST /superadmin/subscription-plans
```
*Requires SuperAdmin authentication*

**Request Body:**
```json
{
  "name": "Premium Plan",
  "description": "Complete solution for large hospitals",
  "price": 99.99,
  "currency": "USD",
  "billingCycle": "monthly",
  "maxUsers": 50,
  "maxPatients": 10000,
  "features": {
    "modules": ["OPD", "IPD", "LAB", "PHARMACY", "RADIOLOGY"],
    "analytics": true,
    "support": "24/7",
    "customReports": true
  }
}
```

**Response:**
```json
{
  "statusCode": 201,
  "data": {
    "id": "uuid",
    "name": "Premium Plan",
    "description": "Complete solution for large hospitals",
    "price": 99.99,
    "currency": "USD",
    "billingCycle": "monthly",
    "maxUsers": 50,
    "maxPatients": 10000,
    "features": {
      "modules": ["OPD", "IPD", "LAB", "PHARMACY", "RADIOLOGY"],
      "analytics": true,
      "support": "24/7",
      "customReports": true
    },
    "isActive": true,
    "createdAt": "2025-09-03T10:00:00.000Z",
    "updatedAt": "2025-09-03T10:00:00.000Z"
  },
  "message": "Subscription plan created successfully",
  "success": true
}
```

### 3. Get All Subscription Plans
```http
GET /superadmin/subscription-plans
```
*Requires SuperAdmin authentication*

**Response:**
```json
{
  "statusCode": 200,
  "data": [
    {
      "id": "basic-plan-id",
      "name": "Basic Plan",
      "description": "Perfect for small clinics",
      "price": 29.99,
      "currency": "USD",
      "billingCycle": "monthly",
      "maxUsers": 5,
      "maxPatients": 500,
      "features": {
        "modules": ["OPD", "LAB"],
        "maxDoctors": 3,
        "maxNurses": 5,
        "storage": "5GB",
        "support": "Email"
      },
      "isActive": true,
      "createdAt": "2025-09-03T10:00:00.000Z",
      "updatedAt": "2025-09-03T10:00:00.000Z"
    }
  ],
  "message": "Subscription plans fetched successfully",
  "success": true
}
```

### 4. Update Subscription Plan
```http
PUT /superadmin/subscription-plans/:id
```
*Requires SuperAdmin authentication*

**Request Body:**
```json
{
  "name": "Updated Plan Name",
  "price": 149.99,
  "features": {
    "modules": ["OPD", "IPD", "LAB", "PHARMACY"],
    "analytics": true
  }
}
```

### 5. Deactivate Subscription Plan
```http
DELETE /superadmin/subscription-plans/:id
```
*Requires SuperAdmin authentication*

**Response:**
```json
{
  "statusCode": 200,
  "data": {
    "id": "uuid",
    "isActive": false,
    "updatedAt": "2025-09-03T10:00:00.000Z"
  },
  "message": "Subscription plan deactivated successfully",
  "success": true
}
```

### 6. Get All Hospitals
```http
GET /superadmin/hospitals
```
*Requires SuperAdmin authentication*

**Response:**
```json
{
  "statusCode": 200,
  "data": [
    {
      "id": "uuid",
      "name": "City General Hospital",
      "address": "123 Main Street",
      "city": "New York",
      "state": "NY",
      "phone": "+1-555-0123",
      "email": "info@citygeneral.com",
      "isActive": true,
      "createdAt": "2025-09-03T10:00:00.000Z",
      "subscription": {
        "id": "uuid",
        "status": "ACTIVE",
        "startDate": "2025-09-03T10:00:00.000Z",
        "endDate": "2025-10-03T10:00:00.000Z",
        "plan": {
          "name": "Basic Plan",
          "price": 29.99
        }
      },
      "_count": {
        "users": 5,
        "patients": 120
      }
    }
  ],
  "message": "Hospitals fetched successfully",
  "success": true
}
```

### 7. Get Dashboard Statistics
```http
GET /superadmin/dashboard/stats
```
*Requires SuperAdmin authentication*

**Response:**
```json
{
  "statusCode": 200,
  "data": {
    "totalHospitals": 25,
    "activeHospitals": 23,
    "totalSubscriptions": 25,
    "activeSubscriptions": 20,
    "totalPlans": 3
  },
  "message": "Dashboard stats fetched successfully",
  "success": true
}
```

### 8. SuperAdmin Logout
```http
POST /superadmin/logout
```
*Requires SuperAdmin authentication*

---

## 🔐 Authentication Endpoints

### 1. Get Available Plans (Public)
```http
GET /auth/plans
```
*No authentication required*

**Response:**
```json
{
  "statusCode": 200,
  "data": [
    {
      "id": "basic-plan-id",
      "name": "Basic Plan",
      "description": "Perfect for small clinics",
      "price": 29.99,
      "currency": "USD",
      "billingCycle": "monthly",
      "maxUsers": 5,
      "maxPatients": 500,
      "features": {
        "modules": ["OPD", "LAB"],
        "support": "Email"
      }
    }
  ],
  "message": "Subscription plans fetched successfully",
  "success": true
}
```

### 2. Register Hospital
```http
POST /auth/register
```
*No authentication required*

**Request Body:**
```json
{
  "hospitalName": "City General Hospital",
  "address": "123 Main Street",
  "city": "New York",
  "state": "NY",
  "country": "USA",
  "pincode": "10001",
  "phone": "+1-555-0123",
  "email": "info@citygeneral.com",
  "website": "https://citygeneral.com",
  "licenseNumber": "LIC12345",
  "adminName": "Dr. John Smith",
  "adminEmail": "admin@citygeneral.com",
  "adminPhone": "+1-555-0124",
  "adminPassword": "password123",
  "planId": "basic-plan-id"
}
```

**Response:**
```json
{
  "statusCode": 201,
  "data": {
    "hospital": {
      "id": "uuid",
      "name": "City General Hospital",
      "address": "123 Main Street",
      "city": "New York",
      "state": "NY",
      "phone": "+1-555-0123",
      "email": "info@citygeneral.com",
      "isActive": true,
      "createdAt": "2025-09-03T10:00:00.000Z"
    },
    "subscription": {
      "id": "uuid",
      "hospitalId": "uuid",
      "planId": "basic-plan-id",
      "status": "ACTIVE",
      "startDate": "2025-09-03T10:00:00.000Z",
      "endDate": "2025-10-03T10:00:00.000Z"
    },
    "admin": {
      "id": "uuid",
      "hospitalId": "uuid",
      "name": "Dr. John Smith",
      "email": "admin@citygeneral.com",
      "role": "ADMIN",
      "isActive": true,
      "createdAt": "2025-09-03T10:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Hospital registered successfully",
  "success": true
}
```

### 3. Hospital Admin Login
```http
POST /auth/login
```
*No authentication required*

**Request Body:**
```json
{
  "email": "admin@citygeneral.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "statusCode": 200,
  "data": {
    "user": {
      "id": "uuid",
      "hospitalId": "uuid",
      "name": "Dr. John Smith",
      "email": "admin@citygeneral.com",
      "role": "ADMIN",
      "isActive": true,
      "lastLoginAt": "2025-09-03T10:00:00.000Z",
      "hospital": {
        "id": "uuid",
        "name": "City General Hospital",
        "subscription": {
          "status": "ACTIVE",
          "plan": {
            "name": "Basic Plan",
            "features": {
              "modules": ["OPD", "LAB"]
            }
          }
        }
      }
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Login successful",
  "success": true
}
```

### 4. Purchase/Update Subscription
```http
POST /auth/subscription/purchase
```
*Requires Admin authentication*

**Request Body:**
```json
{
  "planId": "standard-plan-id",
  "duration": 30
}
```

**Response:**
```json
{
  "statusCode": 200,
  "data": {
    "id": "uuid",
    "hospitalId": "uuid",
    "planId": "standard-plan-id",
    "startDate": "2025-09-03T10:00:00.000Z",
    "endDate": "2025-10-03T10:00:00.000Z",
    "status": "ACTIVE",
    "plan": {
      "name": "Standard Plan",
      "price": 59.99,
      "features": {
        "modules": ["OPD", "IPD", "LAB", "PHARMACY"],
        "support": "Phone & Email"
      }
    }
  },
  "message": "Subscription updated successfully",
  "success": true
}
```

### 5. Get Hospital Profile
```http
GET /auth/hospital/profile
```
*Requires authentication*

**Response:**
```json
{
  "statusCode": 200,
  "data": {
    "id": "uuid",
    "name": "City General Hospital",
    "address": "123 Main Street",
    "city": "New York",
    "state": "NY",
    "phone": "+1-555-0123",
    "email": "info@citygeneral.com",
    "website": "https://citygeneral.com",
    "licenseNumber": "LIC12345",
    "isActive": true,
    "subscription": {
      "status": "ACTIVE",
      "startDate": "2025-09-03T10:00:00.000Z",
      "endDate": "2025-10-03T10:00:00.000Z",
      "plan": {
        "name": "Basic Plan",
        "price": 29.99
      }
    },
    "_count": {
      "users": 5,
      "patients": 120
    }
  },
  "message": "Hospital profile fetched successfully",
  "success": true
}
```

### 6. Update Hospital Profile
```http
PUT /auth/hospital/profile
```
*Requires Admin authentication*

**Request Body:**
```json
{
  "name": "Updated Hospital Name",
  "address": "456 New Address",
  "phone": "+1-555-9999",
  "website": "https://newhospital.com"
}
```

### 7. Logout
```http
POST /auth/logout
```
*Requires authentication*

**Response:**
```json
{
  "statusCode": 200,
  "data": null,
  "message": "Logged out successfully",
  "success": true
}
```

---

## 🚨 Error Responses

### Validation Error (400)
```json
{
  "success": false,
  "message": "\"email\" is required"
}
```

### Unauthorized (401)
```json
{
  "success": false,
  "message": "Access token required"
}
```

### Forbidden (403)
```json
{
  "success": false,
  "message": "Access denied"
}
```

### Not Found (404)
```json
{
  "success": false,
  "message": "Record not found"
}
```

### Conflict (409)
```json
{
  "success": false,
  "message": "Email already registered"
}
```

### Server Error (500)
```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

## 📋 Request/Response Standards

### Standard Response Format
```json
{
  "statusCode": 200,
  "data": {},
  "message": "Success message",
  "success": true
}
```

### Headers
```
Content-Type: application/json
Authorization: Bearer <token> (when required)
```

### HTTP Status Codes
- `200` - OK
- `201` - Created  
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `422` - Unprocessable Entity
- `500` - Internal Server Error

---

## 🔐 Authentication Flow

### For SuperAdmin:
1. POST `/superadmin/login` with credentials
2. Receive JWT token in cookie and response
3. Use token for subsequent requests
4. POST `/superadmin/logout` to clear session

### For Hospital Admin:
1. POST `/auth/register` to create hospital and admin account
2. Or POST `/auth/login` with existing credentials  
3. Receive JWT token in cookie and response
4. Use token for subsequent requests
5. POST `/auth/logout` to clear session

---

## 📱 Rate Limiting
- **Limit**: 100 requests per 15 minutes per IP
- **Response**: `429 Too Many Requests`

---

## 🔒 Security Features
- JWT tokens with expiration
- HTTP-only cookies
- Password hashing (bcrypt)
- Input validation (Joi)
- SQL injection prevention (Prisma)
- CORS protection
- Security headers (Helmet)
- Rate limiting

---

## 🧪 Testing with Postman

Import the provided `postman_collection.json` file to test all endpoints with pre-configured requests.

### Environment Variables:
```
baseUrl: http://localhost:3000/api/v1
```

---

## 📝 Notes

1. All timestamps are in ISO 8601 format
2. UUIDs are used for all entity IDs  
3. Passwords must be at least 6 characters
4. Email addresses must be valid format
5. JWT tokens expire after 7 days by default
6. Subscription durations are in days (default: 30)
7. Currency is USD by default
8. All endpoints return JSON responses
