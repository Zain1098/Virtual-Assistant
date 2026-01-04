# MongoDB Setup Instructions

## Option 1: Install MongoDB Locally (Recommended)

### Windows:
1. Download MongoDB Community Server from: https://www.mongodb.com/try/download/community
2. Install with default settings
3. MongoDB will run automatically on port 27017

### Quick Test:
```bash
# Check if MongoDB is running
netstat -an | findstr :27017
```

## Option 2: Use MongoDB Atlas (Cloud)

1. Go to https://www.mongodb.com/atlas
2. Create free account
3. Create cluster
4. Get connection string
5. Update connection string in database-server.js

## Option 3: Use Docker (Alternative)

```bash
# Run MongoDB in Docker
docker run -d --name mongodb -p 27017:27017 mongo:latest
```

## Start the Database Server:

```bash
node database-server.js
```

## Features with Database:
- ✅ Permanent data storage
- ✅ User management
- ✅ Task persistence
- ✅ Reminder storage
- ✅ Conversation history
- ✅ Statistics tracking
- ✅ Multi-user support

## Database Collections:
- users: User information
- tasks: User tasks
- reminders: User reminders  
- conversations: Chat history