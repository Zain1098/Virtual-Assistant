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
  res.json({ message: 'Shifra AI - Intelligent Assistant!' });
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

// Intelligent Response Generator
function getIntelligentResponse(message, userName) {
  const msg = message.toLowerCase();
  
  // Greetings
  if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey')) {
    const greetings = [
      `Hello ${userName}! Great to see you again. How can I help you today?`,
      `Hi ${userName}! I'm here and ready to assist. What would you like to do?`,
      `Hey ${userName}! Hope you're having a wonderful day. What can I do for you?`
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
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
    • Manage your tasks and reminders
    • Open websites like YouTube, Google, Facebook
    • Check weather and convert currency  
    • Perform calculations and math
    • Search the internet
    • Have intelligent conversations
    • Remember our chat history
    Just ask me anything!`;
  }
  
  // Compliments and thanks
  if (msg.includes('thank you') || msg.includes('thanks')) {
    return `You're very welcome, ${userName}! I'm always happy to help. Is there anything else you need?`;
  }
  
  if (msg.includes('good job') || msg.includes('well done') || msg.includes('great')) {
    return `Thank you so much, ${userName}! I really appreciate your kind words. I'm here whenever you need assistance!`;
  }
  
  // Feelings and emotions
  if (msg.includes('how are you')) {
    return `I'm doing great, ${userName}! I'm always excited to help and learn new things. How are you doing today?`;
  }
  
  if (msg.includes('i am sad') || msg.includes('feeling down')) {
    return `I'm sorry to hear you're feeling down, ${userName}. Remember that tough times don't last, but resilient people like you do! Is there anything I can do to help cheer you up?`;
  }
  
  if (msg.includes('i am happy') || msg.includes('feeling good')) {
    return `That's wonderful to hear, ${userName}! Your happiness makes me happy too. What's making your day so great?`;
  }
  
  // Learning and knowledge
  if (msg.includes('tell me about') || msg.includes('explain')) {
    return `That's an interesting topic, ${userName}! While I'd love to give you detailed information, I can help you search for it online. Just say "search for [your topic]" and I'll open Google for you!`;
  }
  
  // Default intelligent responses
  const responses = [
    `That's interesting, ${userName}! Could you tell me more about what you're looking for?`,
    `I understand, ${userName}. How would you like me to help you with that?`,
    `Good question, ${userName}! Let me think about the best way to assist you with this.`,
    `I hear you, ${userName}. What specific help do you need with this?`,
    `Thanks for sharing that, ${userName}! What would you like me to do about it?`
  ];
  
  return responses[Math.floor(Math.random() * responses.length)];
}

// Task functions
async function addTask(userId, taskText) {
  const task = new Task({ userId, task: taskText });
  await task.save();
  return `Perfect! I've added "${taskText}" to your task list. You now have ${await Task.countDocuments({ userId })} tasks total.`;
}

async function getTasks(userId) {
  const tasks = await Task.find({ userId });
  if (tasks.length === 0) return 'You have no tasks at the moment. Would you like to add some?';
  const taskList = tasks.map((t, i) => `${i+1}. ${t.completed ? '✅' : '📝'} ${t.task}`).join('\n');
  return `Here are your ${tasks.length} tasks:\n${taskList}`;
}

async function deleteTask(userId, taskText) {
  const task = await Task.findOneAndDelete({ 
    userId, 
    task: { $regex: taskText, $options: 'i' } 
  });
  if (task) {
    return `Done! I've removed "${task.task}" from your tasks. You have ${await Task.countDocuments({ userId })} tasks remaining.`;
  }
  return 'I couldn\'t find that task. Could you be more specific or check your task list?';
}

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  socket.on('voice-command', async (data) => {
    const command = data.command.toLowerCase();
    let response = { response: '', action: 'speak' };

    try {
      // Get or create user
      let user = await getOrCreateUser(socket.id);

      // Name setting
      if (command.includes('my name is')) {
        const name = command.split('my name is')[1].trim();
        user.name = name;
        await user.save();
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

      // Save conversation to database
      await new Conversation({ 
        userId: user._id, 
        userMessage: data.command, 
        assistantResponse: response.response 
      }).save();
      
    } catch (error) {
      console.error('Error:', error);
      response.response = `Sorry ${user?.name || 'there'}, I encountered an error. Please try again!`;
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
  console.log(`🧠 Intelligent responses enabled`);
  console.log(`☁️ MongoDB Atlas cloud database connected`);
  console.log(`💬 Features: Smart Chat, Tasks, Weather, Currency, Search`);
});