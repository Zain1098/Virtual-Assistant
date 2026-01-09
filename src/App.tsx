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
  const [isAuthenticated, setIsAuthenticated] = useState(true); // Start as guest
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

  // Generate or get user ID
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

  // Add activity function
  const addActivity = (action: string, type: 'command' | 'setting' | 'connection' | 'task') => {
    const newActivity = {
      id: Date.now(),
      action,
      time: new Date(),
      type
    };
    setActivities(prev => [newActivity, ...prev.slice(0, 9)]); // Keep only last 10 activities
  };

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('shifra_token');
    const savedUser = localStorage.getItem('shifra_user');
    
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
    }
    
    // Load saved data
    const userId = getUserId();
    const savedTasks = localStorage.getItem(`shifra_tasks_${userId}`);
    const savedActivities = localStorage.getItem(`shifra_activities_${userId}`);
    
    if (savedTasks) setTasks(JSON.parse(savedTasks));
    if (savedActivities) setActivities(JSON.parse(savedActivities));
    
    // Simulate connection
    addActivity('Connected to local assistant', 'connection');

    // Initialize Speech Recognition with multi-language support
    if ('webkitSpeechRecognition' in window) {
      recognitionRef.current = new (window as any).webkitSpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        handleVoiceCommand(transcript);
        setIsListening(false);
        
        if (isBackgroundListening) {
          setTimeout(() => {
            if (recognitionRef.current && !isListening) {
              recognitionRef.current.start();
              setIsListening(true);
            }
          }, 1000);
        }
      };

      recognitionRef.current.onerror = () => setIsListening(false);
      recognitionRef.current.onend = () => setIsListening(false);
    }

    return () => {
      // Cleanup
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Global hotkey listener
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.shiftKey && event.key === 'V') {
        event.preventDefault();
        if (!isListening) {
          startListening();
          window.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [isListening]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.dropdown-container') && !target.closest('.modal-content') && !target.closest('.side-panel')) {
        setShowSettingsDropdown(false);
        setShowUserDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  const handleVoiceCommand = (command: string) => {
    addMessage(command, 'user', 'command');
    addActivity(`Voice command: "${command}"`, 'command');
    
    const lowerCommand = command.toLowerCase();
    
    // Urdu Task Creation Commands
    const urduTaskMatch = lowerCommand.match(/(?:task banao|kaam banao|task add karo|kaam add karo|ek task create karo|task create karo)\s+(.+?)(?:\s+(?:high|medium|low|zaroori|aam|kam)\s+priority)?$/i) ||
                         lowerCommand.match(/(.+?)\s+(?:ka|ke)\s+(?:task|kaam)\s+banao/i) ||
                         lowerCommand.match(/mujhe\s+(.+?)\s+(?:karna|krna)\s+hai/i) ||
                         lowerCommand.match(/(.+?)\s+(?:hai|karni hai|karna hai|krna hai)$/i);
    
    // English Task Creation Commands  
    const taskMatch = lowerCommand.match(/(?:create|add|make)\s+(?:a\s+)?task\s+(.+?)(?:\s+(?:with|as)\s+(high|medium|low)\s+priority)?$/i);
    
    if (urduTaskMatch || taskMatch) {
      let taskTitle, priority;
      
      if (urduTaskMatch) {
        taskTitle = urduTaskMatch[1].trim();
        priority = 'medium';
        if (lowerCommand.includes('zaroori') || lowerCommand.includes('important')) priority = 'high';
        if (lowerCommand.includes('kam') || lowerCommand.includes('low')) priority = 'low';
      } else if (taskMatch) {
        taskTitle = taskMatch[1].trim();
        priority = (taskMatch[2] || 'medium').toLowerCase() as 'low' | 'medium' | 'high';
      }
      
      const newTask = {
        id: Date.now(),
        title: taskTitle,
        completed: false,
        priority: priority as 'low' | 'medium' | 'high'
      };
      
      setTasks(prev => [...prev, newTask]);
      addMessage(`Task created: "${taskTitle}" with ${priority} priority`, 'assistant', 'info');
      addActivity(`Created task: "${taskTitle}"`, 'task');
      speak(`Task ban gaya: ${taskTitle}`);
      return;
    }
    
    // Urdu Task Completion Commands
    const urduCompleteMatch = lowerCommand.match(/(?:task complete karo|kaam complete karo|task khatam karo|kaam khatam karo)\s+(.+)/i) ||
                             lowerCommand.match(/(.+?)\s+(?:complete|khatam|done)\s+(?:karo|kar do)/i) ||
                             lowerCommand.match(/(.+?)\s+(?:ho gaya|hogaya)/i);
    
    // English Task Completion Commands
    const completeMatch = lowerCommand.match(/(?:complete|finish|done)\s+task\s+(.+)/i);
    
    if (urduCompleteMatch || completeMatch) {
      const taskTitle = (urduCompleteMatch?.[1] || completeMatch?.[1])?.trim().toLowerCase();
      const task = tasks.find(t => t.title.toLowerCase().includes(taskTitle));
      if (task) {
        toggleTask(task.id);
        addMessage(`Task "${task.title}" marked as completed`, 'assistant', 'info');
        addActivity(`Completed task: "${task.title}"`, 'task');
        speak(`${task.title} complete ho gaya`);
        return;
      } else {
        addMessage('Task nahi mila', 'assistant', 'info');
        speak('Task nahi mila');
        return;
      }
    }
    
    // Urdu Show Tasks Commands
    if (lowerCommand.includes('mere tasks') || lowerCommand.includes('mere kaam') || 
        lowerCommand.includes('tasks dikhao') || lowerCommand.includes('kaam dikhao') ||
        lowerCommand.includes('show tasks') || lowerCommand.includes('my tasks')) {
      setShowTasksPanel(true);
      addMessage('Aapke tasks khol rahe hain', 'assistant', 'info');
      speak('Aapke tasks khol rahe hain');
      return;
    }
    
    // Browser Control Commands (Urdu & English)
    if (lowerCommand.includes('chrome') && (lowerCommand.includes('close') || lowerCommand.includes('band'))) {
      addMessage('Chrome browser close karne ki koshish kar raha hun', 'assistant', 'info');
      speak('Chrome browser close kar raha hun');
      // Note: Browser cannot actually close other applications due to security restrictions
      return;
    }
    
    if (lowerCommand.includes('browser') && (lowerCommand.includes('close') || lowerCommand.includes('band'))) {
      addMessage('Browser close karne ki koshish kar raha hun', 'assistant', 'info');
      speak('Browser close kar raha hun');
      // This will close the current tab/window
      setTimeout(() => window.close(), 1000);
      return;
    }
    
    // New Tab Commands
    if (lowerCommand.includes('new tab') || lowerCommand.includes('naya tab') || lowerCommand.includes('nayi tab')) {
      addMessage('Naya tab khol raha hun', 'assistant', 'info');
      speak('Naya tab khol raha hun');
      window.open('', '_blank');
      return;
    }
    
    // Refresh Commands
    if (lowerCommand.includes('refresh') || lowerCommand.includes('reload') || lowerCommand.includes('page refresh')) {
      addMessage('Page refresh kar raha hun', 'assistant', 'info');
      speak('Page refresh kar raha hun');
      setTimeout(() => window.location.reload(), 1000);
      return;
    }
    
    // Screen Control Commands
    if (lowerCommand.includes('fullscreen') || lowerCommand.includes('full screen') || lowerCommand.includes('poora screen')) {
      addMessage('Fullscreen mode activate kar raha hun', 'assistant', 'info');
      speak('Fullscreen mode on kar raha hun');
      document.documentElement.requestFullscreen();
      return;
    }
    
    if (lowerCommand.includes('exit fullscreen') || lowerCommand.includes('fullscreen band')) {
      addMessage('Fullscreen mode band kar raha hun', 'assistant', 'info');
      speak('Fullscreen mode off kar raha hun');
      document.exitFullscreen();
      return;
    }
    
    // Theme Control Commands
    if (lowerCommand.includes('dark mode') || lowerCommand.includes('dark theme') || lowerCommand.includes('andhera kar do')) {
      setTheme('dark');
      addMessage('Dark mode activate kar diya', 'assistant', 'info');
      speak('Dark mode on kar diya');
      return;
    }
    
    if (lowerCommand.includes('light mode') || lowerCommand.includes('light theme') || lowerCommand.includes('ujala kar do')) {
      setTheme('light');
      addMessage('Light mode activate kar diya', 'assistant', 'info');
      speak('Light mode on kar diya');
      return;
    }
    
    // Fun Commands
    if (lowerCommand.includes('joke sunao') || lowerCommand.includes('mazak sunao') || lowerCommand.includes('tell me a joke')) {
      const jokes = [
        'Programmer ki wife: Tum hamesha computer ke saath kyun rehte ho? Programmer: Kyunki computer kabhi galat nahi bolti!',
        'Teacher: Beta, Internet ka full form kya hai? Student: Interesting Network of Talented Educated Rats Not Eating Tacos!',
        'Why do programmers prefer dark mode? Because light attracts bugs!'
      ];
      const randomJoke = jokes[Math.floor(Math.random() * jokes.length)];
      addMessage(randomJoke, 'assistant', 'info');
      speak(randomJoke);
      return;
    }
    
    // Time & Date Commands
    if (lowerCommand.includes('time kya hai') || lowerCommand.includes('waqt batao') || lowerCommand.includes('what time is it')) {
      const time = new Date().toLocaleTimeString('en-US', { hour12: true });
      addMessage(`Current time: ${time}`, 'assistant', 'info');
      speak(`Abhi time hai ${time}`);
      return;
    }
    
    if (lowerCommand.includes('date kya hai') || lowerCommand.includes('tarikh batao') || lowerCommand.includes('what date is it')) {
      const date = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
      addMessage(`Today's date: ${date}`, 'assistant', 'info');
      speak(`Aaj ki date hai ${date}`);
      return;
    }
    
    // Calculator Commands
    const mathMatch = lowerCommand.match(/(?:calculate|compute|solve|hisab karo|calculate karo)\s+(.+)/i) ||
                     lowerCommand.match(/(.+?)\s+(?:ka jawab|ka hisab|calculate|solve)/i);
    
    if (mathMatch) {
      try {
        const expression = mathMatch[1].replace(/[^0-9+\-*/.() ]/g, '');
        const result = eval(expression);
        addMessage(`${mathMatch[1]} = ${result}`, 'assistant', 'info');
        speak(`Jawab hai ${result}`);
        return;
      } catch {
        addMessage('Sorry, calculation nahi kar saka', 'assistant', 'info');
        speak('Calculation mein problem hai');
        return;
      }
    }
    
    // Voice Speed Control
    if (lowerCommand.includes('voice slow karo') || lowerCommand.includes('awaz slow karo')) {
      setVoiceSettings(prev => ({ ...prev, rate: Math.max(0.5, prev.rate - 0.2) }));
      addMessage('Voice speed slow kar diya', 'assistant', 'info');
      speak('Voice speed slow kar diya');
      return;
    }
    
    if (lowerCommand.includes('voice fast karo') || lowerCommand.includes('awaz fast karo')) {
      setVoiceSettings(prev => ({ ...prev, rate: Math.min(2, prev.rate + 0.2) }));
      addMessage('Voice speed fast kar diya', 'assistant', 'info');
      speak('Voice speed fast kar diya');
      return;
    }
    
    // Random Color Theme
    if (lowerCommand.includes('random color') || lowerCommand.includes('rang badlo') || lowerCommand.includes('color change karo')) {
      const colors = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe'];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      document.documentElement.style.setProperty('--primary-gradient', `linear-gradient(135deg, ${randomColor} 0%, #764ba2 100%)`);
      addMessage('Random color theme apply kar diya!', 'assistant', 'info');
      speak('Naya color theme laga diya');
      return;
    }
    
    // Window Control Commands
    if (lowerCommand.includes('window minimize') || lowerCommand.includes('window chota karo') || lowerCommand.includes('minimize karo')) {
      addMessage('Window minimize kar raha hun', 'assistant', 'info');
      speak('Window minimize kar raha hun');
      // Browser limitation: Cannot minimize programmatically
      return;
    }
    
    if (lowerCommand.includes('window maximize') || lowerCommand.includes('window bara karo') || lowerCommand.includes('maximize karo')) {
      addMessage('Window maximize kar raha hun', 'assistant', 'info');
      speak('Window maximize kar raha hun');
      // Try to maximize by going fullscreen
      document.documentElement.requestFullscreen();
      return;
    }
    
    // Window Size Control
    if (lowerCommand.includes('window resize') || lowerCommand.includes('window size change') || lowerCommand.includes('window ka size badlo')) {
      addMessage('Window resize kar raha hun', 'assistant', 'info');
      speak('Window resize kar raha hun');
      window.resizeTo(1200, 800);
      return;
    }
    
    if (lowerCommand.includes('window center') || lowerCommand.includes('window beech mein') || lowerCommand.includes('center karo')) {
      addMessage('Window center kar raha hun', 'assistant', 'info');
      speak('Window center kar raha hun');
      const screenWidth = window.screen.width;
      const screenHeight = window.screen.height;
      const windowWidth = 1200;
      const windowHeight = 800;
      window.moveTo((screenWidth - windowWidth) / 2, (screenHeight - windowHeight) / 2);
      return;
    }
    
    // Window Position Control
    if (lowerCommand.includes('window left') || lowerCommand.includes('window baayen') || lowerCommand.includes('left side karo')) {
      addMessage('Window left side move kar raha hun', 'assistant', 'info');
      speak('Window left side kar raha hun');
      window.moveTo(0, 0);
      return;
    }
    
    if (lowerCommand.includes('window right') || lowerCommand.includes('window daayen') || lowerCommand.includes('right side karo')) {
      addMessage('Window right side move kar raha hun', 'assistant', 'info');
      speak('Window right side kar raha hun');
      window.moveTo(window.screen.width - window.outerWidth, 0);
      return;
    }
    
    // Window Focus Control
    if (lowerCommand.includes('window focus') || lowerCommand.includes('window front') || lowerCommand.includes('saamne lao')) {
      addMessage('Window focus kar raha hun', 'assistant', 'info');
      speak('Window focus kar raha hun');
      window.focus();
      return;
    }
    
    // Window Scroll Control
    if (lowerCommand.includes('scroll up') || lowerCommand.includes('upar scroll') || lowerCommand.includes('page upar karo')) {
      addMessage('Page upar scroll kar raha hun', 'assistant', 'info');
      speak('Page upar scroll kar raha hun');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    
    if (lowerCommand.includes('scroll down') || lowerCommand.includes('neeche scroll') || lowerCommand.includes('page neeche karo')) {
      addMessage('Page neeche scroll kar raha hun', 'assistant', 'info');
      speak('Page neeche scroll kar raha hun');
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
      return;
    }
    
    // Background Mode Commands
    if (lowerCommand.includes('background mode on') || lowerCommand.includes('hamesha sun te raho')) {
      setIsBackgroundListening(true);
      setShowFloatingWidget(true);
      addMessage('Floating widget activated!', 'assistant', 'info');
      speak('Floating widget on kar diya');
      return;
    }
    
    if (lowerCommand.includes('background mode off') || lowerCommand.includes('background band karo')) {
      setIsBackgroundListening(false);
      setShowFloatingWidget(false);
      addMessage('Floating widget deactivated', 'assistant', 'info');
      speak('Floating widget off kar diya');
      return;
    }
    
    // Default response for unhandled commands
    addMessage('Command received. This is a demo version.', 'assistant', 'info');
    speak('Command samjh gaya, demo version hai');
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim()) {
      handleVoiceCommand(inputText);
      setInputText('');
    }
  };

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const speak = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = voiceSettings.rate;
    utterance.pitch = voiceSettings.pitch;
    utterance.volume = voiceSettings.volume;
    utterance.lang = 'en-US';
    speechSynthesis.speak(utterance);
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
    // Add sample tasks
    setTasks([
      { id: 1, title: 'Check weather updates', completed: false, priority: 'medium' },
      { id: 2, title: 'Review calendar events', completed: true, priority: 'high' },
      { id: 3, title: 'Send follow-up emails', completed: false, priority: 'low' }
    ]);
  };

  const handleChatHistory = () => {
    // Show chat history in messages
    const historyMessages: Message[] = [
      { id: 'hist1', text: 'Previous conversation loaded', sender: 'assistant', timestamp: new Date(), type: 'info' },
      { id: 'hist2', text: 'What can I help you with today?', sender: 'assistant', timestamp: new Date(), type: 'greeting' }
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
      setTasks(prev => {
        const updated = [...prev, newTask];
        localStorage.setItem(`shifra_tasks_${getUserId()}`, JSON.stringify(updated));
        return updated;
      });
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
              {/* Theme Toggle */}
              <button onClick={toggleTheme} className="control-btn" title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}>
                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
              </button>

              {/* Settings Dropdown */}
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

              {/* User Dropdown */}
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
                
                {/* Add New Task Form */}
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

        {/* Floating Voice Widget */}
        <AnimatePresence>
          {showFloatingWidget && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="floating-widget"
              drag
            >
              <motion.button
                onClick={isListening ? stopListening : startListening}
                className={`widget-btn ${isListening ? 'listening' : ''}`}
              >
                {isListening ? <MicOff size={16} /> : <Mic size={16} />}
              </motion.button>
              <button 
                className="widget-close"
                onClick={() => setShowFloatingWidget(false)}
              >
                ×
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default App;