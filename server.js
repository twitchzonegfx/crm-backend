// Full server.js with working routes
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');

// Routes
const clientRoutes = require('./routes/clientRoutes');
const templateRoutes = require('./routes/templateRoutes');
const campaignRoutes = require('./routes/campaignRoutes');
const authRoutes = require('./routes/authRoutes');

// Load env vars
dotenv.config();

// Create Express app
const app = express();
const PORT = process.env.PORT || 10000;

// Connect to database - with error handling
try {
  connectDB();
  console.log('MongoDB connected successfully');
} catch (err) {
  console.error('MongoDB connection error:', err.message);
}

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({
  origin: ['https://webwavestudio.online', 'http://localhost:3000', 'http://localhost:3001'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Test routes that we know are working
app.get('/api', (req, res) => {
  res.json({ message: 'API endpoint working!', status: 'OK' });
});

app.get('/api/test', (req, res) => {
  res.json({ message: 'Test endpoint working!', status: 'OK' });
});

// Base route
app.get('/', (req, res) => {
  res.send('CRM API Root - Working!');
});

// Mount route files
app.use('/api/clients', clientRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/auth', authRoutes);

// Fallback routes for direct auth testing (in case route files have issues)
app.post('/api/direct/register', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Direct register endpoint reached',
    receivedData: req.body
  });
});

app.post('/api/direct/login', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Direct login endpoint reached',
    receivedData: req.body
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err.stack);
  res.status(500).json({
    success: false,
    message: 'Server Error',
    error: process.env.NODE_ENV === 'production' ? {} : err.message
  });
});

// 404 handler for any undefined routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});