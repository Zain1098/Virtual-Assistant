const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  tasks: [{
    id: Number,
    title: String,
    completed: Boolean,
    priority: String,
    createdAt: { type: Date, default: Date.now }
  }],
  activities: [{
    id: Number,
    action: String,
    type: String,
    time: { type: Date, default: Date.now }
  }],
  messages: [{
    id: String,
    text: String,
    sender: String,
    timestamp: { type: Date, default: Date.now },
    type: String
  }],
  preferences: {
    theme: { type: String, default: 'dark' },
    voiceSettings: {
      rate: { type: Number, default: 1 },
      pitch: { type: Number, default: 1 },
      volume: { type: Number, default: 1 }
    }
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);