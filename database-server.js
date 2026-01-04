const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');
const { User, Task, Reminder, Conversation } = require('./models');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: { origin: "*", methods: ["GET", "POST"] }
});

app.use(cors());
app.use(express.json());

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
  res.json({ message: 'Shifra AI with MongoDB Atlas Cloud Database!' });
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

async function addReminder(userId, reminderText, time) {
  const reminder = new Reminder({ userId, reminder: reminderText, time });
  await reminder.save();
  return `Reminder set: "${reminderText}" for ${time}`;
}

async function getReminders(userId) {
  const reminders = await Reminder.find({ userId });
  if (reminders.length === 0) return 'No reminders found';
  const reminderList = reminders.map(r => `${r.reminder} (${r.time})`).join(', ');
  return `Your reminders: ${reminderList}`;
}

async function saveConversation(userId, userMessage, assistantResponse) {
  const conversation = new Conversation({ userId, userMessage, assistantResponse });
  await conversation.save();
}

async function getStats(userId) {
  const totalTasks = await Task.countDocuments({ userId });
  const completedTasks = await Task.countDocuments({ userId, completed: true });
  const totalReminders = await Reminder.countDocuments({ userId });
  const totalConversations = await Conversation.countDocuments({ userId });
  
  return {
    totalTasks,
    completedTasks,
    totalReminders,
    totalConversations
  };
}

// Weather function
async function getWeather(city = 'Karachi') {
  return `Weather in ${city}: 28°C, Sunny (Demo data)`;
}

// Currency conversion
async function convertCurrency(amount, from, to) {
  const rate = from === 'USD' && to === 'PKR' ? 280 : 1.1;
  return `${amount} ${from} = ${(amount * rate).toFixed(2)} ${to}`;
}

// Math calculations
function calculate(expression) {
  try {
    const sanitized = expression.replace(/[^0-9+\-*/.() ]/g, '');
    const result = eval(sanitized);
    return `${expression} = ${result}`;
  } catch {
    return 'Invalid calculation';
  }
}

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  socket.on('voice-command', async (data) => {
    const command = data.command.toLowerCase();
    let response = { response: `I heard: ${data.command}`, action: 'speak' };

    try {
      // Get or create user
      let user = await getOrCreateUser(socket.id);

      // Greetings
      if (command.includes('hello') || command.includes('hi') || command.includes('hey')) {
        response = { response: `Hello ${user.name}! How can I assist you today?`, action: 'speak' };
      }
      
      // Name setting
      else if (command.includes('my name is')) {
        const name = command.split('my name is')[1].trim();
        user.name = name;
        await user.save();
        response = { response: `Nice to meet you, ${name}! I'll remember your name.`, action: 'speak' };
      }
      
      // Website opening
      else if (command.includes('open youtube')) {
        response = { response: 'Opening YouTube...', action: 'speak', url: 'https://youtube.com' };
      }
      else if (command.includes('open google')) {
        response = { response: 'Opening Google...', action: 'speak', url: 'https://google.com' };
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
        response = { response: `The current time is ${time}`, action: 'speak' };
      }
      else if (command.includes('date')) {
        const date = new Date().toLocaleDateString('en-US', { 
          weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
        });
        response = { response: `Today is ${date}`, action: 'speak' };
      }
      
      // Weather
      else if (command.includes('weather')) {
        const city = command.includes(' in ') ? command.split(' in ')[1] : 'Karachi';
        const weather = await getWeather(city);
        response = { response: weather, action: 'speak' };
      }
      
      // Currency conversion
      else if (command.includes('convert') && command.includes('to')) {
        const parts = command.match(/(\d+)\s*(\w+)\s*to\s*(\w+)/);
        if (parts) {
          const [, amount, from, to] = parts;
          const conversion = await convertCurrency(parseFloat(amount), from.toUpperCase(), to.toUpperCase());
          response = { response: conversion, action: 'speak' };
        }
      }
      
      // Calculations
      else if (command.includes('calculate') || command.includes('what is')) {
        const expression = command.replace(/calculate|what is/g, '').trim();
        const result = calculate(expression);
        response = { response: result, action: 'speak' };
      }
      
      // Task management
      else if (command.includes('add task') || command.includes('create task')) {
        const task = command.replace(/add task|create task/g, '').trim();
        const result = await addTask(user._id, task);
        response = { response: result, action: 'speak' };
      }
      else if (command.includes('show tasks') || command.includes('my tasks')) {
        const result = await getTasks(user._id);
        response = { response: result, action: 'speak' };
      }
      else if (command.includes('delete task')) {
        const taskText = command.replace('delete task', '').trim();
        const result = await deleteTask(user._id, taskText);
        response = { response: result, action: 'speak' };
      }
      
      // Reminders
      else if (command.includes('remind me') || command.includes('set reminder')) {
        const reminder = command.replace(/remind me|set reminder/g, '').trim();
        const result = await addReminder(user._id, reminder, 'later');
        response = { response: result, action: 'speak' };
      }
      else if (command.includes('show reminders') || command.includes('my reminders')) {
        const result = await getReminders(user._id);
        response = { response: result, action: 'speak' };
      }
      
      // Statistics
      else if (command.includes('my stats') || command.includes('statistics')) {
        const stats = await getStats(user._id);
        response = { 
          response: `Your stats: ${stats.totalTasks} tasks (${stats.completedTasks} completed), ${stats.totalReminders} reminders, ${stats.totalConversations} conversations`, 
          action: 'speak' 
        };
      }
      
      // Entertainment
      else if (command.includes('joke')) {
        const jokes = [
          'Why don\'t scientists trust atoms? Because they make up everything!',
          'Why did the scarecrow win an award? Because he was outstanding in his field!',
          'What do you call a fake noodle? An impasta!'
        ];
        const joke = jokes[Math.floor(Math.random() * jokes.length)];
        response = { response: joke, action: 'speak' };
      }
      
      // Music
      else if (command.includes('play music') || command.includes('music')) {
        response = { response: 'Opening music for you...', action: 'speak', url: 'https://open.spotify.com' };
      }
      
      // Search
      else if (command.includes('search for')) {
        const query = command.replace('search for', '').trim();
        response = { 
          response: `Searching for ${query}...`, 
          action: 'speak', 
          url: `https://www.google.com/search?q=${encodeURIComponent(query)}` 
        };
      }
      
      // System info
      else if (command.includes('who are you')) {
        response = { 
          response: 'I am Shifra, your AI virtual assistant with MongoDB database. I can remember everything!', 
          action: 'speak' 
        };
      }
      else if (command.includes('what can you do') || command.includes('help')) {
        response = { 
          response: 'I can help you with: managing tasks, setting reminders, opening websites, calculations, weather, currency conversion, and much more! All data is saved in database.', 
          action: 'speak' 
        };
      }
      
      // Default response
      else {
        response = { 
          response: `I'm not sure about that. Try asking me about weather, time, calculations, or say "what can you do" for help.`, 
          action: 'speak' 
        };
      }

      // Save conversation to database
      await saveConversation(user._id, data.command, response.response);
      
    } catch (error) {
      console.error('Error:', error);
      response = { response: 'Sorry, I encountered an error processing your request.', action: 'speak' };
    }

    socket.emit('assistant-response', response);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = 8000;
server.listen(PORT, () => {
  console.log(`🚀 Shifra AI with MongoDB Atlas running on port ${PORT}`);
  console.log(`📡 Socket.io ready for connections`);
  console.log(`☁️ MongoDB Atlas cloud database connected`);
  console.log(`💾 All data permanently saved in cloud`);
  console.log(`🧠 Features: Tasks, Reminders, Conversations, User Management`);
});