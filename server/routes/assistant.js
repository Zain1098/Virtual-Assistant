const express = require('express');
const OpenAI = require('openai');
const auth = require('../middleware/auth');
const AssistantService = require('../services/AssistantService');
const router = express.Router();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Process voice command
router.post('/command', auth, async (req, res) => {
  try {
    const { command, context } = req.body;
    const userId = req.user.userId;

    const response = await AssistantService.processCommand(command, userId, context);
    res.json(response);
  } catch (error) {
    res.status(500).json({ msg: 'Command processing failed' });
  }
});

// Get conversation history
router.get('/history', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const history = await AssistantService.getHistory(userId);
    res.json(history);
  } catch (error) {
    res.status(500).json({ msg: 'Failed to fetch history' });
  }
});

// Smart home control
router.post('/smart-home', auth, async (req, res) => {
  try {
    const { device, action, value } = req.body;
    const result = await AssistantService.controlSmartDevice(device, action, value);
    res.json(result);
  } catch (error) {
    res.status(500).json({ msg: 'Smart home control failed' });
  }
});

// Calendar integration
router.get('/calendar', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const events = await AssistantService.getCalendarEvents(userId);
    res.json(events);
  } catch (error) {
    res.status(500).json({ msg: 'Calendar fetch failed' });
  }
});

// Email management
router.post('/email', auth, async (req, res) => {
  try {
    const { action, data } = req.body;
    const result = await AssistantService.handleEmail(action, data, req.user.userId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ msg: 'Email operation failed' });
  }
});

module.exports = router;