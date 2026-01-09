import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Send, Settings, User, Moon, Sun, ChevronDown, Volume2, Activity, CheckSquare, MessageCircle, Bell, Palette, Shield, LogOut, Plus, Trash2 } from 'lucide-react';
import Auth from './components/Auth';

import './App.css';
import './components/Auth.css';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
  type?: 'text' | 'command' | 'response' | 'info' | 'greeting';
}

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isConnected, setIsConnected] = useState(true);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [user, setUser] = useState<any>(null);
  const [showSettingsDropdown, setShowSettingsDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [voiceSettings, setVoiceSettings] = useState({ rate: 1, pitch: 1, volume: 1 });
  const [showVoiceSettings, setShowVoiceSettings] = useState(false);
  const [showActivityPanel, setShowActivityPanel] = useState(false);
  const [showTasksPanel, setShowTasksPanel] = useState(false);
  const [tasks, setTasks] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [isBackgroundListening, setIsBackgroundListening] = useState(false);
  const [showFloatingWidget, setShowFloatingWidget] = useState(false);
  
  const socketRef = useRef<any>(null);
  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const getUserId = () => {
    let userId = localStorage.getItem('shifra_user_id');
    if (!userId) {
      userId = 'user_' + Date.now();
      localStorage.setItem('shifra_user_id', userId);
    }
    return userId;
  };

  const handleLogin = (userData: any) => {
    setUser(userData);
    setIsAuthenticated(true);
    setShowAuthModal(false);
    setIsLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('shifra_token');
    localStorage.removeItem('shifra_user');
    setUser(null);
    setShowAuthModal(false);
  };

  const showLoginModal = () => {
    setShowAuthModal(true);
  };

  const addActivity = (action: string, type: 'command' | 'setting' | 'connection' | 'task') => {
    const newActivity = {
      id: Date.now(),
      action,
      time: new Date(),
      type
    };
    setActivities(prev => [newActivity, ...prev.slice(0, 9)]);
  };

  useEffect(() => {
    const token = localStorage.getItem('shifra_token');
    const savedUser = localStorage.getItem('shifra_user');
    
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
    }
    
    const userId = getUserId();
    const savedTasks = localStorage.getItem(`shifra_tasks_${userId}`);
    const savedActivities = localStorage.getItem(`shifra_activities_${userId}`);
    
    if (savedTasks) setTasks(JSON.parse(savedTasks));
    if (savedActivities) setActivities(JSON.parse(savedActivities));
    
    addActivity('Connected to local assistant', 'connection');
    
    setTimeout(() => {
      addMessage('Hello! I am Shifra, your AI assistant. Try saying "time kya hai" or "open youtube".', 'assistant', 'greeting');
    }, 1000);

    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        handleVoiceCommand(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.log('Speech recognition error:', event.error);
        setIsListening(false);
      };
      recognitionRef.current.onend = () => setIsListening(false);
    }

    return () => {};
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const addMessage = (text: string, sender: 'user' | 'assistant', type: string = 'text') => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      sender,
      timestamp: new Date(),
      type: type as any
    };
    setMessages(prev => [...prev, newMessage]);
  };

  // Smart AI Processing
  const processSmartCommand = async (command: string) => {
    const cmd = command.toLowerCase();
    
    // Greetings
    if (/\b(hi|hello|hey|namaste|salam|kaise ho|kaisa hai|kya haal)\b/i.test(cmd)) {
      const responses = [
        'Hello! Main Shifra hun, aapka AI assistant.',
        'Hi! Main theek hun, aap kaise hain?',
        'Namaste! Kya madad kar sakti hun?'
      ];
      const voiceResponses = [
        'Hello! I am Shifra, your AI assistant.',
        'Hi! I am fine, how are you?',
        'Hello! How can I help you?'
      ];
      const index = Math.floor(Math.random() * responses.length);
      addMessage(responses[index], 'assistant', 'greeting');
      speak(voiceResponses[index]);
      return true;
    }
    
    // Time/Date queries
    if (/\b(time|date|day|din|waqt|tarikh|aaj|today|current|kya|konsa|kitna|baje)\b/i.test(cmd)) {
      if (/\b(time|waqt|baje|kitna)\b/i.test(cmd)) {
        const time = new Date().toLocaleTimeString('en-US', { hour12: true });
        addMessage(`Current time: ${time}`, 'assistant', 'info');
        speak(`Current time is ${time}`);
        return true;
      }
      if (/\b(date|tarikh|aaj|today|din|day|konsa)\b/i.test(cmd)) {
        const date = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        addMessage(`Today is ${date}`, 'assistant', 'info');
        speak(`Today is ${date}`);
        return true;
      }
    }
    
    // Website opening
    const websiteMatch = cmd.match(/(?:open|kholo|visit|chalo)\s+([a-zA-Z0-9]+)/i);
    if (websiteMatch) {
      const site = websiteMatch[1].toLowerCase();
      const siteMap: {[key: string]: string} = {
        'youtube': 'https://youtube.com',
        'google': 'https://google.com',
        'facebook': 'https://facebook.com',
        'instagram': 'https://instagram.com',
        'twitter': 'https://twitter.com',
        'github': 'https://github.com'
      };
      
      const url = siteMap[site] || `https://${site}.com`;
      const siteName = site.charAt(0).toUpperCase() + site.slice(1);
      
      addMessage(`${siteName} khol raha hun`, 'assistant', 'info');
      speak(`Opening ${siteName}`);
      window.open(url, '_blank');
      return true;
    }
    
    // Search queries
    const searchMatch = cmd.match(/(?:search|find|dhundo|batao)\s+(.+)/i);
    if (searchMatch) {
      const query = searchMatch[1];
      const searchUrl = `https://google.com/search?q=${encodeURIComponent(query)}`;
      addMessage(`"${query}" search kar raha hun`, 'assistant', 'info');
      speak(`Searching for ${query}`);
      window.open(searchUrl, '_blank');
      return true;
    }
    
    // Task creation
    if (/\b(task|kaam|todo|reminder|yaad)\b/i.test(cmd)) {
      const taskText = cmd.replace(/(?:task|kaam|todo|reminder|yaad|banao|karo|create|add|make)\s*/gi, '').trim();
      if (taskText) {
        const newTask = {
          id: Date.now(),
          title: taskText,
          completed: false,
          priority: 'medium' as 'low' | 'medium' | 'high'
        };
        setTasks(prev => [...prev, newTask]);
        addMessage(`Task ban gaya: "${taskText}"`, 'assistant', 'info');
        speak(`Task created: ${taskText}`);
        return true;
      }
    }
    
    // Math calculations
    if (/\b(calculate|compute|solve|hisab|plus|minus|jama|kam|\d)\b/i.test(cmd)) {
      try {
        let expression = cmd
          .replace(/plus|jama/gi, '+')
          .replace(/minus|kam/gi, '-')
          .replace(/multiply|guna/gi, '*')
          .replace(/divide|bhag/gi, '/')
          .replace(/[^0-9+\-*/.() ]/g, '')
          .replace(/\s+/g, '');
          
        if (expression && /[0-9]/.test(expression)) {
          const result = eval(expression);
          addMessage(`Jawab: ${result}`, 'assistant', 'info');
          speak(`The answer is ${result}`);
          return true;
        }
      } catch (error) {
        addMessage('Calculation samjh nahi aaya', 'assistant', 'info');
        speak('Could not understand the calculation');
        return true;
      }
    }
    
    // Theme control
    if (/\b(dark mode|light mode|theme|andhera|ujala)\b/i.test(cmd)) {
      if (/\b(dark|andhera)\b/i.test(cmd)) {
        setTheme('dark');
        addMessage('Dark mode on kar diya', 'assistant', 'info');
        speak('Dark mode activated');
        return true;
      }
      if (/\b(light|ujala)\b/i.test(cmd)) {
        setTheme('light');
        addMessage('Light mode on kar diya', 'assistant', 'info');
        speak('Light mode activated');
        return true;
      }
    }
    
    // General conversation
    if (/\b(thanks|thank you|shukriya|dhanyawad)\b/i.test(cmd)) {
      addMessage('Welcome! Koi aur madad chahiye?', 'assistant', 'info');
      speak('You are welcome! Do you need any other help?');
      return true;
    }
    
    if (/\b(bye|goodbye|alvida|khuda hafiz)\b/i.test(cmd)) {
      addMessage('Goodbye! Phir milenge!', 'assistant', 'info');
      speak('Goodbye! See you later!');
      return true;
    }
    
    // Default smart response
    addMessage(`Main "${command}" samjh gaya. Kya aap chahte hain ke main Google pe search karun?`, 'assistant', 'info');
    speak('I understand. Let me search that on Google for you');
    setTimeout(() => {
      window.open(`https://google.com/search?q=${encodeURIComponent(command)}`, '_blank');
    }, 1000);
    return true;
  };

  const handleVoiceCommand = async (command: string, isVoice: boolean = true) => {
    addMessage(command, 'user', 'command');
    addActivity(`${isVoice ? 'Voice' : 'Text'} command: "${command}"`, 'command');
    
    await processSmartCommand(command);
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim()) {
      handleVoiceCommand(inputText, false);
      setInputText('');
    }
  };

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      try {
        setIsListening(true);
        recognitionRef.current.start();
      } catch (error) {
        console.log('Failed to start voice recognition:', error);
        setIsListening(false);
        addMessage('Voice recognition not available. Please use text input.', 'assistant', 'info');
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const speak = (text: string) => {
    try {
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = voiceSettings.rate;
        utterance.pitch = voiceSettings.pitch;
        utterance.volume = voiceSettings.volume;
        utterance.lang = 'en-US'; // Always use English voice
        speechSynthesis.speak(utterance);
      }
    } catch (error) {
      console.log('Speech synthesis error:', error);
    }
  };

  const handleVoiceSettings = () => {
    setShowVoiceSettings(true);
    setShowSettingsDropdown(false);
    addActivity('Opened voice settings', 'setting');
  };

  const handleActivityView = () => {
    setShowActivityPanel(true);
    setShowUserDropdown(false);
    addActivity('Viewed activity panel', 'setting');
  };

  const handleTasksView = () => {
    setShowTasksPanel(true);
    setShowUserDropdown(false);
  };

  const handleChatHistory = () => {
    const historyMessages: Message[] = [
      { id: 'hist1', text: 'Previous conversation loaded', sender: 'assistant', timestamp: new Date(), type: 'info' }
    ];
    setMessages(prev => [...historyMessages, ...prev]);
    setShowUserDropdown(false);
  };

  const toggleTask = (taskId: number) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
  };

  const addNewTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskTitle.trim()) {
      const newTask = {
        id: Date.now(),
        title: newTaskTitle.trim(),
        completed: false,
        priority: newTaskPriority
      };
      setTasks(prev => [...prev, newTask]);
      setNewTaskTitle('');
      setNewTaskPriority('medium');
      addMessage(`Task created: ${newTask.title}`, 'assistant', 'info');
      addActivity(`Created task: "${newTask.title}"`, 'task');
    }
  };

  const deleteTask = (taskId: number) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      addActivity(`Deleted task: "${task.title}"`, 'task');
    }
    setTasks(prev => prev.filter(task => task.id !== taskId));
  };

  const clearNotifications = () => {
    addMessage('All notifications cleared', 'assistant', 'info');
    addActivity('Cleared all notifications', 'setting');
  };

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    addActivity(`Changed theme to ${newTheme} mode`, 'setting');
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className={`app ${theme}`}>
      <div className="app-container">
        {/* Header */}
        <header className="app-header">
          <div className="header-content">
            <div className="logo-section">
              <div className="logo-circle">
                <span className="logo-text">S</span>
              </div>
              <h1 className="app-title">
                <span className="name-highlight">Shifra</span>
                <span className="subtitle">AI Assistant</span>
              </h1>
            </div>
            
            <div className="header-controls">
              <button onClick={toggleTheme} className="control-btn" title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}>
                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
              </button>

              <div className="dropdown-container">
                <button 
                  onClick={() => setShowSettingsDropdown(!showSettingsDropdown)} 
                  className="control-btn dropdown-btn"
                  title="Settings"
                >
                  <Settings size={18} />
                  <ChevronDown size={14} />
                </button>
                {showSettingsDropdown && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="dropdown-menu"
                  >
                    <button className="dropdown-item" onClick={handleVoiceSettings}>
                      <Volume2 size={16} />
                      Voice Settings
                    </button>
                    <button className="dropdown-item" onClick={clearNotifications}>
                      <Bell size={16} />
                      Clear Notifications
                    </button>
                  </motion.div>
                )}
              </div>

              <div className="dropdown-container">
                <button 
                  onClick={() => setShowUserDropdown(!showUserDropdown)} 
                  className="control-btn dropdown-btn"
                  title="User Profile"
                >
                  <User size={18} />
                  <ChevronDown size={14} />
                </button>
                {showUserDropdown && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="dropdown-menu"
                  >
                    <div className="dropdown-item user-info">
                      <div className="user-avatar">S</div>
                      <div>
                        <div className="user-name">{user?.name || 'Guest User'}</div>
                        <div className="user-status">{user ? 'Logged In' : 'Guest Mode'}</div>
                      </div>
                    </div>
                    <div className="dropdown-divider"></div>
                    <button className="dropdown-item" onClick={handleActivityView}>
                      <Activity size={16} />
                      My Activity
                    </button>
                    <button className="dropdown-item" onClick={handleTasksView}>
                      <CheckSquare size={16} />
                      My Tasks
                    </button>
                    <button className="dropdown-item" onClick={handleChatHistory}>
                      <MessageCircle size={16} />
                      Chat History
                    </button>
                    <div className="dropdown-divider"></div>
                    {!user ? (
                      <button className="dropdown-item login-item" onClick={showLoginModal}>
                        <User size={16} />
                        Sign In / Sign Up
                      </button>
                    ) : (
                      <button className="dropdown-item logout-item" onClick={handleLogout}>
                        <LogOut size={16} />
                        Sign Out
                      </button>
                    )}
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Chat Area */}
        <main className="chat-area">
          <div className="messages-container">
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`message ${message.sender}`}
                >
                  <div className="message-content">
                    <p>{message.text}</p>
                    <span className="message-time">
                      {message.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>

          {/* Voice Visualization */}
          <AnimatePresence>
            {isListening && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="voice-visualization"
              >
                <div className="voice-waves">
                  {[...Array(5)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="wave"
                      animate={{
                        scaleY: [1, 2, 1],
                        opacity: [0.5, 1, 0.5]
                      }}
                      transition={{
                        duration: 0.8,
                        repeat: Infinity,
                        delay: i * 0.1
                      }}
                    />
                  ))}
                </div>
                <p className="listening-text">
                  Listening...
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Input Area */}
        <footer className="input-area">
          <form onSubmit={handleTextSubmit} className="input-form">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type your message or use voice..."
              className="text-input"
            />
            <button type="submit" className="send-btn">
              <Send size={20} />
            </button>
          </form>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={isListening ? stopListening : startListening}
            className={`voice-btn ${isListening ? 'listening' : ''}`}
          >
            {isListening ? <MicOff size={24} /> : <Mic size={24} />}
            <span className="voice-btn-text">
              {isListening ? 'Stop' : 'Voice'}
            </span>
          </motion.button>

          <div className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
            <div className="status-dot" />
            <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
          </div>
        </footer>

        {/* Voice Settings Modal */}
        <AnimatePresence>
          {showVoiceSettings && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="modal-overlay"
              onClick={() => setShowVoiceSettings(false)}
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="modal-content"
                onClick={(e) => e.stopPropagation()}
              >
                <h3>Voice Settings</h3>
                <div className="voice-controls">
                  <div className="control-group">
                    <label>Speech Rate: {voiceSettings.rate}</label>
                    <input
                      type="range"
                      min="0.5"
                      max="2"
                      step="0.1"
                      value={voiceSettings.rate}
                      onChange={(e) => setVoiceSettings(prev => ({ ...prev, rate: parseFloat(e.target.value) }))}
                    />
                  </div>
                  <div className="control-group">
                    <label>Pitch: {voiceSettings.pitch}</label>
                    <input
                      type="range"
                      min="0.5"
                      max="2"
                      step="0.1"
                      value={voiceSettings.pitch}
                      onChange={(e) => setVoiceSettings(prev => ({ ...prev, pitch: parseFloat(e.target.value) }))}
                    />
                  </div>
                  <div className="control-group">
                    <label>Volume: {voiceSettings.volume}</label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={voiceSettings.volume}
                      onChange={(e) => setVoiceSettings(prev => ({ ...prev, volume: parseFloat(e.target.value) }))}
                    />
                  </div>
                  <button className="test-voice-btn" onClick={() => speak('This is a test of your voice settings')}>Test Voice</button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Activity Panel */}
        <AnimatePresence>
          {showActivityPanel && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="modal-overlay"
              onClick={() => setShowActivityPanel(false)}
            >
              <motion.div
                initial={{ x: 300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 300, opacity: 0 }}
                className="side-panel"
                onClick={(e) => e.stopPropagation()}
              >
                <h3>Recent Activity</h3>
                <div className="activity-list">
                  {activities.map((activity) => (
                    <div key={activity.id} className="activity-item">
                      <div className={`activity-icon ${activity.type}`}>
                        {activity.type === 'command' && <Mic size={16} />}
                        {activity.type === 'setting' && <Settings size={16} />}
                        {activity.type === 'connection' && <Activity size={16} />}
                      </div>
                      <div className="activity-details">
                        <p>{activity.action}</p>
                        <span>{activity.time.toLocaleTimeString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tasks Panel */}
        <AnimatePresence>
          {showTasksPanel && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="modal-overlay"
              onClick={() => setShowTasksPanel(false)}
            >
              <motion.div
                initial={{ x: 300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 300, opacity: 0 }}
                className="side-panel"
                onClick={(e) => e.stopPropagation()}
              >
                <h3>My Tasks</h3>
                
                <form onSubmit={addNewTask} className="add-task-form">
                  <input
                    type="text"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    placeholder="Enter new task..."
                    className="task-input"
                  />
                  <div className="task-form-controls">
                    <select 
                      value={newTaskPriority} 
                      onChange={(e) => setNewTaskPriority(e.target.value as 'low' | 'medium' | 'high')}
                      className="priority-select"
                    >
                      <option value="low">Low Priority</option>
                      <option value="medium">Medium Priority</option>
                      <option value="high">High Priority</option>
                    </select>
                    <button type="submit" className="add-task-btn">
                      <Plus size={16} />
                    </button>
                  </div>
                </form>
                <div className="tasks-list">
                  {tasks.map((task) => (
                    <div key={task.id} className={`task-item ${task.completed ? 'completed' : ''}`}>
                      <button 
                        className="task-checkbox"
                        onClick={() => toggleTask(task.id)}
                      >
                        {task.completed && <CheckSquare size={16} />}
                        {!task.completed && <div className="empty-checkbox" />}
                      </button>
                      <div className="task-details">
                        <p className={task.completed ? 'completed-text' : ''}>{task.title}</p>
                        <span className={`priority ${task.priority}`}>{task.priority} priority</span>
                      </div>
                      <button 
                        className="delete-task-btn"
                        onClick={() => deleteTask(task.id)}
                        title="Delete task"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Auth Modal */}
        <AnimatePresence>
          {showAuthModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="modal-overlay"
              onClick={() => setShowAuthModal(false)}
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
              >
                <Auth onLogin={handleLogin} />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default App;