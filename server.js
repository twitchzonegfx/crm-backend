// Simple server.js for testing
const express = require('express');
const cors = require('cors');

// Create Express app
const app = express();
const PORT = process.env.PORT || 10000;

// Basic middleware
app.use(express.json());
app.use(cors({
  origin: ['https://webwavestudio.online', 'http://localhost:3000', 'http://localhost:3001'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Simple test routes
app.get('/', (req, res) => {
  res.send('CRM API Root - Working!');
});

app.get('/api', (req, res) => {
  res.json({ message: 'API endpoint working!', status: 'OK' });
});

app.get('/api/test', (req, res) => {
  res.json({ message: 'Test endpoint working!', status: 'OK' });
});

// Simple auth test routes
app.post('/api/auth/register', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Register endpoint reached',
    receivedData: req.body
  });
});

app.post('/api/auth/login', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Login endpoint reached',
    receivedData: req.body
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});