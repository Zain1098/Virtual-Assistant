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
let tasks = [];
let reminders = [];
let userName = 'User';

app.get('/', (req, res) => {
  res.json({ message: 'Shifra AI Smart Assistant Running!' });
});

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

// Task management
function addTask(task) {
  const newTask = { id: Date.now(), task, completed: false };
  tasks.push(newTask);
  return `Task "${task}" added successfully`;
}

function getTasks() {
  if (tasks.length === 0) return 'No tasks found';
  const taskList = tasks.map(t => `${t.completed ? '✓' : '○'} ${t.task}`).join(', ');
  return `Your tasks: ${taskList}`;
}

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  socket.on('voice-command', async (data) => {
    const command = data.command.toLowerCase();
    let response = { response: `I heard: ${data.command}`, action: 'speak' };

    try {
      // Greetings
      if (command.includes('hello') || command.includes('hi') || command.includes('hey')) {
        response = { response: `Hello ${userName}! How can I assist you today?`, action: 'speak' };
      }
      
      // Name setting
      else if (command.includes('my name is')) {
        userName = command.split('my name is')[1].trim();
        response = { response: `Nice to meet you, ${userName}!`, action: 'speak' };
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
      else if (command.includes('open twitter')) {
        response = { response: 'Opening Twitter...', action: 'speak', url: 'https://twitter.com' };
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
        const result = addTask(task);
        response = { response: result, action: 'speak' };
      }
      else if (command.includes('show tasks') || command.includes('my tasks')) {
        const result = getTasks();
        response = { response: result, action: 'speak' };
      }
      
      // Entertainment
      else if (command.includes('joke')) {
        const jokes = [
          'Why don\'t scientists trust atoms? Because they make up everything!',
          'Why did the scarecrow win an award? Because he was outstanding in his field!',
          'What do you call a fake noodle? An impasta!',
          'Why don\'t eggs tell jokes? They\'d crack each other up!'
        ];
        const joke = jokes[Math.floor(Math.random() * jokes.length)];
        response = { response: joke, action: 'speak' };
      }
      
      // Fun facts
      else if (command.includes('fun fact') || command.includes('tell me something')) {
        const facts = [
          'Honey never spoils. Archaeologists have found pots of honey in ancient Egyptian tombs that are over 3,000 years old!',
          'A group of flamingos is called a flamboyance.',
          'Bananas are berries, but strawberries aren\'t.',
          'Octopuses have three hearts and blue blood.'
        ];
        const fact = facts[Math.floor(Math.random() * facts.length)];
        response = { response: fact, action: 'speak' };
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
          response: 'I am Shifra, your AI virtual assistant. I can help you with tasks, answer questions, open websites, and much more!', 
          action: 'speak' 
        };
      }
      else if (command.includes('what can you do') || command.includes('help')) {
        response = { 
          response: 'I can help you with: opening websites, checking weather, converting currency, calculations, managing tasks, telling jokes, playing music, and answering questions!', 
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
      
    } catch (error) {
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
  console.log(`🚀 Shifra AI Smart Assistant running on port ${PORT}`);
  console.log(`📡 Socket.io ready for connections`);
  console.log(`🧠 Smart features: Weather, Currency, Tasks, Jokes, Calculations`);
});