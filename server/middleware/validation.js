const Joi = require('joi');

// Generic validation middleware
const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    
    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      
      return res.status(400).json({
        error: 'Validation Error',
        details: errors
      });
    }
    
    next();
  };
};

// User validation schemas
const userSchemas = {
  register: Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
    password: Joi.string().min(6).required().messages({
      'string.min': 'Password must be at least 6 characters long',
      'any.required': 'Password is required'
    }),
    full_name: Joi.string().min(2).max(255).required().messages({
      'string.min': 'Full name must be at least 2 characters long',
      'string.max': 'Full name cannot exceed 255 characters',
      'any.required': 'Full name is required'
    }),
    phone: Joi.string().pattern(/^[\+]?[0-9\s\-\(\)]+$/).optional().messages({
      'string.pattern.base': 'Please provide a valid phone number'
    }),
    role: Joi.string().valid('customer', 'bookstore_owner').default('customer')
  }),

  login: Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
    password: Joi.string().required().messages({
      'any.required': 'Password is required'
    })
  }),

  updateProfile: Joi.object({
    full_name: Joi.string().min(2).max(255).optional(),
    phone: Joi.string().pattern(/^[\+]?[0-9\s\-\(\)]+$/).optional().allow(''),
    avatar_url: Joi.string().uri().optional().allow('')
  })
};

// Bookstore validation schemas
const bookstoreSchemas = {
  create: Joi.object({
    name: Joi.string().min(2).max(255).required().messages({
      'string.min': 'Bookstore name must be at least 2 characters long',
      'string.max': 'Bookstore name cannot exceed 255 characters',
      'any.required': 'Bookstore name is required'
    }),
    name_arabic: Joi.string().max(255).optional().allow(''),
    description: Joi.string().optional().allow(''),
    description_arabic: Joi.string().optional().allow(''),
    address: Joi.string().optional().allow(''),
    address_arabic: Joi.string().optional().allow(''),
    phone: Joi.string().pattern(/^[\+]?[0-9\s\-\(\)]+$/).optional().allow(''),
    email: Joi.string().email().optional().allow('')
  }),

  update: Joi.object({
    name: Joi.string().min(2).max(255).optional(),
    name_arabic: Joi.string().max(255).optional().allow(''),
    description: Joi.string().optional().allow(''),
    description_arabic: Joi.string().optional().allow(''),
    address: Joi.string().optional().allow(''),
    address_arabic: Joi.string().optional().allow(''),
    phone: Joi.string().pattern(/^[\+]?[0-9\s\-\(\)]+$/).optional().allow(''),
    email: Joi.string().email().optional().allow('')
  })
};

// Book validation schemas
const bookSchemas = {
  create: Joi.object({
    title: Joi.string().min(1).max(255).required().messages({
      'string.min': 'Book title is required',
      'string.max': 'Book title cannot exceed 255 characters',
      'any.required': 'Book title is required'
    }),
    title_arabic: Joi.string().max(255).optional().allow(''),
    author: Joi.string().min(1).max(255).required().messages({
      'string.min': 'Author name is required',
      'string.max': 'Author name cannot exceed 255 characters',
      'any.required': 'Author name is required'
    }),
    author_arabic: Joi.string().max(255).optional().allow(''),
    isbn: Joi.string().max(20).optional().allow(''),
    category: Joi.string().max(100).optional().allow(''),
    category_arabic: Joi.string().max(100).optional().allow(''),
    description: Joi.string().optional().allow(''),
    description_arabic: Joi.string().optional().allow(''),
    price: Joi.number().positive().required().messages({
      'number.positive': 'Price must be a positive number',
      'any.required': 'Price is required'
    }),
    original_price: Joi.number().positive().optional(),
    stock_quantity: Joi.number().integer().min(0).default(0),
    language: Joi.string().valid('arabic', 'english', 'both').default('arabic'),
    publication_year: Joi.number().integer().min(1000).max(new Date().getFullYear() + 1).optional(),
    publisher: Joi.string().max(255).optional().allow(''),
    publisher_arabic: Joi.string().max(255).optional().allow(''),
    pages: Joi.number().integer().positive().optional(),
    weight: Joi.number().positive().optional(),
    dimensions: Joi.string().max(50).optional().allow('')
  }),

  update: Joi.object({
    title: Joi.string().min(1).max(255).optional(),
    title_arabic: Joi.string().max(255).optional().allow(''),
    author: Joi.string().min(1).max(255).optional(),
    author_arabic: Joi.string().max(255).optional().allow(''),
    isbn: Joi.string().max(20).optional().allow(''),
    category: Joi.string().max(100).optional().allow(''),
    category_arabic: Joi.string().max(100).optional().allow(''),
    description: Joi.string().optional().allow(''),
    description_arabic: Joi.string().optional().allow(''),
    price: Joi.number().positive().optional(),
    original_price: Joi.number().positive().optional(),
    stock_quantity: Joi.number().integer().min(0).optional(),
    is_active: Joi.boolean().optional(),
    is_featured: Joi.boolean().optional(),
    language: Joi.string().valid('arabic', 'english', 'both').optional(),
    publication_year: Joi.number().integer().min(1000).max(new Date().getFullYear() + 1).optional(),
    publisher: Joi.string().max(255).optional().allow(''),
    publisher_arabic: Joi.string().max(255).optional().allow(''),
    pages: Joi.number().integer().positive().optional(),
    weight: Joi.number().positive().optional(),
    dimensions: Joi.string().max(50).optional().allow('')
  })
};

// Order validation schemas
const orderSchemas = {
  create: Joi.object({
    items: Joi.array().items(
      Joi.object({
        book_id: Joi.number().integer().positive().required(),
        quantity: Joi.number().integer().positive().required()
      })
    ).min(1).required().messages({
      'array.min': 'Order must contain at least one item',
      'any.required': 'Order items are required'
    }),
    delivery_address: Joi.string().required().messages({
      'any.required': 'Delivery address is required'
    }),
    delivery_phone: Joi.string().pattern(/^[\+]?[0-9\s\-\(\)]+$/).required().messages({
      'string.pattern.base': 'Please provide a valid delivery phone number',
      'any.required': 'Delivery phone is required'
    }),
    delivery_notes: Joi.string().optional().allow(''),
    payment_method: Joi.string().valid('cash_on_delivery', 'bank_transfer', 'credit_card').default('cash_on_delivery')
  })
};

module.exports = {
  validate,
  userSchemas,
  bookstoreSchemas,
  bookSchemas,
  orderSchemas
};
