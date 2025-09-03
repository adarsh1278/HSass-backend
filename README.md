# Hospital SaaS Backend

A scalable hospital management SaaS system built with Node.js, Express, Prisma, and PostgreSQL.

## Features

- **Multi-tenant Architecture**: Each hospital has isolated data
- **Role-based Access Control**: SuperAdmin, Admin, Doctor, Nurse, Staff, Lab Tech, etc.
- **Subscription Management**: Flexible subscription plans with feature toggles
- **Authentication & Authorization**: JWT-based auth with secure cookies
- **Modular Design**: OPD, IPD, Lab, Pharmacy, Billing modules
- **Scalable Database Schema**: Designed for future enhancements

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with httpOnly cookies
- **Validation**: Joi
- **Security**: Helmet, Rate Limiting, CORS

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Setup
Create `.env` file with:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/hospital_saas"
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="7d"
NODE_ENV="development"
PORT=3000
```

### 3. Database Setup
```bash
# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate

# Seed database with initial data
npm run db:seed
```

### 4. Start Server
```bash
# Development
npm run dev

# Production
npm start
```

## API Endpoints

### SuperAdmin Routes (`/api/v1/superadmin`)
- `POST /login` - SuperAdmin login
- `GET /subscription-plans` - Get all plans
- `POST /subscription-plans` - Create new plan
- `GET /hospitals` - Get all hospitals
- `GET /dashboard/stats` - Dashboard statistics

### Authentication Routes (`/api/v1/auth`)
- `POST /register` - Register hospital & admin
- `POST /login` - Hospital admin login  
- `GET /plans` - Get available subscription plans
- `POST /subscription/purchase` - Purchase/update subscription
- `GET /hospital/profile` - Get hospital profile
- `PUT /hospital/profile` - Update hospital profile

### Health Check
- `GET /api/v1/health` - API health status

## Default Credentials

**SuperAdmin:**
- Email: `superadmin@hospital.com`
- Password: `superadmin123`

⚠️ **Change default credentials in production!**

## Database Schema

### Key Models:
- **SuperAdmin**: Platform administrators
- **Hospital**: Multi-tenant hospital entities
- **SubscriptionPlan**: Flexible pricing plans
- **Subscription**: Hospital subscriptions
- **User**: Hospital staff with role-based access
- **Patient**: Patient management
- **Appointment**: OPD appointments
- **IPDRecord**: Inpatient records
- **LabReport**: Laboratory results
- **Invoice**: Billing system
- **Inventory**: Stock management

## Security Features

- Password hashing with bcrypt
- JWT tokens with httpOnly cookies
- Rate limiting (100 requests/15min)
- CORS protection
- Helmet security headers
- Input validation with Joi
- SQL injection protection via Prisma

## Error Handling

- Global error handler
- Custom ApiError class
- Structured error responses
- Prisma error mapping

## Development

```bash
# Run in development mode
npm run dev

# Generate Prisma client after schema changes
npm run db:generate

# Create and apply migration
npm run db:migrate

# Reset database (development only)
npx prisma migrate reset
```

## Project Structure

```
backend/
├── prisma/
│   ├── schema.prisma
│   └── seed.js
├── src/
│   ├── controllers/
│   ├── middleware/
│   ├── routes/
│   └── utils/
├── app.js
├── package.json
└── README.md
```

## Scaling Considerations

- **Role System**: Extensible role-based permissions
- **Module System**: Easy to add new hospital modules
- **Multi-tenancy**: Isolated hospital data
- **Subscription Features**: Dynamic feature toggles
- **Database Indexing**: Optimized for performance
- **Caching**: Ready for Redis integration
- **Monitoring**: Structured for APM tools

## License

MIT License
