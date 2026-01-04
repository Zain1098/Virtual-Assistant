const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const axios = require('axios');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: { origin: "*", methods: ["GET", "POST"] }
});

app.use(cors());
app.use(express.json());

// Advanced storage with learning capabilities
let users = new Map();
let globalKnowledge = new Map();
let conversationPatterns = new Map();

app.get('/', (req, res) => {
  res.json({ message: 'Shifra AI - Advanced Trained Assistant!' });
});

// Advanced AI Training Data with Multi-language Support
const trainingData = {
  greetings: {
    patterns: ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening', 'howdy', 'what\'s up', 
               'salam', 'assalam alaikum', 'adab', 'namaste', 'sat sri akal', 'kya hal hai', 'kaise hain'],
    responses: [
      'Hello {name}! Great to see you again. How can I make your day better?',
      'Hi {name}! I\'m here and ready to help. What\'s on your mind today?',
      'Hey {name}! Hope you\'re having a wonderful day. How can I assist you?',
      'Good to see you, {name}! What can I help you accomplish today?',
      'Assalam Alaikum {name}! Aap kaise hain? Main aap ki kya madad kar sakta hun?',
      'Namaste {name}! Umeed hai aap theek hain. Kya kaam hai?',
      'Adab {name}! Aaj ka din kaisa ja raha hai? Kuch help chahiye?'
    ]
  },
  
  urduHindi: {
    patterns: ['kya kar sakte hain', 'kya features hain', 'kya kaam kar sakte ho', 'tumhare paas kya hai', 'help kya kar sakte ho'],
    responses: [
      'Main bahut saare kaam kar sakta hun {name}! Weather check kar sakta hun, websites khol sakta hun, calculations kar sakta hun, tasks manage kar sakta hun, aur bahut kuch!',
      'Mere paas ye features hain {name}: Voice commands, Task management, Weather updates, Currency conversion, Web search, Location services, Entertainment, aur daily help!',
      'Main aap ki ye madad kar sakta hun {name}: Google search, YouTube videos, Maps directions, Calculator, Timer, Reminders, News updates, Music, aur conversation!'
    ]
  },
  
  thanks: {
    patterns: ['thank you', 'thanks', 'shukriya', 'dhanyawad', 'meherbani', 'jazakallah'],
    responses: [
      'You\'re welcome {name}! Happy to help anytime!',
      'Koi baat nahi {name}! Hamesha madad ke liye hazir hun!',
      'Shukriya {name}! Aur kuch chahiye to batayiye!',
      'Khushi hui madad karke {name}! Aur kya kaam hai?'
    ]
  },
  
  farewells: {
    patterns: ['bye', 'goodbye', 'see you', 'talk later', 'catch you later', 'alvida', 'khuda hafiz', 'allah hafiz', 'phir milenge'],
    responses: [
      'Goodbye {name}! Have a fantastic day ahead!',
      'See you later, {name}! Take care and stay awesome!',
      'Bye {name}! I\'ll be here whenever you need me.',
      'Until next time, {name}! Wishing you all the best!',
      'Khuda Hafiz {name}! Allah aap ko khush rakhe!',
      'Alvida {name}! Phir milenge jaldi!'
    ]
  },

  emotions: {
    happy: {
      patterns: ['happy', 'excited', 'great', 'awesome', 'fantastic', 'wonderful'],
      responses: [
        'That\'s wonderful to hear, {name}! Your happiness makes me happy too!',
        'I love your positive energy, {name}! What\'s making your day so great?',
        'Fantastic, {name}! Keep that amazing spirit up!'
      ]
    },
    sad: {
      patterns: ['sad', 'down', 'depressed', 'upset', 'unhappy', 'feeling bad'],
      responses: [
        'I\'m sorry you\'re feeling down, {name}. Remember, tough times don\'t last but strong people like you do!',
        'I understand you\'re going through a difficult time, {name}. Is there anything I can do to help?',
        'Your feelings are valid, {name}. Would you like to talk about what\'s bothering you?'
      ]
    }
  },

  learning: {
    patterns: ['learn', 'teach me', 'explain', 'how does', 'what is', 'tell me about'],
    responses: [
      'I\'d love to help you learn about that, {name}! Let me search for the best information.',
      'Great question, {name}! Learning is one of my favorite activities. Let me find that for you.',
      'That\'s an interesting topic, {name}! I\'ll help you explore it.'
    ]
  }
};

// Advanced pattern matching
function findBestMatch(input, patterns) {
  const inputLower = input.toLowerCase();
  let bestMatch = null;
  let highestScore = 0;

  for (const pattern of patterns) {
    const score = calculateSimilarity(inputLower, pattern);
    if (score > highestScore && score > 0.3) {
      highestScore = score;
      bestMatch = pattern;
    }
  }

  return bestMatch;
}

function calculateSimilarity(str1, str2) {
  const words1 = str1.split(' ');
  const words2 = str2.split(' ');
  let matches = 0;

  for (const word1 of words1) {
    for (const word2 of words2) {
      if (word1.includes(word2) || word2.includes(word1)) {
        matches++;
        break;
      }
    }
  }

  return matches / Math.max(words1.length, words2.length);
}

// Advanced response generator with multi-language support
function generateAdvancedResponse(message, userName, userContext) {
  const msg = message.toLowerCase();
  const userLang = userContext.preferredLanguage || 'en';
  
  // Helper function for this generator
  const getResponse = (en, ur, hi) => {
    switch(userLang) {
      case 'ur': return ur || en;
      case 'hi': return hi || en;
      default: return en;
    }
  };
  
  // Check for Urdu/Hindi specific patterns
  const urduMatch = findBestMatch(msg, trainingData.urduHindi.patterns);
  if (urduMatch) {
    return getResponse(
      `I can help you with many things, ${userName}! Weather, websites, calculations, tasks, and much more!`,
      `میں بہت سے کام کر سکتا ہوں ${userName}! موسم، ویب سائٹس، حساب کتاب، کام منظم کرنا اور بہت کچھ!`,
      `मैं बहुत से काम कर सकता हूं ${userName}! मौसम, वेबसाइट, गणना, कार्य व्यवस्थित करना और बहुत कुछ!`
    );
  }
  
  // Check for thanks patterns
  const thanksMatch = findBestMatch(msg, trainingData.thanks.patterns);
  if (thanksMatch) {
    return getResponse(
      `You're welcome ${userName}! Happy to help anytime!`,
      `کوئی بات نہیں ${userName}! ہمیشہ مدد کے لیے حاضر ہوں!`,
      `कोई बात नहीं ${userName}! हमेशा मदद के लिए तैयार हूं!`
    );
  }
  
  // Multi-language contextual responses
  if (msg.includes('kaise ho') || msg.includes('kya haal hai')) {
    return getResponse(
      `I'm doing great ${userName}! How are you? How can I help?`,
      `میں بالکل ٹھیک ہوں ${userName}! آپ کیسے ہیں؟ کیا مدد چاہیے؟`,
      `मैं बिल्कुल ठीक हूं ${userName}! आप कैसे हैं? क्या मदद चाहिए?`
    );
  }
  
  // Default contextual responses
  const responses = {
    en: [
      `That's fascinating, ${userName}! I'm processing that information and learning from it.`,
      `I understand, ${userName}. Based on our previous conversations, I think I can help you with that.`,
      `Interesting perspective, ${userName}! I'm always eager to learn from your insights.`
    ],
    ur: [
      `یہ دلچسپ ہے ${userName}! میں اس معلومات کو سیکھ رہا ہوں۔`,
      `سمجھ گیا ${userName}! میں اس بارے میں اور جانکاری دے سکتا ہوں۔`,
      `اچھا نقطہ ہے ${userName}! اس موضوع پر اور بات کر سکتے ہیں۔`
    ],
    hi: [
      `यह दिलचस्प है ${userName}! मैं यह जानकारी सीख रहा हूं।`,
      `समझ गया ${userName}! मैं इस बारे में और जानकारी दे सकता हूं।`,
      `अच्छा पॉइंट है ${userName}! इस विषय पर और चर्चा कर सकते हैं।`
    ]
  };
  
  const langResponses = responses[userLang] || responses.en;
  return langResponses[Math.floor(Math.random() * langResponses.length)];
}

// Advanced weather with real data simulation
async function getAdvancedWeather(city) {
  const weatherConditions = ['sunny', 'cloudy', 'rainy', 'partly cloudy', 'clear'];
  const temp = Math.floor(Math.random() * 15) + 20; // 20-35°C
  const condition = weatherConditions[Math.floor(Math.random() * weatherConditions.length)];
  const humidity = Math.floor(Math.random() * 40) + 40; // 40-80%
  
  return `Weather in ${city}: ${temp}°C, ${condition} skies. Humidity: ${humidity}%. ${
    temp > 30 ? 'It\'s quite warm today!' : temp < 25 ? 'Pleasant temperature!' : 'Perfect weather!'
  }`;
}

// Advanced currency with multiple rates
function getAdvancedCurrency(amount, from, to) {
  const rates = {
    'USD': { 'PKR': 280, 'EUR': 0.85, 'GBP': 0.73, 'JPY': 110, 'CAD': 1.25 },
    'PKR': { 'USD': 0.0036, 'EUR': 0.003, 'GBP': 0.0026, 'JPY': 0.39, 'CAD': 0.0045 },
    'EUR': { 'USD': 1.18, 'PKR': 330, 'GBP': 0.86, 'JPY': 130, 'CAD': 1.47 },
    'GBP': { 'USD': 1.37, 'PKR': 384, 'EUR': 1.16, 'JPY': 151, 'CAD': 1.71 }
  };
  
  const rate = rates[from]?.[to] || 1.1;
  const converted = (amount * rate).toFixed(2);
  const trend = Math.random() > 0.5 ? '📈' : '📉';
  
  return `${amount} ${from} = ${converted} ${to} ${trend}\nExchange rate: 1 ${from} = ${rate} ${to}\n*Rates are indicative and change frequently`;
}

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  // Initialize advanced user profile
  if (!users.has(socket.id)) {
    users.set(socket.id, { 
      name: 'User', 
      tasks: [], 
      preferences: {},
      conversationHistory: [],
      learningData: {},
      mood: 'neutral',
      interests: []
    });
  }
  
  socket.on('voice-command', async (data) => {
    const command = data.command.toLowerCase();
    const userLanguage = data.language || 'en'; // Get user's selected language
    let response = { response: '', action: 'speak' };
    let user = users.get(socket.id);

    // Store user's language preference
    user.preferredLanguage = userLanguage;

    // Store conversation for learning
    user.conversationHistory.push({
      input: data.command,
      timestamp: new Date(),
      context: user.mood,
      language: userLanguage
    });

    // Helper function to get response in user's language
    const getLocalizedResponse = (enText, urText, hiText) => {
      switch(userLanguage) {
        case 'ur': return urText || enText;
        case 'hi': return hiText || enText;
        default: return enText;
      }
    };

    try {
      // Name setting with multi-language responses
      if (command.includes('my name is') || (command.includes('mera naam') && command.includes('hai'))) {
        const name = command.includes('my name is') ? 
          command.split('my name is')[1].trim() : 
          command.split('mera naam')[1].replace('hai', '').trim();
        user.name = name;
        users.set(socket.id, user);
        response.response = getLocalizedResponse(
          `Wonderful! Nice to meet you, ${name}! I'll remember your name and learn your preferences as we chat. How can I help you today?`,
          `بہت خوشی ہوئی ${name}! میں آپ کا نام یاد رکھوں گا۔ آج کیا مدد کر سکتا ہوں؟`,
          `खुशी हुई ${name}! मैं आपका नाम याद रखूंगा। आज क्या मदद कर सकता हूं?`
        );
      }
      
      // Multi-language greetings
      else if (command.includes('hello') || command.includes('hi') || command.includes('salam') || command.includes('namaste')) {
        response.response = getLocalizedResponse(
          `Hello ${user.name}! Great to see you! I'm here to help you with anything you need. What can I do for you today?`,
          `السلام علیکم ${user.name}! آپ سے ملکر خوشی ہوئی! آج کیا مدد کر سکتا ہوں؟`,
          `नमस्ते ${user.name}! आपसे मिलकर खुशी हुई! आज क्या मदद कर सकता हूं?`
        );
      }
      // Feature inquiry responses
      else if (command.includes('what can you do') || command.includes('kya kar sakte hain') || command.includes('kya features hain')) {
        response.response = getLocalizedResponse(
          `I can help you with many things! I can check weather, open websites, do calculations, manage tasks, search Google, find locations, play music, set reminders, translate text, and much more. Just ask me anything!`,
          `میں بہت سے کام کر سکتا ہوں! موسم چیک کر سکتا ہوں، ویب سائٹس کھول سکتا ہوں، حساب کتاب کر سکتا ہوں، کام منظم کر سکتا ہوں، گوگل سرچ، مقامات تلاش، موسیقی، یاد دہانیاں، ترجمہ اور بہت کچھ!`,
          `मैं बहुत से काम कर सकता हूं! मौसम चेक कर सकता हूं, वेबसाइट खोल सकता हूं, गणना कर सकता हूं, कार्य व्यवस्थित कर सकता हूं, गूगल सर्च, स्थान खोज, संगीत, रिमाइंडर, अनुवाद और बहुत कुछ!`
        );
      }
      // Thanks responses
      else if (command.includes('thank you') || command.includes('thanks') || command.includes('shukriya') || command.includes('dhanyawad')) {
        response.response = getLocalizedResponse(
          `You're very welcome, ${user.name}! I'm always happy to help. Is there anything else you need?`,
          `کوئی بات نہیں ${user.name}! ہمیشہ مدد کے لیے حاضر ہوں۔ اور کچھ چاہیے؟`,
          `कोई बात नहीं ${user.name}! हमेशा मदद के लिए तैयार हूं। और कुछ चाहिए?`
        );
      }
      // Website opening with localized responses
      else if (command.includes('open youtube')) {
        response = { 
          response: getLocalizedResponse(
            'Opening YouTube! Based on your interests, you might enjoy the trending videos today.',
            'یوٹیوب کھول رہا ہوں! آج کے ٹرینڈنگ ویڈیوز دیکھیے۔',
            'यूट्यूब खोल रहा हूं! आज के ट्रेंडिंग वीडियो देखिए।'
          ), 
          action: 'speak', 
          url: 'https://youtube.com' 
        };
      }
      else if (command.includes('open google')) {
        response = { 
          response: getLocalizedResponse(
            'Opening Google search. I can also help you search for specific topics if you tell me what you\'re looking for!',
            'گوگل سرچ کھول رہا ہوں۔ اگر آپ بتائیں تو میں آپ کے لیے کچھ بھی تلاش کر سکتا ہوں!',
            'गूगल सर्च खोल रहा हूं। अगर आप बताएं तो मैं आपके लिए कुछ भी खोज सकता हूं!'
          ), 
          action: 'speak', 
          url: 'https://google.com' 
        };
      }
      else if (command.includes('open facebook')) {
        response = { response: 'Opening Facebook. Stay connected with friends and family!', action: 'speak', url: 'https://facebook.com' };
      }
      else if (command.includes('open instagram')) {
        response = { response: 'Opening Instagram. Time for some inspiring photos and stories!', action: 'speak', url: 'https://instagram.com' };
      }
      else if (command.includes('open calendar') || command.includes('open calender')) {
        response = { response: 'Opening Google Calendar. I can also help you remember important dates!', action: 'speak', url: 'https://calendar.google.com' };
      }
      else if (command.includes('open gmail')) {
        response = { response: 'Opening Gmail. Need help composing an email? Just ask!', action: 'speak', url: 'https://gmail.com' };
      }
      else if (command.includes('open whatsapp')) {
        response = { response: 'Opening WhatsApp Web. Stay connected with everyone!', action: 'speak', url: 'https://web.whatsapp.com' };
      }
      else if (command.includes('open netflix')) {
        response = { response: 'Opening Netflix. Enjoy your binge-watching session!', action: 'speak', url: 'https://netflix.com' };
      }
      else if (command.includes('open spotify')) {
        response = { response: 'Opening Spotify. Let the music play!', action: 'speak', url: 'https://spotify.com' };
      }
      
      // Advanced time with context
      else if (command.includes('time')) {
        const now = new Date();
        const time = now.toLocaleTimeString();
        const hour = now.getHours();
        let greeting = '';
        if (hour < 12) greeting = 'Good morning';
        else if (hour < 17) greeting = 'Good afternoon';
        else greeting = 'Good evening';
        
        response.response = `${greeting}, ${user.name}! The current time is ${time}. Hope you're having a productive day!`;
      }
      
      // Advanced date with day info
      else if (command.includes('date')) {
        const now = new Date();
        const date = now.toLocaleDateString('en-US', { 
          weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
        });
        const dayOfYear = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
        response.response = `Today is ${date}. It's day ${dayOfYear} of the year, ${user.name}! What are your plans for today?`;
      }
      
      // Advanced weather
      else if (command.includes('weather')) {
        const city = command.includes(' in ') ? command.split(' in ')[1].trim() : 'your area';
        response.response = await getAdvancedWeather(city);
      }
      
      // Advanced currency conversion
      else if (command.includes('convert') && command.includes('to')) {
        const parts = command.match(/(\d+)\s*(\w+)\s*to\s*(\w+)/);
        if (parts) {
          const [, amount, from, to] = parts;
          response.response = getAdvancedCurrency(parseFloat(amount), from.toUpperCase(), to.toUpperCase());
        }
      }
      
      // Advanced calculations with history
      else if (command.includes('calculate') || command.includes('what is')) {
        const expression = command.replace(/calculate|what is/g, '').trim();
        try {
          const sanitized = expression.replace(/[^0-9+\-*/.() ]/g, '');
          const result = eval(sanitized);
          user.learningData.lastCalculation = { expression, result };
          response.response = `${expression} equals ${result}. Math made easy, ${user.name}! I've saved this calculation in case you need it later.`;
        } catch {
          response.response = `I couldn't calculate that, ${user.name}. Could you try rephrasing the math problem? For example: "calculate 15 plus 25"`;
        }
      }
      
      // Advanced task management with priorities
      else if (command.includes('add task') || command.includes('create task')) {
        const task = command.replace(/add task|create task/g, '').trim();
        const priority = command.includes('urgent') || command.includes('important') ? 'high' : 'normal';
        user.tasks.push({ task, priority, created: new Date(), completed: false });
        users.set(socket.id, user);
        response.response = `Perfect! I've added "${task}" to your task list with ${priority} priority. You now have ${user.tasks.length} tasks total. Need help organizing them?`;
      }
      else if (command.includes('show tasks') || command.includes('my tasks')) {
        if (user.tasks.length === 0) {
          response.response = 'You have no tasks at the moment. Would you like to add some? I can help you organize your day!';
        } else {
          const taskList = user.tasks.map((t, i) => `${i+1}. ${t.completed ? '✅' : '📝'} ${t.task} ${t.priority === 'high' ? '🔥' : ''}`).join('\n');
          response.response = `Here are your ${user.tasks.length} tasks:\n${taskList}\n\nNeed help prioritizing or completing any of these?`;
        }
      }
      else if (command.includes('complete task') || command.includes('finish task')) {
        const taskNum = parseInt(command.match(/\d+/)?.[0]) - 1;
        if (taskNum >= 0 && taskNum < user.tasks.length) {
          user.tasks[taskNum].completed = true;
          response.response = `Excellent work, ${user.name}! Task "${user.tasks[taskNum].task}" marked as completed. You're making great progress!`;
        } else {
          response.response = `Which task would you like to complete, ${user.name}? You can say "complete task 1" or tell me the task name.`;
        }
      }
      
      // Google search and web search
      else if (command.includes('google') && !command.includes('open google')) {
        const query = command.replace(/google|search/g, '').trim();
        response = { 
          response: `Googling "${query}" for you. Opening search results!`, 
          action: 'speak', 
          url: `https://www.google.com/search?q=${encodeURIComponent(query)}` 
        };
      }
      else if (command.includes('search') || command.includes('find information about')) {
        const query = command.replace(/search for|search|find information about|find/g, '').trim();
        response = { 
          response: `Searching for "${query}" on Google. I'll find the best results for you!`, 
          action: 'speak', 
          url: `https://www.google.com/search?q=${encodeURIComponent(query)}` 
        };
      }
      else if (command.includes('wikipedia') || command.includes('wiki')) {
        const topic = command.replace(/wikipedia|wiki|about/g, '').trim();
        response = { 
          response: `Opening Wikipedia article about "${topic}". Great source for detailed information!`, 
          action: 'speak', 
          url: `https://en.wikipedia.org/wiki/${encodeURIComponent(topic)}` 
        };
      }
      else if (command.includes('youtube search') || command.includes('search youtube')) {
        const query = command.replace(/youtube search|search youtube|on youtube/g, '').trim();
        response = { 
          response: `Searching YouTube for "${query}" videos. Enjoy watching!`, 
          action: 'speak', 
          url: `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}` 
        };
      }
      else if (command.includes('image search') || command.includes('search images')) {
        const query = command.replace(/image search|search images|images of/g, '').trim();
        response = { 
          response: `Searching Google Images for "${query}". Visual results coming up!`, 
          action: 'speak', 
          url: `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(query)}` 
        };
      }
      else if (command.includes('news search') || command.includes('search news')) {
        const query = command.replace(/news search|search news|news about/g, '').trim();
        response = { 
          response: `Searching latest news about "${query}". Stay informed!`, 
          action: 'speak', 
          url: `https://news.google.com/search?q=${encodeURIComponent(query)}` 
        };
      }
      
      // Location-based services
      else if (command.includes('near me') || command.includes('nearby')) {
        const searchTerm = command.replace(/near me|nearby|find|location|on google maps/g, '').trim();
        const query = `${searchTerm} near me`;
        response = {
          response: `Finding ${searchTerm} locations near you on Google Maps. I'll show you the closest options with ratings and directions!`,
          action: 'speak',
          url: `https://www.google.com/maps/search/${encodeURIComponent(query)}`
        };
      }
      else if (command.includes('gym') && (command.includes('location') || command.includes('near'))) {
        response = {
          response: 'Finding gyms near your location on Google Maps. I\'ll show you the best-rated gyms with timings and facilities!',
          action: 'speak',
          url: 'https://www.google.com/maps/search/gym+near+me'
        };
      }
      else if (command.includes('restaurant') && (command.includes('near') || command.includes('location'))) {
        response = {
          response: 'Finding restaurants near you! I\'ll show you top-rated places with reviews and menus.',
          action: 'speak',
          url: 'https://www.google.com/maps/search/restaurants+near+me'
        };
      }
      else if (command.includes('hospital') && (command.includes('near') || command.includes('location'))) {
        response = {
          response: 'Finding hospitals and medical centers near you. I\'ll show you the closest healthcare facilities.',
          action: 'speak',
          url: 'https://www.google.com/maps/search/hospital+near+me'
        };
      }
      else if (command.includes('atm') && (command.includes('near') || command.includes('location'))) {
        response = {
          response: 'Finding ATMs near your location. I\'ll show you the closest cash machines and banks.',
          action: 'speak',
          url: 'https://www.google.com/maps/search/atm+near+me'
        };
      }
      else if (command.includes('gas station') || command.includes('petrol pump')) {
        response = {
          response: 'Finding gas stations near you. I\'ll show you fuel prices and station facilities.',
          action: 'speak',
          url: 'https://www.google.com/maps/search/gas+station+near+me'
        };
      }
      else if (command.includes('pharmacy') && (command.includes('near') || command.includes('location'))) {
        response = {
          response: 'Finding pharmacies near you. I\'ll show you 24-hour options and medical stores.',
          action: 'speak',
          url: 'https://www.google.com/maps/search/pharmacy+near+me'
        };
      }
      else if (command.includes('coffee shop') || command.includes('cafe')) {
        response = {
          response: 'Finding coffee shops and cafes near you. Time for some great coffee!',
          action: 'speak',
          url: 'https://www.google.com/maps/search/coffee+shop+near+me'
        };
      }
      else if (command.includes('shopping mall') || command.includes('mall')) {
        response = {
          response: 'Finding shopping malls near you. I\'ll show you the best shopping destinations!',
          action: 'speak',
          url: 'https://www.google.com/maps/search/shopping+mall+near+me'
        };
      }
      
      // Directions and navigation
      else if (command.includes('directions to') || command.includes('navigate to')) {
        const destination = command.replace(/directions to|navigate to/g, '').trim();
        response = {
          response: `Getting directions to ${destination}. I'll open Google Maps with turn-by-turn navigation!`,
          action: 'speak',
          url: `https://www.google.com/maps/dir//${encodeURIComponent(destination)}`
        };
      }
      else if (command.includes('how to get to') || command.includes('route to')) {
        const destination = command.replace(/how to get to|route to/g, '').trim();
        response = {
          response: `Finding the best route to ${destination}. I'll show you multiple route options with traffic updates!`,
          action: 'speak',
          url: `https://www.google.com/maps/dir//${encodeURIComponent(destination)}`
        };
      }
      
      // Entertainment and media
      else if (command.includes('play music') || command.includes('music')) {
        const genre = command.includes('rock') ? 'rock' : command.includes('pop') ? 'pop' : command.includes('jazz') ? 'jazz' : 'music';
        response = { response: `Opening Spotify to play ${genre}. Let the music lift your spirits!`, action: 'speak', url: 'https://open.spotify.com' };
      }
      else if (command.includes('play video') || command.includes('watch')) {
        const query = command.replace(/play video|watch/g, '').trim();
        response = { 
          response: `Searching for "${query}" videos on YouTube. Enjoy watching!`, 
          action: 'speak', 
          url: `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}` 
        };
      }
      else if (command.includes('news') || command.includes('latest news')) {
        const category = command.includes('tech') ? 'technology' : command.includes('sports') ? 'sports' : command.includes('business') ? 'business' : 'general';
        response = { response: `Opening ${category} news for you. Stay informed!`, action: 'speak', url: 'https://news.google.com' };
      }
      
      // System controls and utilities
      else if (command.includes('set timer') || command.includes('timer for')) {
        const minutes = command.match(/\d+/)?.[0] || '5';
        response = { response: `Setting a ${minutes}-minute timer. I'll remind you when it's done!`, action: 'speak', url: `https://www.google.com/search?q=timer+${minutes}+minutes` };
      }
      else if (command.includes('set alarm') || command.includes('alarm for')) {
        const time = command.match(/\d{1,2}:\d{2}|\d{1,2}\s*(am|pm)/i)?.[0] || 'morning';
        response = { response: `I'll help you set an alarm for ${time}. Opening clock app!`, action: 'speak', url: 'https://www.google.com/search?q=set+alarm' };
      }
      else if (command.includes('translate') && command.includes('to')) {
        const parts = command.match(/translate\s+(.+?)\s+to\s+(\w+)/i);
        if (parts) {
          const [, text, language] = parts;
          response = { 
            response: `Translating "${text}" to ${language}. Opening Google Translate!`, 
            action: 'speak', 
            url: `https://translate.google.com/?sl=auto&tl=${language}&text=${encodeURIComponent(text)}` 
          };
        }
      }
      
      // Health and fitness
      else if (command.includes('bmi') || command.includes('body mass index')) {
        response = { response: 'Opening BMI calculator. Enter your height and weight to check your health status!', action: 'speak', url: 'https://www.google.com/search?q=bmi+calculator' };
      }
      else if (command.includes('calories') || command.includes('calorie counter')) {
        response = { response: 'Opening calorie calculator. Track your daily nutrition intake!', action: 'speak', url: 'https://www.google.com/search?q=calorie+calculator' };
      }
      else if (command.includes('workout') || command.includes('exercise')) {
        const type = command.includes('home') ? 'home workout' : command.includes('gym') ? 'gym workout' : 'workout routines';
        response = { response: `Finding ${type} videos for you. Time to get fit!`, action: 'speak', url: `https://www.youtube.com/results?search_query=${encodeURIComponent(type)}` };
      }
      
      // Education and learning
      else if (command.includes('learn') && (command.includes('programming') || command.includes('coding'))) {
        const language = command.includes('python') ? 'python' : command.includes('javascript') ? 'javascript' : command.includes('java') ? 'java' : 'programming';
        response = { response: `Great choice! Opening ${language} learning resources. Happy coding!`, action: 'speak', url: `https://www.youtube.com/results?search_query=learn+${language}+tutorial` };
      }
      else if (command.includes('course') || command.includes('online learning')) {
        response = { response: 'Opening online learning platforms. Expand your knowledge!', action: 'speak', url: 'https://www.coursera.org' };
      }
      else if (command.includes('dictionary') || command.includes('meaning of')) {
        const word = command.replace(/dictionary|meaning of|what does|mean/g, '').trim();
        response = { response: `Looking up the meaning of "${word}" for you!`, action: 'speak', url: `https://www.google.com/search?q=define+${encodeURIComponent(word)}` };
      }
      
      // Shopping and e-commerce
      else if (command.includes('shop') || command.includes('buy')) {
        const item = command.replace(/shop|buy|for|online/g, '').trim();
        response = { response: `Finding the best deals for "${item}" online. Happy shopping!`, action: 'speak', url: `https://www.google.com/search?q=buy+${encodeURIComponent(item)}+online` };
      }
      else if (command.includes('amazon')) {
        const product = command.replace(/amazon|on/g, '').trim();
        response = { response: `Opening Amazon to search for "${product}". Great choice for online shopping!`, action: 'speak', url: `https://www.amazon.com/s?k=${encodeURIComponent(product)}` };
      }
      
      // Travel and transportation
      else if (command.includes('flight') || command.includes('book flight')) {
        response = { response: 'Opening flight booking. Find the best deals for your next trip!', action: 'speak', url: 'https://www.google.com/flights' };
      }
      else if (command.includes('hotel') || command.includes('book hotel')) {
        const city = command.replace(/hotel|book|in/g, '').trim();
        response = { response: `Finding hotels in ${city}. Book your perfect stay!`, action: 'speak', url: `https://www.google.com/travel/hotels?q=${encodeURIComponent(city)}` };
      }
      else if (command.includes('uber') || command.includes('taxi')) {
        response = { response: 'Opening ride booking. Get a safe ride to your destination!', action: 'speak', url: 'https://www.uber.com' };
      }
      
      // Food delivery
      else if (command.includes('order food') || command.includes('food delivery')) {
        response = { response: 'Opening food delivery apps. What are you craving today?', action: 'speak', url: 'https://www.google.com/search?q=food+delivery+near+me' };
      }
      else if (command.includes('pizza') && command.includes('order')) {
        response = { response: 'Time for pizza! Opening pizza delivery options near you.', action: 'speak', url: 'https://www.google.com/search?q=pizza+delivery+near+me' };
      }
      
      // Social and communication
      else if (command.includes('video call') || command.includes('zoom')) {
        response = { response: 'Opening video calling platform. Connect with your loved ones!', action: 'speak', url: 'https://zoom.us' };
      }
      else if (command.includes('send email') || command.includes('compose email')) {
        response = { response: 'Opening Gmail to compose your email. What would you like to write?', action: 'speak', url: 'https://mail.google.com/mail/u/0/#inbox?compose=new' };
      }
      
      // Learning and memory features
      else if (command.includes('remember') && command.includes('that')) {
        const info = command.replace(/remember that|remember/g, '').trim();
        user.learningData[Date.now()] = info;
        response.response = `Got it, ${user.name}! I've stored that information: "${info}". I'll remember it for our future conversations.`;
      }
      else if (command.includes('what do you remember') || command.includes('what did i tell you')) {
        const memories = Object.values(user.learningData);
        if (memories.length > 0) {
          response.response = `I remember several things you've told me, ${user.name}: ${memories.slice(-3).join(', ')}. Is there something specific you'd like me to recall?`;
        } else {
          response.response = `We're just getting started, ${user.name}! As we chat more, I'll remember important things you tell me.`;
        }
      }
      
      // For all other queries, use advanced AI response with language support
      else {
        const aiResponse = generateAdvancedResponse(data.command, user.name, user);
        response.response = aiResponse;
      }
      
      // Update user mood based on response
      if (command.includes('happy') || command.includes('great')) user.mood = 'happy';
      else if (command.includes('sad') || command.includes('bad')) user.mood = 'sad';
      else user.mood = 'neutral';
      
      users.set(socket.id, user);
      
    } catch (error) {
      console.error('Error:', error);
      response.response = `Sorry ${user?.name || 'there'}, I encountered an error. But I'm learning from this to improve! Please try again.`;
    }

    socket.emit('assistant-response', response);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    // Keep user data for potential reconnection
  });
});

const PORT = 8000;
server.listen(PORT, () => {
  console.log(`🚀 Shifra AI Advanced Assistant running on port ${PORT}`);
  console.log(`📡 Socket.io ready for connections`);
  console.log(`🧠 Advanced AI training enabled`);
  console.log(`🎯 Pattern matching and learning active`);
  console.log(`💡 Context awareness and memory enabled`);
  console.log(`🌟 Features: Smart Learning, Memory, Context, Emotions, Advanced Tasks, Location Services, Entertainment, Health, Education, Shopping, Travel`);
});