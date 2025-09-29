const User = require('./User');
const Bookstore = require('./Bookstore');
const Book = require('./Book');
const { Order, OrderItem } = require('./Order');
const Category = require('./Category');
const BookReview = require('./BookReview');
const Wishlist = require('./Wishlist');
const SearchQuery = require('./SearchQuery');
const LibraryBook = require('./LibraryBook');
const BookShare = require('./BookShare');
const LibraryMetric = require('./LibraryMetric');
const UserActivity = require('./UserActivity');

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

User.hasMany(BookReview, { 
  foreignKey: 'user_id', 
  as: 'reviews',
  onDelete: 'CASCADE'
});

User.hasMany(Wishlist, { 
  foreignKey: 'user_id', 
  as: 'wishlists',
  onDelete: 'CASCADE'
});

User.hasMany(SearchQuery, { 
  foreignKey: 'user_id', 
  as: 'searchQueries',
  onDelete: 'SET NULL'
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

Book.belongsTo(Category, { 
  foreignKey: 'category_id', 
  as: 'bookCategory'
});

Book.belongsTo(Category, { 
  foreignKey: 'subcategory_id', 
  as: 'bookSubcategory'
});

Book.hasMany(BookReview, { 
  foreignKey: 'book_id', 
  as: 'reviews',
  onDelete: 'CASCADE'
});

Book.hasMany(Wishlist, { 
  foreignKey: 'book_id', 
  as: 'wishlists',
  onDelete: 'CASCADE'
});

Book.hasMany(SearchQuery, { 
  foreignKey: 'clicked_book_id', 
  as: 'searchClicks',
  onDelete: 'SET NULL'
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

// Category associations
Category.hasMany(Category, { 
  foreignKey: 'parent_id', 
  as: 'subcategories'
});

Category.belongsTo(Category, { 
  foreignKey: 'parent_id', 
  as: 'parent'
});

Category.hasMany(Book, { 
  foreignKey: 'category_id', 
  as: 'books'
});

Category.hasMany(Book, { 
  foreignKey: 'subcategory_id', 
  as: 'subcategoryBooks'
});

// BookReview associations
BookReview.belongsTo(User, { 
  foreignKey: 'user_id', 
  as: 'user'
});

BookReview.belongsTo(Book, { 
  foreignKey: 'book_id', 
  as: 'book'
});

// Wishlist associations
Wishlist.belongsTo(User, { 
  foreignKey: 'user_id', 
  as: 'user'
});

Wishlist.belongsTo(Book, { 
  foreignKey: 'book_id', 
  as: 'book'
});

// SearchQuery associations
SearchQuery.belongsTo(User, { 
  foreignKey: 'user_id', 
  as: 'user'
});

SearchQuery.belongsTo(Book, { 
  foreignKey: 'clicked_book_id', 
  as: 'clickedBook'
});

// LibraryBook associations
LibraryBook.belongsTo(Bookstore, {
  foreignKey: 'bookstore_id',
  as: 'bookstore'
});

LibraryBook.belongsTo(Category, {
  foreignKey: 'category_id',
  as: 'category'
});

LibraryBook.belongsTo(User, {
  foreignKey: 'approved_by',
  as: 'approver'
});

LibraryBook.hasMany(BookShare, {
  foreignKey: 'library_book_id',
  as: 'shares',
  onDelete: 'CASCADE'
});

// Bookstore associations for LibraryBooks
Bookstore.hasMany(LibraryBook, {
  foreignKey: 'bookstore_id',
  as: 'libraryBooks',
  onDelete: 'CASCADE'
});

Bookstore.hasMany(LibraryMetric, {
  foreignKey: 'bookstore_id',
  as: 'metrics',
  onDelete: 'CASCADE'
});

// BookShare associations
BookShare.belongsTo(LibraryBook, {
  foreignKey: 'library_book_id',
  as: 'book'
});

BookShare.belongsTo(User, {
  foreignKey: 'shared_by',
  as: 'sharedBy'
});

// LibraryMetric associations
LibraryMetric.belongsTo(Bookstore, {
  foreignKey: 'bookstore_id',
  as: 'bookstore'
});

// UserActivity associations
UserActivity.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user'
});

User.hasMany(UserActivity, {
  foreignKey: 'user_id',
  as: 'activities',
  onDelete: 'CASCADE'
});

module.exports = {
  User,
  Bookstore,
  Book,
  Order,
  OrderItem,
  Category,
  BookReview,
  Wishlist,
  SearchQuery,
  LibraryBook,
  BookShare,
  LibraryMetric,
  UserActivity
};
