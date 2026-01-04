const { spawn } = require('child_process');
const path = require('path');

console.log('\n========================================');
console.log('    SHIFRA AI ASSISTANT - STARTUP');
console.log('========================================\n');

// Start backend server
console.log('[1/2] Starting backend server...');
const backend = spawn('node', ['advanced-server.js'], {
  stdio: 'inherit',
  cwd: __dirname
});

// Wait a bit then start frontend
setTimeout(() => {
  console.log('[2/2] Starting frontend...');
  const frontend = spawn('npm', ['start'], {
    stdio: 'inherit',
    cwd: path.join(__dirname, 'client'),
    shell: true
  });

  frontend.on('error', (err) => {
    console.error('Frontend error:', err);
  });
}, 3000);

backend.on('error', (err) => {
  console.error('Backend error:', err);
});

console.log('\n✅ Shifra AI Assistant is starting...');
console.log('🔗 Backend: http://localhost:8000');
console.log('🌐 Frontend: http://localhost:3000');
console.log('\nPress Ctrl+C to stop both servers\n');