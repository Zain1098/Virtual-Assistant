# 🎯 Shifra AI - Intelligent Virtual Assistant

<div align="center">

![Shifra AI](https://img.shields.io/badge/Shifra-AI%20Assistant-blue?style=for-the-badge&logo=react)
![Version](https://img.shields.io/badge/version-2.0.0-green?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-orange?style=for-the-badge)

**A modern AI-powered virtual assistant with voice recognition - Single Deployment Ready**

[🚀 Live Demo](https://shifra-ai-assistant.vercel.app) • [📖 Documentation](#documentation) • [🐛 Report Bug](https://github.com/Zain1098/Virtual-Assistant/issues)

</div>

---

## ✨ Features

### 🎤 **Voice & AI Capabilities**
- **Advanced Voice Recognition** - Real-time speech-to-text processing
- **Multi-language Support** - English and Urdu voice commands
- **Voice Synthesis** - Text-to-speech with customizable settings
- **Smart Command Processing** - Intelligent voice command interpretation

### 🔧 **Smart Functionality**
- **Task Management** - Create, update, and track tasks with voice commands
- **Browser Control** - Voice-controlled tab management and navigation
- **Theme Control** - Dynamic theme switching and customization
- **Calculator** - Voice-activated mathematical calculations
- **Window Control** - Voice commands for window management

### 🎨 **Modern Interface**
- **Responsive Design** - Mobile-first approach with glassmorphism UI
- **Dark/Light Theme** - System preference support
- **Smooth Animations** - Framer Motion powered transitions
- **Floating Widget** - Draggable voice control widget
- **Activity Tracking** - Real-time user activity monitoring

---

## 🛠️ Technology Stack

<div align="center">

### Frontend Only (Standalone)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat-square&logo=typescript)
![Framer Motion](https://img.shields.io/badge/Framer%20Motion-10.0-0055FF?style=flat-square&logo=framer)

</div>

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 

### Installation & Deployment

```bash
# Clone repository
git clone https://github.com/Zain1098/Virtual-Assistant.git
cd Virtual-Assistant

# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build
```

### One-Click Vercel Deployment

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Zain1098/Virtual-Assistant)

**OR**

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to Vercel
vercel --prod
```

---

## 📁 Project Structure

```
Virtual-Assistant/
├── src/                    # React source code
│   ├── components/         # Reusable components
│   ├── App.tsx            # Main application
│   └── App.css            # Styles
├── public/                # Static assets
├── package.json           # Dependencies
├── vercel.json           # Vercel config
└── README.md             # Documentation
```

---

## 🎯 Voice Commands

### Task Management
```
🎤 "Create task: Buy groceries with high priority"
🎤 "Task complete karo: Buy groceries"
🎤 "Mere tasks dikhao"
```

### Browser Control
```
🎤 "New tab kholo"
🎤 "Page refresh karo"
🎤 "Fullscreen mode on karo"
```

### Theme Control
```
🎤 "Dark mode activate karo"
🎤 "Random color theme lagao"
```

### Calculator
```
🎤 "Calculate 15 percent of 250"
🎤 "Solve 25 plus 75"
```

### Time & Date
```
🎤 "Time kya hai?"
🎤 "Date batao"
```

---

## 🚀 Deployment Options

### Option 1: Vercel (Recommended)
1. Push code to GitHub
2. Connect repository to Vercel
3. Deploy automatically

### Option 2: Netlify
1. Build project: `npm run build`
2. Upload `build` folder to Netlify

### Option 3: GitHub Pages
1. Install gh-pages: `npm install --save-dev gh-pages`
2. Add to package.json: `"homepage": "https://yourusername.github.io/Virtual-Assistant"`
3. Deploy: `npm run deploy`

---

## 🔧 Configuration

### Environment Variables
```env
REACT_APP_API_URL=https://your-domain.vercel.app
REACT_APP_SOCKET_URL=https://your-domain.vercel.app
```

### Vercel Configuration (vercel.json)
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "build",
  "installCommand": "npm install",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

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

## 👨💻 Author

**Zain**
- GitHub: [@Zain1098](https://github.com/Zain1098)

---

## 🙏 Acknowledgments

- React team for the amazing framework
- Framer Motion for smooth animations
- Web Speech API for voice recognition

---

<div align="center">

**⭐ Star this repository if you found it helpful!**

Made with ❤️ by [Zain](https://github.com/Zain1098)

</div>