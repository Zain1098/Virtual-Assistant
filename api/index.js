const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Shifra AI Backend is running on Vercel!' });
});

// Assistant command
app.post('/api/assistant/command', (req, res) => {
  const { command } = req.body;
  
  let response = `I heard: "${command}". This is a demo response.`;
  
  if (command.toLowerCase().includes('time')) {
    response = `Current time is: ${new Date().toLocaleTimeString()}`;
  } else if (command.toLowerCase().includes('date')) {
    response = `Today's date is: ${new Date().toLocaleDateString()}`;
  }
  
  res.json({ response, action: 'speak' });
});

// Tasks
app.get('/api/tasks', (req, res) => {
  res.json([
    { id: 1, title: 'Sample Task', completed: false, priority: 'medium' }
  ]);
});

module.exports = app;