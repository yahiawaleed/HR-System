# MongoDB Setup Guide

## Option 1: Docker (Recommended - Easiest)

### Step 1: Start Docker Desktop
1. Open **Docker Desktop** application on your Mac
2. Wait for it to fully start (whale icon in menu bar should be steady)

### Step 2: Start MongoDB Container
Once Docker is running, execute:
```bash
docker run -d -p 27017:27017 --name mongodb-hr-system -e MONGO_INITDB_DATABASE=hr-system mongo:latest
```

### Step 3: Verify MongoDB is Running
```bash
docker ps | grep mongodb
```

You should see the container running.

### To Stop MongoDB Later:
```bash
docker stop mongodb-hr-system
```

### To Start MongoDB Again:
```bash
docker start mongodb-hr-system
```

---

## Option 2: MongoDB Atlas (Cloud - No Installation Needed)

### Step 1: Create Free Account
1. Go to https://www.mongodb.com/cloud/atlas/register
2. Sign up for a free account

### Step 2: Create a Cluster
1. Click "Build a Database"
2. Choose "FREE" tier (M0)
3. Select a cloud provider and region
4. Click "Create"

### Step 3: Get Connection String
1. Click "Connect" on your cluster
2. Choose "Connect your application"
3. Copy the connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/`)

### Step 4: Update Backend .env
Edit `backend/.env`:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/hr-system?retryWrites=true&w=majority
```

Replace `username` and `password` with your Atlas credentials.

### Step 5: Whitelist Your IP
1. In Atlas, go to "Network Access"
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (for development) or add your IP

---

## Option 3: Install MongoDB Locally (macOS)

### Using Homebrew Tap
```bash
# Add MongoDB tap
brew tap mongodb/brew

# Install MongoDB
brew install mongodb-community

# Start MongoDB
brew services start mongodb-community
```

### Verify Installation
```bash
mongosh
# Or older versions: mongo
```

---

## Quick Test

Once MongoDB is running (any option), test the connection:

```bash
# If using local MongoDB or Docker:
mongosh mongodb://localhost:27017/hr-system

# Or test from Node.js:
node -e "const mongoose = require('mongoose'); mongoose.connect('mongodb://localhost:27017/hr-system').then(() => console.log('Connected!')).catch(e => console.error(e));"
```

---

## Recommended: Use Docker

Docker is the easiest option because:
- ✅ No complex installation
- ✅ Easy to start/stop
- ✅ Works the same on all systems
- ✅ Can easily reset database

Just make sure Docker Desktop is running before starting the container!

