# Quick Start Guide

## ✅ MongoDB is Running!

MongoDB Community Edition is now installed and running locally.

## Next Steps

### 1. Start the Backend (Terminal 1)

```bash
cd backend
npm run start:dev
```

Wait for: `Application is running on: http://localhost:3000`

### 2. Start the Frontend (Terminal 2 - New Terminal)

```bash
cd frontend
npm run dev
```

Wait for: `Ready - started server on 0.0.0.0:3001`

### 3. Open Your Browser

Go to: **http://localhost:3001**

### 4. Register Your First User

1. Click "create a new account" or go to `/register`
2. Fill in:
   - Email: `admin@example.com`
   - Password: (choose a password)
   - Role: Select `SYSTEM_ADMIN` for full access
3. Click "Create account"

### 5. Login and Start Using!

After registration, you'll be automatically logged in and redirected to the dashboard.

## Useful Commands

### MongoDB Commands
```bash
# Check MongoDB status
brew services list | grep mongodb

# Stop MongoDB
brew services stop mongodb/brew/mongodb-community

# Start MongoDB
brew services start mongodb/brew/mongodb-community

# Connect to MongoDB shell
mongosh
```

### Backend Commands
```bash
cd backend
npm run start:dev    # Development mode with hot reload
npm run build        # Build for production
npm run start:prod   # Run production build
```

### Frontend Commands
```bash
cd frontend
npm run dev          # Development mode
npm run build        # Build for production
npm start            # Run production build
```

## Troubleshooting

**Backend won't start:**
- Make sure MongoDB is running: `brew services list | grep mongodb`
- Check port 3000 isn't in use: `lsof -ti:3000`

**Frontend won't connect:**
- Make sure backend is running first
- Check `.env.local` has: `NEXT_PUBLIC_API_URL=http://localhost:3000`

**MongoDB connection error:**
- Restart MongoDB: `brew services restart mongodb/brew/mongodb-community`

## You're All Set! 🎉

Your HR System is ready to use. Start with creating departments and positions, then add employees!

