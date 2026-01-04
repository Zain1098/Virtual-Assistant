const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Shifra AI Server Running!' });
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  socket.on('voice-command', (data) => {
    const command = data.command.toLowerCase();
    let response = { response: `I heard: ${data.command}`, action: 'speak' };

    if (command.includes('open youtube')) {
      response = { response: 'Opening YouTube...', action: 'speak', url: 'https://youtube.com' };
    } else if (command.includes('open google')) {
      response = { response: 'Opening Google...', action: 'speak', url: 'https://google.com' };
    } else if (command.includes('time')) {
      response = { response: `The time is ${new Date().toLocaleTimeString()}`, action: 'speak' };
    } else if (command.includes('hello')) {
      response = { response: 'Hello! How can I help you?', action: 'speak' };
    }

    socket.emit('assistant-response', response);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = 8000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Socket.io ready for connections`);
});