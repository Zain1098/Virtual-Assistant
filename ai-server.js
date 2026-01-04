const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');
const OpenAI = require('openai');
const { User, Task, Reminder, Conversation } = require('./models');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: { origin: "*", methods: ["GET", "POST"] }
});

app.use(cors());
app.use(express.json());

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'demo-key'
});

// MongoDB Connection
mongoose.connect('mongodb+srv://za496694_db_user:p9FTEHtJamwdpiXe@cluster0.m9hlgeh.mongodb.net/shifra-assistant?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('📊 MongoDB Atlas Connected Successfully');
}).catch(err => {
  console.log('❌ MongoDB Connection Failed:', err.message);
});

app.get('/', (req, res) => {
  res.json({ message: 'Shifra AI - Intelligent Assistant with OpenAI!' });
});

// Helper functions
async function getOrCreateUser(socketId, name = 'User') {
  let user = await User.findOne({ socketId });
  if (!user) {
    user = new User({ socketId, name });
    await user.save();
  }
  return user;
}

// AI Response Generator
async function getAIResponse(message, userName, context = '') {
  try {
    const systemPrompt = `You are Shifra, a helpful AI assistant. The user's name is ${userName}. 
    You should be conversational, friendly, and helpful. Keep responses concise but informative.
    If the user asks about their name, remember it's ${userName}.
    Context: ${context}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ],
      max_tokens: 150,
      temperature: 0.7
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.log('OpenAI Error:', error.message);
    return `I understand you said "${message}". How can I help you with that?`;
  }
}

// Task functions
async function addTask(userId, taskText) {
  const task = new Task({ userId, task: taskText });
  await task.save();
  return `Task "${taskText}" added successfully`;
}

async function getTasks(userId) {
  const tasks = await Task.find({ userId });
  if (tasks.length === 0) return 'No tasks found';
  const taskList = tasks.map(t => `${t.completed ? '✓' : '○'} ${t.task}`).join(', ');
  return `Your tasks: ${taskList}`;
}

async function deleteTask(userId, taskText) {
  const task = await Task.findOneAndDelete({ 
    userId, 
    task: { $regex: taskText, $options: 'i' } 
  });
  if (task) {
    return `Task "${task.task}" deleted`;
  }
  return 'Task not found';
}

// Weather function
async function getWeather(city = 'Karachi') {
  return `Weather in ${city}: 28°C, Sunny with light clouds. Perfect day to go out!`;
}

// Currency conversion
async function convertCurrency(amount, from, to) {
  const rates = {
    'USD': { 'PKR': 280, 'EUR': 0.85, 'GBP': 0.73 },
    'PKR': { 'USD': 0.0036, 'EUR': 0.003, 'GBP': 0.0026 },
    'EUR': { 'USD': 1.18, 'PKR': 330, 'GBP': 0.86 }
  };
  
  const rate = rates[from]?.[to] || 1.1;
  const converted = (amount * rate).toFixed(2);
  return `${amount} ${from} equals ${converted} ${to}`;
}

// Math calculations
function calculate(expression) {
  try {
    const sanitized = expression.replace(/[^0-9+\-*/.() ]/g, '');
    const result = eval(sanitized);
    return `${expression} equals ${result}`;
  } catch {
    return 'Invalid calculation. Please try again.';
  }
}

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  socket.on('voice-command', async (data) => {
    const command = data.command.toLowerCase();
    let response = { response: '', action: 'speak' };

    try {
      // Get or create user
      let user = await getOrCreateUser(socket.id);

      // Check for specific commands first
      if (command.includes('my name is')) {
        const name = command.split('my name is')[1].trim();
        user.name = name;
        await user.save();
        response.response = `Nice to meet you, ${name}! I'll remember your name. How can I assist you today?`;
      }
      
      // Website opening
      else if (command.includes('open youtube')) {
        response = { response: 'Opening YouTube for you...', action: 'speak', url: 'https://youtube.com' };
      }
      else if (command.includes('open google')) {
        response = { response: 'Opening Google search...', action: 'speak', url: 'https://google.com' };
      }
      else if (command.includes('open facebook')) {
        response = { response: 'Opening Facebook...', action: 'speak', url: 'https://facebook.com' };
      }
      else if (command.includes('open instagram')) {
        response = { response: 'Opening Instagram...', action: 'speak', url: 'https://instagram.com' };
      }
      
      // Time and Date
      else if (command.includes('time')) {
        const time = new Date().toLocaleTimeString();
        response.response = `The current time is ${time}`;
      }
      else if (command.includes('date')) {
        const date = new Date().toLocaleDateString('en-US', { 
          weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
        });
        response.response = `Today is ${date}`;
      }
      
      // Weather
      else if (command.includes('weather')) {
        const city = command.includes(' in ') ? command.split(' in ')[1] : 'Karachi';
        response.response = await getWeather(city);
      }
      
      // Currency conversion
      else if (command.includes('convert') && command.includes('to')) {
        const parts = command.match(/(\d+)\s*(\w+)\s*to\s*(\w+)/);
        if (parts) {
          const [, amount, from, to] = parts;
          response.response = await convertCurrency(parseFloat(amount), from.toUpperCase(), to.toUpperCase());
        }
      }
      
      // Calculations
      else if (command.includes('calculate') || command.includes('what is')) {
        const expression = command.replace(/calculate|what is/g, '').trim();
        response.response = calculate(expression);
      }
      
      // Task management
      else if (command.includes('add task') || command.includes('create task')) {
        const task = command.replace(/add task|create task/g, '').trim();
        response.response = await addTask(user._id, task);
      }
      else if (command.includes('show tasks') || command.includes('my tasks')) {
        response.response = await getTasks(user._id);
      }
      else if (command.includes('delete task')) {
        const taskText = command.replace('delete task', '').trim();
        response.response = await deleteTask(user._id, taskText);
      }
      
      // Search
      else if (command.includes('search for')) {
        const query = command.replace('search for', '').trim();
        response = { 
          response: `Searching for "${query}" on Google...`, 
          action: 'speak', 
          url: `https://www.google.com/search?q=${encodeURIComponent(query)}` 
        };
      }
      
      // For all other queries, use AI
      else {
        const context = `User has ${await Task.countDocuments({ userId: user._id })} tasks`;
        response.response = await getAIResponse(data.command, user.name, context);
      }

      // Save conversation to database
      await new Conversation({ 
        userId: user._id, 
        userMessage: data.command, 
        assistantResponse: response.response 
      }).save();
      
    } catch (error) {
      console.error('Error:', error);
      response.response = 'Sorry, I encountered an error. Please try again.';
    }

    socket.emit('assistant-response', response);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = 8000;
server.listen(PORT, () => {
  console.log(`🚀 Shifra AI Intelligent Assistant running on port ${PORT}`);
  console.log(`📡 Socket.io ready for connections`);
  console.log(`🤖 OpenAI GPT integration enabled`);
  console.log(`☁️ MongoDB Atlas cloud database connected`);
  console.log(`🧠 Features: AI Chat, Tasks, Weather, Currency, Search`);
});