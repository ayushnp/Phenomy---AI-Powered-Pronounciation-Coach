// server.js
const express = require('express');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import routes
const fileRoutes = require('./routes/file'); // Adjust path to your routes file
const userRoutes = require('./routes/user'); // If you have user routes

// Use routes
app.use('/api', fileRoutes); // This makes your routes available at /api/*
app.use('/api', userRoutes); // If you have user routes

// Basic route for testing
app.get('/', (req, res) => {
    res.json({ message: 'Server is running!' });
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error(error);
    res.status(500).json({ 
        success: false, 
        message: 'Internal server error' 
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({ 
        success: false, 
        message: 'Route not found' 
    });
});

const PORT = process.env.PORT || 3005;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Available routes:`);
    console.log(`POST http://localhost:${PORT}/api/analyze`);
    console.log(`POST http://localhost:${PORT}/api/upload`);
    console.log(`POST http://localhost:${PORT}/api/upload-and-analyze`);
    console.log(`GET  http://localhost:${PORT}/api/files`);
});

module.exports = app;