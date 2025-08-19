# Barbershop Management System - Backend API

A robust Node.js/Express backend API for managing barbershop operations including appointments, services, barbers, and payments.

## 🚀 Features

- **User Authentication**: JWT-based authentication with bcrypt password hashing
- **Appointment Management**: Create, reschedule, and cancel appointments
- **Service Catalog**: Manage barbershop services with pricing and duration
- **Barber Management**: Track barber profiles, specialties, and schedules
- **Payment Integration**: Stripe payment processing
- **Admin Panel**: Administrative functions for managing appointments and users
- **Loyalty System**: Points-based reward system for customers
- **Search & Filtering**: Advanced service search with category and price filters

## 🛠️ Tech Stack

- **Runtime**: Node.js 16+
- **Framework**: Express.js 5.x
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT + bcryptjs
- **Payment**: Stripe API
- **Validation**: express-validator
- **Process Management**: PM2 (production)
- **Containerization**: Docker & Docker Compose

## 📋 Prerequisites

- Node.js 16+ and npm 8+
- MongoDB database (local or cloud)
- Stripe account for payment processing
- Git for version control

## 🚀 Quick Start

### 1. Clone and Install

```bash
cd Server
npm install
```

### 2. Environment Setup

```bash
# Copy environment template
cp env.example .env

# Edit .env with your configuration
nano .env
```

### 3. Database Setup

Ensure your MongoDB is running and update the `MONGODB_URI` in your `.env` file.

### 4. Seed Database

```bash
npm run seed
```

### 5. Start Development Server

```bash
npm run dev
```

The API will be available at `http://localhost:3000`

## 🐳 Docker Development

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f api

# Stop services
docker-compose down
```

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Customer registration
- `POST /api/auth/login` - Customer login

### Services
- `GET /api/services` - List all services
- `GET /api/services/:id` - Get service details

### Barbers
- `GET /api/barbers` - List all barbers
- `GET /api/barbers/:id` - Get barber details

### Appointments
- `GET /api/appointments` - Get user appointments
- `POST /api/appointments` - Create appointment
- `PUT /api/appointments/:id/cancel` - Cancel appointment
- `PUT /api/appointments/:id/reschedule` - Reschedule appointment

### Payments
- `POST /api/payments/create-payment-intent` - Create Stripe payment intent
- `POST /api/payments/confirm` - Confirm payment

### User Profile
- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update user profile

### Admin (Admin users only)
- `GET /api/admin/appointments` - Get all appointments
- `PUT /api/admin/appointments/:id/status` - Update appointment status

### Utilities
- `GET /api/search` - Search services
- `GET /api/health` - Health check
- `GET /` - API status

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | Required |
| `JWT_SECRET` | JWT signing secret | Required |
| `STRIPE_SECRET_KEY` | Stripe secret key | Required |
| `PORT` | Server port | 3000 |
| `NODE_ENV` | Environment mode | development |
| `CORS_ORIGIN` | Allowed CORS origins | * |

### Database Models

- **Customer**: User accounts with preferences and loyalty points
- **Barber**: Barber profiles with specialties and schedules
- **Service**: Service offerings with pricing and duration
- **Appointment**: Booking records with status tracking

## 🚀 Production Deployment

### Option 1: PM2 (Recommended)

```bash
# Install PM2 globally
npm install -g pm2

# Deploy using script
./deploy.sh          # Linux/Mac
deploy.bat           # Windows

# Or manually
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

### Option 2: Docker Production

```bash
# Build image
docker build -t barbershop-api .

# Run container
docker run -d \
  --name barbershop-api \
  -p 3000:3000 \
  --env-file .env \
  --restart unless-stopped \
  barbershop-api
```

### Option 3: Cloud Platforms

- **Heroku**: Use Heroku CLI with environment variables
- **Railway**: Connect GitHub and set environment variables
- **Render**: Connect repository and configure environment

## 📊 Monitoring

- **PM2 Dashboard**: `pm2 monit`
- **Logs**: `pm2 logs barbershop-api`
- **Health Check**: `/api/health`
- **Status**: `pm2 status`

## 🔒 Security Features

- JWT token authentication
- Password hashing with bcrypt
- Input validation with express-validator
- CORS configuration
- Environment variable protection
- Rate limiting ready (can be added)

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test

# Health check
curl http://localhost:3000/api/health
```

## 📁 Project Structure

```
Server/
├── models/           # Database models
├── logs/            # Application logs
├── barbers/         # Barber images
├── index.js         # Main application file
├── db.js            # Database connection
├── seedData.js      # Database seeding
├── ecosystem.config.js # PM2 configuration
├── Dockerfile       # Docker configuration
├── docker-compose.yml # Docker Compose
├── deploy.sh        # Linux/Mac deployment script
├── deploy.bat       # Windows deployment script
├── DEPLOYMENT.md    # Detailed deployment guide
└── README.md        # This file
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

This project is licensed under the ISC License.

## 🆘 Support

For issues and questions:
1. Check the troubleshooting section in `DEPLOYMENT.md`
2. Review the logs: `pm2 logs barbershop-api`
3. Check the health endpoint: `/api/health`
4. Verify environment variables are set correctly

## 🔄 Updates

To update the application:

```bash
# Pull latest changes
git pull origin main

# Install new dependencies
npm install

# Restart the application
pm2 restart barbershop-api
```

---

**Happy Coding! 🎉**
