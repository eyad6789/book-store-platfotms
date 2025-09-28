// Test API endpoints to find the issue
const express = require('express');
const cors = require('cors');
const { sequelize } = require('./config/database');

const app = express();
app.use(cors());
app.use(express.json());

// Test endpoint
app.get('/api/test', async (req, res) => {
  try {
    // Test database connection
    await sequelize.authenticate();
    
    // Test simple queries
    const [users] = await sequelize.query('SELECT COUNT(*) as count FROM users');
    const [books] = await sequelize.query('SELECT COUNT(*) as count FROM books');
    const [categories] = await sequelize.query('SELECT COUNT(*) as count FROM categories');
    
    res.json({
      status: 'OK',
      database: 'Connected',
      data: {
        users: users[0].count,
        books: books[0].count,
        categories: categories[0].count
      }
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
      stack: error.stack
    });
  }
});

// Test books endpoint
app.get('/api/books/simple', async (req, res) => {
  try {
    const [books] = await sequelize.query(`
      SELECT id, title, author, price, is_active 
      FROM books 
      WHERE is_active = true 
      LIMIT 10
    `);
    
    res.json({ books });
  } catch (error) {
    res.status(500).json({
      error: error.message,
      stack: error.stack
    });
  }
});

// Test categories endpoint
app.get('/api/categories/simple', async (req, res) => {
  try {
    const [categories] = await sequelize.query(`
      SELECT id, name, name_ar 
      FROM categories 
      WHERE is_active = true
    `);
    
    res.json({ categories });
  } catch (error) {
    res.status(500).json({
      error: error.message,
      stack: error.stack
    });
  }
});

const PORT = 3002;
app.listen(PORT, () => {
  console.log(`🧪 Test server running on http://localhost:${PORT}`);
  console.log('Test endpoints:');
  console.log(`- http://localhost:${PORT}/api/test`);
  console.log(`- http://localhost:${PORT}/api/books/simple`);
  console.log(`- http://localhost:${PORT}/api/categories/simple`);
});

process.on('SIGINT', () => {
  console.log('\nShutting down test server...');
  process.exit(0);
});
