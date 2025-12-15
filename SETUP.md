# HR System - Setup and Running Guide

## Prerequisites

Before running the application, make sure you have:

1. **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
2. **MongoDB** - Either:
   - Local MongoDB installation
   - MongoDB Atlas account (cloud)
   - Docker with MongoDB

## Quick Start

### 1. Set Up MongoDB

#### Option A: Local MongoDB
```bash
# Install MongoDB locally (macOS with Homebrew)
brew install mongodb-community

# Start MongoDB
brew services start mongodb-community
```

#### Option B: MongoDB Atlas (Cloud)
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Get your connection string

#### Option C: Docker
```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### 2. Set Up Backend

```bash
# Navigate to backend directory
cd backend

# Install dependencies (if not already installed)
npm install

# Create .env file
cp .env.example .env

# Edit .env file with your MongoDB connection string
# For local MongoDB: MONGODB_URI=mongodb://localhost:27017/hr-system
# For MongoDB Atlas: MONGODB_URI=your-atlas-connection-string

# Start the backend server
npm run start:dev
```

The backend will run on **http://localhost:3000**

### 3. Set Up Frontend

Open a **new terminal window**:

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies (if not already installed)
npm install

# Create .env.local file
echo "NEXT_PUBLIC_API_URL=http://localhost:3000" > .env.local

# Start the frontend server
npm run dev
```

The frontend will run on **http://localhost:3001**

## Running the Application

### Development Mode

**Terminal 1 - Backend:**
```bash
cd backend
npm run start:dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### Access the Application

1. Open your browser and go to: **http://localhost:3001**
2. You'll be redirected to the login page
3. Register a new account or login

## First Steps

### 1. Register an Admin User

1. Go to **http://localhost:3001/register**
2. Register with:
   - Email: admin@example.com
   - Password: (your choice)
   - Role: `system_admin`

### 2. Login

1. Go to **http://localhost:3001/login**
2. Login with your credentials
3. You'll be redirected to the dashboard

### 3. Create Initial Data

Once logged in, you can:
- Create departments
- Create positions
- Create employees
- Set up payroll configuration
- And more!

## Environment Variables

### Backend (.env)

```env
MONGODB_URI=mongodb://localhost:27017/hr-system
JWT_SECRET=your-secret-key-change-in-production
PORT=3000
FRONTEND_URL=http://localhost:3001
```

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## Troubleshooting

### Backend Issues

**Port already in use:**
```bash
# Change PORT in backend/.env or kill the process using port 3000
lsof -ti:3000 | xargs kill -9
```

**MongoDB connection error:**
- Make sure MongoDB is running
- Check your MONGODB_URI in `.env`
- For MongoDB Atlas, ensure your IP is whitelisted

**Module not found errors:**
```bash
cd backend
npm install
```

### Frontend Issues

**Port already in use:**
```bash
# Next.js will automatically use the next available port (3002, 3003, etc.)
# Or specify a port:
npm run dev -- -p 3002
```

**API connection errors:**
- Make sure backend is running on port 3000
- Check NEXT_PUBLIC_API_URL in `.env.local`
- Check browser console for CORS errors

**Build errors:**
```bash
cd frontend
rm -rf .next
npm install
npm run dev
```

## Production Build

### Backend

```bash
cd backend
npm run build
npm run start:prod
```

### Frontend

```bash
cd frontend
npm run build
npm start
```

## API Endpoints

Once the backend is running, you can test it:

```bash
# Health check
curl http://localhost:3000

# Register user
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","role":"employee"}'

# Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

## Project Structure

```
payroll-system/
├── backend/          # NestJS backend
│   ├── src/
│   ├── .env         # Backend environment variables
│   └── package.json
├── frontend/        # Next.js frontend
│   ├── app/
│   ├── .env.local   # Frontend environment variables
│   └── package.json
└── SETUP.md         # This file
```

## Need Help?

- Check the README files in `backend/` and `frontend/` directories
- Review the API documentation in `backend/README.md`
- Check console logs for error messages

