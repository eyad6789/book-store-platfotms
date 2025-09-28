const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const SearchQuery = sequelize.define('SearchQuery', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  query: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  results_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  clicked_book_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'books',
      key: 'id'
    }
  },
  ip_address: {
    type: DataTypes.INET,
    allowNull: true
  },
  user_agent: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'search_queries',
  indexes: [
    {
      fields: ['query']
    },
    {
      fields: ['user_id']
    },
    {
      fields: ['created_at']
    },
    {
      fields: ['results_count']
    }
  ]
});

module.exports = SearchQuery;
