const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const LibraryBook = sequelize.define('LibraryBook', {
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
  title: {
    type: DataTypes.STRING(500),
    allowNull: false,
    validate: {
      len: [1, 500]
    }
  },
  title_ar: {
    type: DataTypes.STRING(500),
    allowNull: false,
    validate: {
      len: [1, 500]
    }
  },
  author: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      len: [1, 255]
    }
  },
  author_ar: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  isbn: {
    type: DataTypes.STRING(20),
    allowNull: true,
    unique: true,
    validate: {
      len: [10, 20]
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  description_ar: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  category_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'categories',
      key: 'id'
    }
  },
  publisher: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  publication_year: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 1800,
      max: new Date().getFullYear() + 1
    }
  },
  language: {
    type: DataTypes.STRING(10),
    defaultValue: 'ar',
    validate: {
      isIn: [['ar', 'en', 'ku', 'other']]
    }
  },
  page_count: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 1
    }
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  stock_quantity: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  cover_image_url: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  condition: {
    type: DataTypes.STRING(50),
    defaultValue: 'new',
    validate: {
      isIn: [['new', 'like_new', 'good', 'acceptable']]
    }
  },
  is_shared: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  shared_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  status: {
    type: DataTypes.STRING(20),
    defaultValue: 'pending',
    validate: {
      isIn: [['pending', 'approved', 'rejected', 'active', 'inactive']]
    }
  },
  rejection_reason: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  views_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  sales_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  approved_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  approved_at: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'library_books',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  hooks: {
    beforeUpdate: (book, options) => {
      // If status changes to approved, set approved_at
      if (book.changed('status') && book.status === 'approved') {
        book.approved_at = new Date();
      }
    }
  }
});

module.exports = LibraryBook;
