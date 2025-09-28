const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Wishlist = sequelize.define('Wishlist', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  book_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'books',
      key: 'id'
    }
  }
}, {
  tableName: 'wishlists',
  indexes: [
    {
      fields: ['user_id']
    },
    {
      fields: ['book_id']
    },
    {
      unique: true,
      fields: ['user_id', 'book_id']
    }
  ]
});

module.exports = Wishlist;
