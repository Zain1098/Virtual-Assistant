const request = require('supertest');
const app = require('../server/index');
const User = require('../server/models/User');
const Task = require('../server/models/Task');

describe('Shifra AI Assistant API', () => {
  let authToken;
  let userId;

  beforeAll(async () => {
    // Setup test database connection
    await mongoose.connect(process.env.MONGODB_TEST_URI);
  });

  afterAll(async () => {
    // Cleanup
    await User.deleteMany({});
    await Task.deleteMany({});
    await mongoose.connection.close();
  });

  describe('Authentication', () => {
    test('Should register a new user', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body.user.email).toBe('test@example.com');
      
      authToken = response.body.token;
      userId = response.body.user.id;
    });

    test('Should login existing user', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
    });

    test('Should reject invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(400);
    });
  });

  describe('Assistant Commands', () => {
    test('Should process weather command', async () => {
      const response = await request(app)
        .post('/api/assistant/command')
        .set('x-auth-token', authToken)
        .send({
          command: 'What\'s the weather like?',
          context: {}
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('response');
      expect(response.body.type).toBe('weather');
    });

    test('Should process calculation command', async () => {
      const response = await request(app)
        .post('/api/assistant/command')
        .set('x-auth-token', authToken)
        .send({
          command: 'Calculate 15 plus 25',
          context: {}
        });

      expect(response.status).toBe(200);
      expect(response.body.type).toBe('calculation');
      expect(response.body.data.result).toBe(40);
    });

    test('Should handle AI conversation', async () => {
      const response = await request(app)
        .post('/api/assistant/command')
        .set('x-auth-token', authToken)
        .send({
          command: 'Tell me a joke',
          context: {}
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('response');
    });
  });

  describe('Task Management', () => {
    let taskId;

    test('Should create a new task', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .set('x-auth-token', authToken)
        .send({
          title: 'Test Task',
          description: 'This is a test task',
          priority: 'high'
        });

      expect(response.status).toBe(200);
      expect(response.body.title).toBe('Test Task');
      expect(response.body.priority).toBe('high');
      
      taskId = response.body._id;
    });

    test('Should get all tasks', async () => {
      const response = await request(app)
        .get('/api/tasks')
        .set('x-auth-token', authToken);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    test('Should update a task', async () => {
      const response = await request(app)
        .put(`/api/tasks/${taskId}`)
        .set('x-auth-token', authToken)
        .send({
          completed: true
        });

      expect(response.status).toBe(200);
      expect(response.body.completed).toBe(true);
    });

    test('Should delete a task', async () => {
      const response = await request(app)
        .delete(`/api/tasks/${taskId}`)
        .set('x-auth-token', authToken);

      expect(response.status).toBe(200);
      expect(response.body.msg).toBe('Task deleted');
    });
  });

  describe('Smart Home Control', () => {
    test('Should control smart device', async () => {
      const response = await request(app)
        .post('/api/assistant/smart-home')
        .set('x-auth-token', authToken)
        .send({
          device: 'living_room_lights',
          action: 'turn_on',
          value: 80
        });

      expect(response.status).toBe(200);
      expect(response.body.data.device).toBe('living_room_lights');
      expect(response.body.data.status).toBe('turn_on');
    });
  });

  describe('Calendar Integration', () => {
    test('Should get calendar events', async () => {
      const response = await request(app)
        .get('/api/assistant/calendar')
        .set('x-auth-token', authToken);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('Email Management', () => {
    test('Should handle email check', async () => {
      const response = await request(app)
        .post('/api/assistant/email')
        .set('x-auth-token', authToken)
        .send({
          action: 'check',
          data: {}
        });

      expect(response.status).toBe(200);
      expect(response.body.type).toBe('email');
    });
  });
});

// Frontend Tests
describe('React Components', () => {
  test('App component renders correctly', () => {
    const { getByText } = render(<App />);
    expect(getByText('Shifra')).toBeInTheDocument();
    expect(getByText('AI Assistant')).toBeInTheDocument();
  });

  test('Voice button toggles listening state', () => {
    const { getByRole } = render(<App />);
    const voiceButton = getByRole('button', { name: /voice/i });
    
    fireEvent.click(voiceButton);
    expect(voiceButton).toHaveClass('listening');
  });

  test('Message input works correctly', () => {
    const { getByPlaceholderText, getByRole } = render(<App />);
    const input = getByPlaceholderText(/type your message/i);
    const sendButton = getByRole('button', { name: /send/i });
    
    fireEvent.change(input, { target: { value: 'Hello Shifra' } });
    fireEvent.click(sendButton);
    
    expect(input.value).toBe('');
  });
});

// Performance Tests
describe('Performance Tests', () => {
  test('API response time should be under 500ms', async () => {
    const start = Date.now();
    
    await request(app)
      .post('/api/assistant/command')
      .set('x-auth-token', authToken)
      .send({
        command: 'What time is it?',
        context: {}
      });
    
    const responseTime = Date.now() - start;
    expect(responseTime).toBeLessThan(500);
  });

  test('Database queries should be optimized', async () => {
    const start = Date.now();
    
    await request(app)
      .get('/api/tasks')
      .set('x-auth-token', authToken);
    
    const queryTime = Date.now() - start;
    expect(queryTime).toBeLessThan(100);
  });
});

// Security Tests
describe('Security Tests', () => {
  test('Should reject requests without authentication', async () => {
    const response = await request(app)
      .get('/api/tasks');

    expect(response.status).toBe(401);
  });

  test('Should reject invalid JWT tokens', async () => {
    const response = await request(app)
      .get('/api/tasks')
      .set('x-auth-token', 'invalid-token');

    expect(response.status).toBe(401);
  });

  test('Should sanitize user input', async () => {
    const response = await request(app)
      .post('/api/assistant/command')
      .set('x-auth-token', authToken)
      .send({
        command: '<script>alert("xss")</script>',
        context: {}
      });

    expect(response.status).toBe(200);
    expect(response.body.response).not.toContain('<script>');
  });
});