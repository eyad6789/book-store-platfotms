const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const BookShare = sequelize.define('BookShare', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  library_book_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'library_books',
      key: 'id'
    }
  },
  shared_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  share_type: {
    type: DataTypes.STRING(50),
    defaultValue: 'public',
    validate: {
      isIn: [['public', 'featured', 'promotional']]
    }
  },
  share_message: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  share_duration_days: {
    type: DataTypes.INTEGER,
    defaultValue: 30,
    validate: {
      min: 1,
      max: 365
    }
  },
  views_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  clicks_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  conversions_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  expires_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'book_shares',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
  hooks: {
    beforeCreate: (share, options) => {
      // Set expiration date based on duration
      if (share.share_duration_days) {
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + share.share_duration_days);
        share.expires_at = expiresAt;
      }
    }
  }
});

module.exports = BookShare;
