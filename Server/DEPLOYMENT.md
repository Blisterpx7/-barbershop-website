# Barbershop API Deployment Guide

## Prerequisites

- Node.js 16+ and npm 8+
- MongoDB database (local or cloud)
- Stripe account (for payments)
- PM2 (for production process management)

## Environment Setup

1. Copy `env.example` to `.env`:
```bash
cp env.example .env
```

2. Update the `.env` file with your configuration:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
JWT_SECRET=your-super-secret-jwt-key-here
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_publishable_key
PORT=3000
NODE_ENV=production
CORS_ORIGIN=https://yourdomain.com
```

## Local Development

### Using Docker (Recommended)
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f api

# Stop services
docker-compose down
```

### Using Node.js directly
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Seed database with sample data
npm run seed
```

## Production Deployment

### Option 1: PM2 (Recommended for VPS)

1. Install PM2 globally:
```bash
npm install -g pm2
```

2. Start the application:
```bash
pm2 start ecosystem.config.js --env production
```

3. Save PM2 configuration:
```bash
pm2 save
pm2 startup
```

4. Monitor the application:
```bash
pm2 monit
pm2 logs
```

### Option 2: Docker Production

1. Build the production image:
```bash
docker build -t barbershop-api .
```

2. Run the container:
```bash
docker run -d \
  --name barbershop-api \
  -p 3000:3000 \
  --env-file .env \
  --restart unless-stopped \
  barbershop-api
```

### Option 3: Cloud Platforms

#### Heroku
```bash
# Install Heroku CLI
heroku create your-app-name
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI=your_mongodb_uri
heroku config:set JWT_SECRET=your_jwt_secret
heroku config:set STRIPE_SECRET_KEY=your_stripe_key
git push heroku main
```

#### Railway
```bash
# Install Railway CLI
railway login
railway init
railway up
```

#### Render
- Connect your GitHub repository
- Set environment variables
- Deploy automatically on push

## Database Setup

1. Create a MongoDB database (local or cloud)
2. Update `MONGODB_URI` in your environment
3. Run the seed script to populate initial data:
```bash
npm run seed
```

## Security Considerations

1. **JWT Secret**: Use a strong, random secret key
2. **CORS**: Restrict origins to your frontend domain
3. **Rate Limiting**: Consider adding rate limiting middleware
4. **HTTPS**: Always use HTTPS in production
5. **Environment Variables**: Never commit `.env` files

## Monitoring and Logs

- Application logs are stored in `./logs/`
- Use PM2 or Docker logs for monitoring
- Set up health checks at `/api/health`
- Monitor MongoDB connection status

## Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**
   - Check connection string
   - Verify network access
   - Check credentials

2. **Port Already in Use**
   - Change PORT in environment
   - Kill existing process: `lsof -ti:3000 | xargs kill -9`

3. **JWT Token Issues**
   - Verify JWT_SECRET is set
   - Check token expiration

4. **Stripe Payment Issues**
   - Verify API keys
   - Check webhook configuration

### Health Check Endpoints

- `/api/health` - Basic health status
- `/` - API status with database stats

## Performance Optimization

1. **Database Indexing**: Add indexes for frequently queried fields
2. **Caching**: Consider Redis for session storage
3. **Compression**: Enable gzip compression
4. **Load Balancing**: Use multiple PM2 instances

## Backup and Recovery

1. **Database Backups**: Regular MongoDB backups
2. **Environment Backup**: Keep `.env` files secure
3. **Code Backup**: Use version control (Git)
4. **Process Recovery**: PM2 auto-restart on failure
