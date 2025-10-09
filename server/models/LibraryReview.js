const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const LibraryReview = sequelize.define('LibraryReview', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  bookstore_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'bookstores',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE'
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
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'library_reviews',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      unique: true,
      fields: ['bookstore_id', 'user_id']
    },
    {
      fields: ['bookstore_id']
    },
    {
      fields: ['user_id']
    },
    {
      fields: ['rating']
    },
    {
      fields: ['created_at']
    }
  ]
});

module.exports = LibraryReview;
