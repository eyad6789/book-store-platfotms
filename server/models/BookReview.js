const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const BookReview = sequelize.define('BookReview', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  book_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'books',
      key: 'id'
    }
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  rating: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 5
    }
  },
  review_title: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  review_text: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  is_verified_purchase: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  helpful_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  tableName: 'book_reviews',
  indexes: [
    {
      fields: ['book_id']
    },
    {
      fields: ['user_id']
    },
    {
      fields: ['rating']
    },
    {
      fields: ['created_at']
    },
    {
      unique: true,
      fields: ['book_id', 'user_id']
    }
  ]
});

module.exports = BookReview;
