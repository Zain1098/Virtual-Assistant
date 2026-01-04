const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: { origin: "*", methods: ["GET", "POST"] }
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/shifra-assistant', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/user', require('./routes/auth')); // Using same routes for user data

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Shifra AI Assistant API is running!' });
});

// Socket.io for real-time communication
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  socket.on('voice-command', async (data) => {
    try {
      const command = data.command.toLowerCase();
      let response = {
        response: `I heard: ${data.command}`,
        action: 'speak',
        type: 'conversation'
      };

      // Process different commands
      if (command.includes('open youtube')) {
        response = {
          response: 'Opening YouTube...',
          action: 'speak',
          type: 'command',
          url: 'https://youtube.com'
        };
      } else if (command.includes('open google')) {
        response = {
          response: 'Opening Google...',
          action: 'speak',
          type: 'command',
          url: 'https://google.com'
        };
      } else if (command.includes('open facebook')) {
        response = {
          response: 'Opening Facebook...',
          action: 'speak',
          type: 'command',
          url: 'https://facebook.com'
        };
      } else if (command.includes('time')) {
        const time = new Date().toLocaleTimeString();
        response = {
          response: `The time is ${time}`,
          action: 'speak',
          type: 'info'
        };
      } else if (command.includes('date')) {
        const date = new Date().toLocaleDateString();
        response = {
          response: `Today's date is ${date}`,
          action: 'speak',
          type: 'info'
        };
      } else if (command.includes('weather')) {
        response = {
          response: 'Opening weather information...',
          action: 'speak',
          type: 'command',
          url: 'https://www.accuweather.com'
        };
      } else if (command.includes('hello') || command.includes('hi')) {
        response = {
          response: 'Hello! How can I help you today?',
          action: 'speak',
          type: 'greeting'
        };
      } else if (command.includes('who are you')) {
        response = {
          response: 'I am Shifra, your AI virtual assistant created to help you with various tasks.',
          action: 'speak',
          type: 'info'
        };
      } else if (command.includes('joke')) {
        const jokes = [
          'Why don\'t scientists trust atoms? Because they make up everything!',
          'Why did the scarecrow win an award? Because he was outstanding in his field!',
          'What do you call a fake noodle? An impasta!'
        ];
        const randomJoke = jokes[Math.floor(Math.random() * jokes.length)];
        response = {
          response: randomJoke,
          action: 'speak',
          type: 'entertainment'
        };
      } else if (command.includes('calculate')) {
        const calculation = command.replace('calculate', '').trim();
        try {
          const result = eval(calculation.replace(/[^0-9+\-*/.() ]/g, ''));
          response = {
            response: `The result is ${result}`,
            action: 'speak',
            type: 'calculation'
          };
        } catch {
          response = {
            response: 'Sorry, I couldn\'t calculate that.',
            action: 'speak',
            type: 'error'
          };
        }
      }

      socket.emit('assistant-response', response);
    } catch (error) {
      socket.emit('error', { message: 'Processing failed' });
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Socket.io ready for connections`);
});