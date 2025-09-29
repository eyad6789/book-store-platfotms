const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const UserActivity = sequelize.define('UserActivity', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: true, // Allow null for anonymous users
    references: {
      model: 'users',
      key: 'id'
    }
  },
  activity_type: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      isIn: [['view', 'search', 'add_to_cart', 'purchase', 'review', 'share', 'register', 'login', 'logout']]
    }
  },
  entity_type: {
    type: DataTypes.STRING(50),
    allowNull: true,
    validate: {
      isIn: [['book', 'bookstore', 'category', 'order', 'user']]
    }
  },
  entity_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  metadata: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {}
  },
  ip_address: {
    type: DataTypes.INET,
    allowNull: true
  },
  user_agent: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  session_id: {
    type: DataTypes.STRING(255),
    allowNull: true
  }
}, {
  tableName: 'user_activities',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
  indexes: [
    {
      fields: ['user_id', 'created_at']
    },
    {
      fields: ['activity_type', 'created_at']
    },
    {
      fields: ['entity_type', 'entity_id']
    },
    {
      fields: ['session_id']
    }
  ]
});

// Static method to track activity
UserActivity.track = async function(activityData) {
  try {
    return await this.create(activityData);
  } catch (error) {
    console.error('Error tracking activity:', error);
    // Don't throw error to avoid breaking main functionality
    return null;
  }
};

module.exports = UserActivity;
