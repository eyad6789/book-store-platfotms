const User = require('./User');
const Bookstore = require('./Bookstore');
const Book = require('./Book');
const { Order, OrderItem } = require('./Order');

// Define associations

// User associations
User.hasOne(Bookstore, { 
  foreignKey: 'owner_id', 
  as: 'bookstore',
  onDelete: 'CASCADE'
});

User.hasMany(Order, { 
  foreignKey: 'customer_id', 
  as: 'orders',
  onDelete: 'CASCADE'
});

// Bookstore associations
Bookstore.belongsTo(User, { 
  foreignKey: 'owner_id', 
  as: 'owner'
});

Bookstore.hasMany(Book, { 
  foreignKey: 'bookstore_id', 
  as: 'books',
  onDelete: 'CASCADE'
});

// Book associations
Book.belongsTo(Bookstore, { 
  foreignKey: 'bookstore_id', 
  as: 'bookstore'
});

Book.hasMany(OrderItem, { 
  foreignKey: 'book_id', 
  as: 'orderItems'
});

// Order associations
Order.belongsTo(User, { 
  foreignKey: 'customer_id', 
  as: 'customer'
});

Order.hasMany(OrderItem, { 
  foreignKey: 'order_id', 
  as: 'items',
  onDelete: 'CASCADE'
});

// OrderItem associations
OrderItem.belongsTo(Order, { 
  foreignKey: 'order_id', 
  as: 'order'
});

OrderItem.belongsTo(Book, { 
  foreignKey: 'book_id', 
  as: 'book'
});

module.exports = {
  User,
  Bookstore,
  Book,
  Order,
  OrderItem
};
