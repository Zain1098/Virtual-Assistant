const OpenAI = require('openai');
const nodemailer = require('nodemailer');

class AssistantService {
  constructor() {
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    this.commands = new Map();
    this.initializeCommands();
  }

  initializeCommands() {
    this.commands.set('weather', this.getWeather.bind(this));
    this.commands.set('calendar', this.getCalendarEvents.bind(this));
    this.commands.set('email', this.handleEmail.bind(this));
    this.commands.set('smart_home', this.controlSmartDevice.bind(this));
    this.commands.set('translate', this.translateText.bind(this));
    this.commands.set('calculate', this.calculate.bind(this));
    this.commands.set('news', this.getNews.bind(this));
  }

  async processCommand(command, userId, context = {}) {
    try {
      // Use AI to understand intent
      const intent = await this.analyzeIntent(command);
      
      if (this.commands.has(intent.action)) {
        return await this.commands.get(intent.action)(intent.parameters, userId);
      }

      // Fallback to AI conversation
      return await this.aiConversation(command, context);
    } catch (error) {
      return { error: 'Command processing failed', message: error.message };
    }
  }

  async analyzeIntent(command) {
    const response = await this.openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{
        role: "system",
        content: "Analyze the user command and return JSON with 'action' and 'parameters'. Actions: weather, calendar, email, smart_home, translate, calculate, news, chat"
      }, {
        role: "user",
        content: command
      }],
      max_tokens: 150
    });

    try {
      return JSON.parse(response.choices[0].message.content);
    } catch {
      return { action: 'chat', parameters: { message: command } };
    }
  }

  async aiConversation(message, context) {
    const response = await this.openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are Shifra, a helpful AI assistant. Be concise and friendly." },
        { role: "user", content: message }
      ],
      max_tokens: 200
    });

    return {
      type: 'conversation',
      response: response.choices[0].message.content,
      action: 'speak'
    };
  }

  async getWeather(params, userId) {
    const city = params.city || 'Karachi';
    // Mock weather API call
    return {
      type: 'weather',
      data: {
        city,
        temperature: '28°C',
        condition: 'Sunny',
        humidity: '65%'
      },
      response: `Weather in ${city}: 28°C, Sunny with 65% humidity`,
      action: 'speak'
    };
  }

  async getCalendarEvents(userId) {
    // Mock calendar integration
    return {
      type: 'calendar',
      data: [
        { title: 'Team Meeting', time: '10:00 AM', date: 'Today' },
        { title: 'Project Review', time: '2:00 PM', date: 'Tomorrow' }
      ],
      response: 'You have 2 upcoming events',
      action: 'display'
    };
  }

  async handleEmail(params, userId) {
    // Mock email handling
    return {
      type: 'email',
      data: { sent: true, count: params.action === 'check' ? 5 : 1 },
      response: params.action === 'check' ? 'You have 5 unread emails' : 'Email sent successfully',
      action: 'speak'
    };
  }

  async controlSmartDevice(params, userId) {
    // Mock smart home control
    return {
      type: 'smart_home',
      data: { device: params.device, status: params.action },
      response: `${params.device} ${params.action} successfully`,
      action: 'speak'
    };
  }

  async translateText(params, userId) {
    const response = await this.openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{
        role: "user",
        content: `Translate "${params.text}" to ${params.language}`
      }],
      max_tokens: 100
    });

    return {
      type: 'translation',
      data: { original: params.text, translated: response.choices[0].message.content },
      response: `Translation: ${response.choices[0].message.content}`,
      action: 'speak'
    };
  }

  async calculate(params, userId) {
    try {
      const result = eval(params.expression.replace(/[^0-9+\-*/().]/g, ''));
      return {
        type: 'calculation',
        data: { expression: params.expression, result },
        response: `The result is ${result}`,
        action: 'speak'
      };
    } catch {
      return {
        type: 'error',
        response: 'Invalid calculation',
        action: 'speak'
      };
    }
  }

  async getNews(params, userId) {
    // Mock news API
    return {
      type: 'news',
      data: [
        { title: 'Tech News Update', source: 'TechCrunch' },
        { title: 'AI Breakthrough', source: 'MIT News' }
      ],
      response: 'Here are the latest news headlines',
      action: 'display'
    };
  }

  async getHistory(userId) {
    // Mock conversation history
    return [
      { timestamp: new Date(), command: 'What\'s the weather?', response: 'Weather in Karachi: 28°C' },
      { timestamp: new Date(), command: 'Set a reminder', response: 'Reminder set successfully' }
    ];
  }
}

module.exports = new AssistantService();