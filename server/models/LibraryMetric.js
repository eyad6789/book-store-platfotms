const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const LibraryMetric = sequelize.define('LibraryMetric', {
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
    }
  },
  metric_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  total_views: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  total_orders: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  total_revenue: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  new_customers: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  returning_customers: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  avg_order_value: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  conversion_rate: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0,
    validate: {
      min: 0,
      max: 100
    }
  }
}, {
  tableName: 'library_metrics',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
  indexes: [
    {
      unique: true,
      fields: ['bookstore_id', 'metric_date']
    }
  ]
});

module.exports = LibraryMetric;
