# 🎯 Shifra AI - Intelligent Virtual Assistant

<div align="center">

![Shifra AI](https://img.shields.io/badge/Shifra-AI%20Assistant-blue?style=for-the-badge&logo=react)
![Version](https://img.shields.io/badge/version-2.0.0-green?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-orange?style=for-the-badge)

**A modern, full-stack AI-powered virtual assistant with voice recognition and real-time communication**

[🚀 Live Demo](https://your-demo-link.com) • [📖 Documentation](#documentation) • [🐛 Report Bug](https://github.com/Zain1098/Virtual-Assistant/issues)

</div>

---

## ✨ Features

### 🎤 **Voice & AI Capabilities**
- **Advanced Voice Recognition** - Real-time speech-to-text processing
- **AI-Powered Responses** - OpenAI GPT integration for intelligent conversations
- **Multi-language Support** - English and Urdu voice commands
- **Voice Synthesis** - Text-to-speech with customizable settings

### 🔧 **Smart Functionality**
- **Task Management** - Create, update, and track tasks with voice commands
- **Browser Control** - Voice-controlled tab management and navigation
- **Theme Control** - Dynamic theme switching and customization
- **Calculator** - Voice-activated mathematical calculations
- **Real-time Communication** - WebSocket-based instant messaging

### 🎨 **Modern Interface**
- **Responsive Design** - Mobile-first approach with glassmorphism UI
- **Dark/Light Theme** - System preference support
- **Smooth Animations** - Framer Motion powered transitions
- **Floating Widget** - Draggable voice control widget
- **Activity Tracking** - Real-time user activity monitoring

### 🔐 **Professional Features**
- **User Authentication** - JWT-based secure login system
- **Data Persistence** - MongoDB database integration
- **RESTful API** - Comprehensive backend API
- **Real-time Updates** - Socket.io integration
- **Security** - CORS, rate limiting, and data encryption

---

## 🛠️ Technology Stack

<div align="center">

### Frontend
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat-square&logo=typescript)
![Framer Motion](https://img.shields.io/badge/Framer%20Motion-10.0-0055FF?style=flat-square&logo=framer)
![Socket.io](https://img.shields.io/badge/Socket.io-Client-010101?style=flat-square&logo=socket.io)

### Backend
![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js)
![Express](https://img.shields.io/badge/Express-4.18-000000?style=flat-square&logo=express)
![MongoDB](https://img.shields.io/badge/MongoDB-7.0-47A248?style=flat-square&logo=mongodb)
![Socket.io](https://img.shields.io/badge/Socket.io-4.7-010101?style=flat-square&logo=socket.io)

### AI & Services
![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4-412991?style=flat-square&logo=openai)
![JWT](https://img.shields.io/badge/JWT-Auth-000000?style=flat-square&logo=jsonwebtokens)

</div>

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- MongoDB (local or Atlas)
- OpenAI API key

### Installation

```bash
# Clone repository
git clone https://github.com/Zain1098/Virtual-Assistant.git
cd Virtual-Assistant

# Install frontend dependencies
cd client
npm install

# Install backend dependencies
cd ../server
npm install

# Setup environment variables
cp ../.env.example .env
# Edit .env with your API keys
```

### Environment Setup

Create `.env` file in server directory:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/shifra-assistant
JWT_SECRET=your_jwt_secret_key_here
OPENAI_API_KEY=your_openai_api_key_here
NODE_ENV=development
```

Create `.env` file in client directory:

```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_SOCKET_URL=http://localhost:5000
```

### Development

```bash
# Start backend server (Terminal 1)
cd server
npm run dev

# Start frontend (Terminal 2)
cd client
npm start
```

Visit `http://localhost:3000` to see the application.

---

## 📁 Project Structure

```
Virtual-Assistant/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── App.tsx         # Main application
│   │   └── App.css         # Styles
│   └── package.json
├── server/                 # Node.js backend
│   ├── routes/             # API routes
│   ├── models/             # Database models
│   ├── services/           # Business logic
│   ├── middleware/         # Custom middleware
│   └── index.js            # Server entry point
├── .env.example            # Environment template
├── vercel.json             # Vercel deployment config
└── README.md               # Project documentation
```

---

## 🎯 Usage Examples

### Voice Commands

```
🎤 Task Management
"Create task: Buy groceries with high priority"
"Task complete karo: Buy groceries"
"Mere tasks dikhao"

🌐 Browser Control
"New tab kholo"
"Page refresh karo"
"Fullscreen mode on karo"

🎨 Theme Control
"Dark mode activate karo"
"Random color theme lagao"

🧮 Calculator
"Calculate 15 percent of 250"
"Solve 25 plus 75"

⏰ Time & Date
"Time kya hai?"
"Date batao"
```

---

## 🚀 Deployment

### Option 1: Render (Recommended)

#### Frontend Deployment
1. Connect GitHub repo to Render
2. Create **Static Site**
3. Build Command: `cd client && npm install && npm run build`
4. Publish Directory: `client/build`

#### Backend Deployment
1. Create **Web Service** on Render
2. Build Command: `cd server && npm install`
3. Start Command: `cd server && npm start`
4. Add environment variables

### Option 2: Vercel + Railway

#### Frontend (Vercel)
```bash
# Deploy to Vercel
vercel --prod
```

#### Backend (Railway)
```bash
# Deploy to Railway
railway deploy
```

---

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### Assistant
- `POST /api/assistant/command` - Process voice command
- `GET /api/assistant/history` - Get conversation history

### Tasks
- `GET /api/tasks` - Get all tasks
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Zain**
- GitHub: [@Zain1098](https://github.com/Zain1098)
- LinkedIn: [Your LinkedIn](https://linkedin.com/in/your-profile)

---

## 🙏 Acknowledgments

- OpenAI for GPT API
- React team for the amazing framework
- Framer Motion for smooth animations
- Socket.io for real-time communication

---

<div align="center">

**⭐ Star this repository if you found it helpful!**

Made with ❤️ by [Zain](https://github.com/Zain1098)

</div>