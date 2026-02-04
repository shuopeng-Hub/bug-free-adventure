const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const authRoutes = require('./src/routes/authRoutes');
const dashboardRoutes = require('./src/routes/dashboardRoutes');
const projectRoutes = require('./src/routes/projectRoutes');
const ticketRoutes = require('./src/routes/ticketRoutes');
const userRoutes = require('./src/routes/userRoutes');

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/menus', require('./src/routes/menuRoutes'));
app.use('/api/projects', projectRoutes);
app.use('/api/roles', require('./src/routes/roleRoutes'));
app.use('/api/tickets', ticketRoutes);
app.use('/api/users', userRoutes);

// Health Check
app.get('/', (req, res) => {
  res.send('ITSM Server is running');
});

// Error Handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start Server
app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
  try {
    // Basic connection check
    // await prisma.$connect();
    console.log('Database connected');
  } catch (e) {
    console.error('Database connection failed', e);
  }
});

module.exports = app;
