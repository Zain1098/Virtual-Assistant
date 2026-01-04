const fs = require('fs');
const path = require('path');

class DataStorage {
  constructor() {
    this.dataFile = path.join(__dirname, 'data.json');
    this.loadData();
  }

  loadData() {
    try {
      if (fs.existsSync(this.dataFile)) {
        const data = fs.readFileSync(this.dataFile, 'utf8');
        const parsed = JSON.parse(data);
        this.tasks = parsed.tasks || [];
        this.reminders = parsed.reminders || [];
        this.userName = parsed.userName || 'User';
        this.conversations = parsed.conversations || [];
      } else {
        this.tasks = [];
        this.reminders = [];
        this.userName = 'User';
        this.conversations = [];
      }
    } catch (error) {
      console.log('Error loading data, starting fresh');
      this.tasks = [];
      this.reminders = [];
      this.userName = 'User';
      this.conversations = [];
    }
  }

  saveData() {
    try {
      const data = {
        tasks: this.tasks,
        reminders: this.reminders,
        userName: this.userName,
        conversations: this.conversations,
        lastUpdated: new Date().toISOString()
      };
      fs.writeFileSync(this.dataFile, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('Error saving data:', error);
    }
  }

  addTask(task) {
    const newTask = {
      id: Date.now(),
      task,
      completed: false,
      createdAt: new Date().toISOString()
    };
    this.tasks.push(newTask);
    this.saveData();
    return `Task "${task}" added successfully`;
  }

  getTasks() {
    if (this.tasks.length === 0) return 'No tasks found';
    const taskList = this.tasks.map(t => `${t.completed ? '✓' : '○'} ${t.task}`).join(', ');
    return `Your tasks: ${taskList}`;
  }

  completeTask(taskId) {
    const task = this.tasks.find(t => t.id === taskId);
    if (task) {
      task.completed = true;
      this.saveData();
      return `Task "${task.task}" marked as completed`;
    }
    return 'Task not found';
  }

  deleteTask(taskText) {
    const index = this.tasks.findIndex(t => t.task.toLowerCase().includes(taskText.toLowerCase()));
    if (index !== -1) {
      const deletedTask = this.tasks.splice(index, 1)[0];
      this.saveData();
      return `Task "${deletedTask.task}" deleted`;
    }
    return 'Task not found';
  }

  addReminder(reminder, time) {
    const newReminder = {
      id: Date.now(),
      reminder,
      time,
      createdAt: new Date().toISOString()
    };
    this.reminders.push(newReminder);
    this.saveData();
    return `Reminder set: "${reminder}" for ${time}`;
  }

  getReminders() {
    if (this.reminders.length === 0) return 'No reminders found';
    const reminderList = this.reminders.map(r => `${r.reminder} (${r.time})`).join(', ');
    return `Your reminders: ${reminderList}`;
  }

  setUserName(name) {
    this.userName = name;
    this.saveData();
  }

  saveConversation(userMessage, assistantResponse) {
    this.conversations.push({
      id: Date.now(),
      userMessage,
      assistantResponse,
      timestamp: new Date().toISOString()
    });
    
    // Keep only last 100 conversations
    if (this.conversations.length > 100) {
      this.conversations = this.conversations.slice(-100);
    }
    
    this.saveData();
  }

  getStats() {
    return {
      totalTasks: this.tasks.length,
      completedTasks: this.tasks.filter(t => t.completed).length,
      totalReminders: this.reminders.length,
      totalConversations: this.conversations.length
    };
  }
}

module.exports = DataStorage;