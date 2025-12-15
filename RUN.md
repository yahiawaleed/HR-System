# Quick Run Guide

## Step 1: Start MongoDB
```bash
# If using local MongoDB:
brew services start mongodb-community

# Or using Docker:
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

## Step 2: Start Backend
```bash
cd backend
npm install  # Only first time
cp .env.example .env  # Only first time
npm run start:dev
```
Backend runs on: http://localhost:3000

## Step 3: Start Frontend (new terminal)
```bash
cd frontend
npm install  # Only first time
echo "NEXT_PUBLIC_API_URL=http://localhost:3000" > .env.local  # Only first time
npm run dev
```
Frontend runs on: http://localhost:3001

## Step 4: Open Browser
Go to: http://localhost:3001

Register a new account and start using the system!
