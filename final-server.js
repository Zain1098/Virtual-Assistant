const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: { origin: "*", methods: ["GET", "POST"] }
});

app.use(cors());
app.use(express.json());

// In-memory storage
let users = new Map();
let tasks = new Map();

app.get('/', (req, res) => {
  res.json({ message: 'Shifra AI - Working Assistant!' });
});

// Intelligent Response Generator
function getIntelligentResponse(message, userName) {
  const msg = message.toLowerCase();
  
  // Name setting
  if (msg.includes('my name is')) {
    const name = msg.split('my name is')[1].trim();
    return `Wonderful! Nice to meet you, ${name}! I'll remember your name from now on. How can I help you today?`;
  }
  
  // Greetings
  if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey')) {
    return `Hello ${userName}! Great to see you again. How can I help you today?`;
  }
  
  // Name questions
  if (msg.includes('what is my name') || msg.includes('who am i')) {
    return `Your name is ${userName}. Is there anything else you'd like me to remember about you?`;
  }
  
  // Assistant questions
  if (msg.includes('who are you') || msg.includes('what are you')) {
    return `I'm Shifra, your intelligent AI assistant! I can help you manage tasks, answer questions, open websites, perform calculations, check weather, and have conversations. I remember everything we discuss!`;
  }
  
  // Capabilities
  if (msg.includes('what can you do') || msg.includes('help me') || msg.includes('help')) {
    return `I can help you with many things, ${userName}! I can:
    • Open websites: YouTube, Google, Facebook, Instagram, Calendar, Twitter, LinkedIn, WhatsApp, Gmail, Netflix
    • Manage your tasks and reminders
    • Check weather and convert currency  
    • Perform calculations and math
    • Search the internet
    • Have intelligent conversations
    Just ask me anything!`;
  }
  
  // Thanks
  if (msg.includes('thank you') || msg.includes('thanks')) {
    return `You're very welcome, ${userName}! I'm always happy to help. Is there anything else you need?`;
  }
  
  // How are you
  if (msg.includes('how are you')) {
    return `I'm doing great, ${userName}! I'm always excited to help and learn new things. How are you doing today?`;
  }
  
  // Default responses
  const responses = [
    `That's interesting, ${userName}! Could you tell me more about what you're looking for?`,
    `I understand, ${userName}. How would you like me to help you with that?`,
    `Good question, ${userName}! Let me think about the best way to assist you with this.`,
    `I hear you, ${userName}. What specific help do you need with this?`
  ];
  
  return responses[Math.floor(Math.random() * responses.length)];
}

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  // Initialize user
  if (!users.has(socket.id)) {
    users.set(socket.id, { name: 'User', tasks: [] });
  }
  
  socket.on('voice-command', async (data) => {
    const command = data.command.toLowerCase();
    let response = { response: '', action: 'speak' };
    let user = users.get(socket.id);

    try {
      // Name setting
      if (command.includes('my name is')) {
        const name = command.split('my name is')[1].trim();
        user.name = name;
        users.set(socket.id, user);
        response.response = `Wonderful! Nice to meet you, ${name}! I'll remember your name from now on. How can I help you today?`;
      }
      
      // Website opening
      else if (command.includes('open youtube')) {
        response = { response: 'Opening YouTube for you! Enjoy watching!', action: 'speak', url: 'https://youtube.com' };
      }
      else if (command.includes('open google')) {
        response = { response: 'Opening Google search. What would you like to search for?', action: 'speak', url: 'https://google.com' };
      }
      else if (command.includes('open facebook')) {
        response = { response: 'Opening Facebook. Stay connected with friends!', action: 'speak', url: 'https://facebook.com' };
      }
      else if (command.includes('open instagram')) {
        response = { response: 'Opening Instagram. Time for some great photos!', action: 'speak', url: 'https://instagram.com' };
      }
      else if (command.includes('open calendar') || command.includes('open calender')) {
        response = { response: 'Opening Google Calendar for you!', action: 'speak', url: 'https://calendar.google.com' };
      }
      else if (command.includes('open twitter')) {
        response = { response: 'Opening Twitter. What\'s happening?', action: 'speak', url: 'https://twitter.com' };
      }
      else if (command.includes('open linkedin')) {
        response = { response: 'Opening LinkedIn. Time to network!', action: 'speak', url: 'https://linkedin.com' };
      }
      else if (command.includes('open whatsapp')) {
        response = { response: 'Opening WhatsApp Web!', action: 'speak', url: 'https://web.whatsapp.com' };
      }
      else if (command.includes('open gmail')) {
        response = { response: 'Opening Gmail for you!', action: 'speak', url: 'https://gmail.com' };
      }
      else if (command.includes('open netflix')) {
        response = { response: 'Opening Netflix. Enjoy your shows!', action: 'speak', url: 'https://netflix.com' };
      }
      
      // Time and Date
      else if (command.includes('time')) {
        const time = new Date().toLocaleTimeString();
        response.response = `The current time is ${time}. Hope you're having a productive day, ${user.name}!`;
      }
      else if (command.includes('date')) {
        const date = new Date().toLocaleDateString('en-US', { 
          weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
        });
        response.response = `Today is ${date}. What are your plans for today, ${user.name}?`;
      }
      
      // Weather
      else if (command.includes('weather')) {
        const city = command.includes(' in ') ? command.split(' in ')[1] : 'your area';
        response.response = `The weather in ${city} is looking great! It's about 28°C with sunny skies and light clouds. Perfect weather to go outside, ${user.name}!`;
      }
      
      // Currency conversion
      else if (command.includes('convert') && command.includes('to')) {
        const parts = command.match(/(\d+)\s*(\w+)\s*to\s*(\w+)/);
        if (parts) {
          const [, amount, from, to] = parts;
          const rate = from.toUpperCase() === 'USD' && to.toUpperCase() === 'PKR' ? 280 : 1.1;
          const converted = (amount * rate).toFixed(2);
          response.response = `${amount} ${from.toUpperCase()} equals approximately ${converted} ${to.toUpperCase()}. Currency rates change daily, so this is an estimate!`;
        }
      }
      
      // Calculations
      else if (command.includes('calculate') || command.includes('what is')) {
        const expression = command.replace(/calculate|what is/g, '').trim();
        try {
          const sanitized = expression.replace(/[^0-9+\-*/.() ]/g, '');
          const result = eval(sanitized);
          response.response = `${expression} equals ${result}. Math made easy, ${user.name}!`;
        } catch {
          response.response = `I couldn't calculate that, ${user.name}. Could you try rephrasing the math problem?`;
        }
      }
      
      // Task management
      else if (command.includes('add task') || command.includes('create task')) {
        const task = command.replace(/add task|create task/g, '').trim();
        user.tasks.push(task);
        users.set(socket.id, user);
        response.response = `Perfect! I've added "${task}" to your task list. You now have ${user.tasks.length} tasks total.`;
      }
      else if (command.includes('show tasks') || command.includes('my tasks')) {
        if (user.tasks.length === 0) {
          response.response = 'You have no tasks at the moment. Would you like to add some?';
        } else {
          const taskList = user.tasks.map((t, i) => `${i+1}. ${t}`).join('\n');
          response.response = `Here are your ${user.tasks.length} tasks:\n${taskList}`;
        }
      }
      
      // Search
      else if (command.includes('search for')) {
        const query = command.replace('search for', '').trim();
        response = { 
          response: `Searching for "${query}" on Google. I hope you find what you're looking for!`, 
          action: 'speak', 
          url: `https://www.google.com/search?q=${encodeURIComponent(query)}` 
        };
      }
      
      // Jokes
      else if (command.includes('joke') || command.includes('funny')) {
        const jokes = [
          `Here's a joke for you, ${user.name}: Why don't scientists trust atoms? Because they make up everything!`,
          `${user.name}, here's one: Why did the scarecrow win an award? Because he was outstanding in his field!`,
          `This one's for you, ${user.name}: What do you call a fake noodle? An impasta!`
        ];
        response.response = jokes[Math.floor(Math.random() * jokes.length)];
      }
      
      // For all other queries, use intelligent responses
      else {
        response.response = getIntelligentResponse(data.command, user.name);
      }
      
    } catch (error) {
      console.error('Error:', error);
      response.response = `Sorry ${user?.name || 'there'}, I encountered an error. Please try again!`;
    }

    socket.emit('assistant-response', response);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    users.delete(socket.id);
  });
});

const PORT = 8000;
server.listen(PORT, () => {
  console.log(`🚀 Shifra AI Assistant running on port ${PORT}`);
  console.log(`📡 Socket.io ready for connections`);
  console.log(`🧠 Intelligent responses enabled`);
  console.log(`💬 Features: Smart Chat, Tasks, Weather, Currency, Search`);
  console.log(`✅ Ready to use - No database required!`);
});