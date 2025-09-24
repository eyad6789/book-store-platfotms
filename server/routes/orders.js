const express = require('express');
const { Op } = require('sequelize');
const { Order, OrderItem, Book, Bookstore, User } = require('../models');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { validate, orderSchemas } = require('../middleware/validation');
const { sequelize } = require('../config/database');

const router = express.Router();

// @route   POST /api/orders
// @desc    Create a new order
// @access  Private (Customers only)
router.post('/', authenticateToken, validate(orderSchemas.create), async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { items, delivery_address, delivery_phone, delivery_notes, payment_method } = req.body;

    // Validate and calculate order totals
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const book = await Book.findOne({
        where: {
          id: item.book_id,
          is_active: true
        },
        include: [
          {
            model: Bookstore,
            as: 'bookstore',
            where: { is_approved: true, is_active: true }
          }
        ]
      });

      if (!book) {
        await transaction.rollback();
        return res.status(400).json({
          error: 'Invalid book',
          message: `Book with ID ${item.book_id} not found or not available`
        });
      }

      if (book.stock_quantity < item.quantity) {
        await transaction.rollback();
        return res.status(400).json({
          error: 'Insufficient stock',
          message: `Only ${book.stock_quantity} copies of "${book.title}" are available`
        });
      }

      const itemTotal = parseFloat(book.price) * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        book_id: book.id,
        quantity: item.quantity,
        price: book.price,
        total: itemTotal
      });
    }

    // Calculate shipping and tax (simplified for MVP)
    const shipping_cost = subtotal > 50 ? 0 : 5; // Free shipping over $50
    const tax_amount = 0; // No tax for MVP
    const total_amount = subtotal + shipping_cost + tax_amount;

    // Create order
    const order = await Order.create({
      customer_id: req.userId,
      subtotal,
      shipping_cost,
      tax_amount,
      total_amount,
      delivery_address,
      delivery_phone,
      delivery_notes,
      payment_method: payment_method || 'cash_on_delivery'
    }, { transaction });

    // Create order items and update book stock
    for (const item of orderItems) {
      await OrderItem.create({
        order_id: order.id,
        ...item
      }, { transaction });

      // Update book stock
      await Book.decrement('stock_quantity', {
        by: item.quantity,
        where: { id: item.book_id },
        transaction
      });

      // Update book sales count
      await Book.increment('total_sales', {
        by: item.quantity,
        where: { id: item.book_id },
        transaction
      });
    }

    await transaction.commit();

    // Fetch complete order with items
    const createdOrder = await Order.findByPk(order.id, {
      include: [
        {
          model: OrderItem,
          as: 'items',
          include: [
            {
              model: Book,
              as: 'book',
              attributes: ['id', 'title', 'title_arabic', 'author', 'author_arabic', 'image_url']
            }
          ]
        }
      ]
    });

    res.status(201).json({
      message: 'Order created successfully',
      order: createdOrder
    });

  } catch (error) {
    await transaction.rollback();
    console.error('Create order error:', error);
    res.status(500).json({
      error: 'Failed to create order',
      message: 'Something went wrong while creating the order'
    });
  }
});

// @route   GET /api/orders
// @desc    Get user's orders
// @access  Private
router.get('/', authenticateToken, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      sort_by = 'created_at',
      sort_order = 'DESC'
    } = req.query;

    const offset = (page - 1) * limit;
    const whereClause = { customer_id: req.userId };

    // Status filter
    if (status) {
      whereClause.status = status;
    }

    // Sorting
    const validSortFields = ['created_at', 'total_amount', 'status'];
    const sortField = validSortFields.includes(sort_by) ? sort_by : 'created_at';
    const sortDirection = sort_order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const { count, rows: orders } = await Order.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: OrderItem,
          as: 'items',
          include: [
            {
              model: Book,
              as: 'book',
              attributes: ['id', 'title', 'title_arabic', 'author', 'author_arabic', 'image_url'],
              include: [
                {
                  model: Bookstore,
                  as: 'bookstore',
                  attributes: ['id', 'name', 'name_arabic']
                }
              ]
            }
          ]
        }
      ],
      order: [[sortField, sortDirection]],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    const totalPages = Math.ceil(count / limit);

    res.json({
      orders,
      pagination: {
        current_page: parseInt(page),
        total_pages: totalPages,
        total_items: count,
        items_per_page: parseInt(limit),
        has_next: page < totalPages,
        has_prev: page > 1
      }
    });

  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      error: 'Failed to fetch orders',
      message: 'Something went wrong while fetching your orders'
    });
  }
});

// @route   GET /api/orders/:id
// @desc    Get single order by ID
// @access  Private
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const whereClause = { id: req.params.id };

    // Only customers can see their own orders, admins can see all
    if (req.user.role !== 'admin') {
      whereClause.customer_id = req.userId;
    }

    const order = await Order.findOne({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'customer',
          attributes: ['id', 'full_name', 'email', 'phone']
        },
        {
          model: OrderItem,
          as: 'items',
          include: [
            {
              model: Book,
              as: 'book',
              attributes: ['id', 'title', 'title_arabic', 'author', 'author_arabic', 'image_url', 'isbn'],
              include: [
                {
                  model: Bookstore,
                  as: 'bookstore',
                  attributes: ['id', 'name', 'name_arabic', 'phone', 'email']
                }
              ]
            }
          ]
        }
      ]
    });

    if (!order) {
      return res.status(404).json({
        error: 'Order not found',
        message: 'The requested order was not found'
      });
    }

    res.json({ order });

  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      error: 'Failed to fetch order',
      message: 'Something went wrong while fetching the order'
    });
  }
});

// @route   PUT /api/orders/:id/cancel
// @desc    Cancel an order
// @access  Private
router.put('/:id/cancel', authenticateToken, async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const order = await Order.findOne({
      where: {
        id: req.params.id,
        customer_id: req.userId
      },
      include: [
        {
          model: OrderItem,
          as: 'items'
        }
      ]
    });

    if (!order) {
      await transaction.rollback();
      return res.status(404).json({
        error: 'Order not found',
        message: 'Order not found or you do not have permission to cancel it'
      });
    }

    if (order.status !== 'pending') {
      await transaction.rollback();
      return res.status(400).json({
        error: 'Cannot cancel order',
        message: 'Only pending orders can be cancelled'
      });
    }

    // Update order status
    await order.update({ status: 'cancelled' }, { transaction });

    // Restore book stock
    for (const item of order.items) {
      await Book.increment('stock_quantity', {
        by: item.quantity,
        where: { id: item.book_id },
        transaction
      });

      // Decrease book sales count
      await Book.decrement('total_sales', {
        by: item.quantity,
        where: { id: item.book_id },
        transaction
      });
    }

    await transaction.commit();

    res.json({
      message: 'Order cancelled successfully',
      order
    });

  } catch (error) {
    await transaction.rollback();
    console.error('Cancel order error:', error);
    res.status(500).json({
      error: 'Failed to cancel order',
      message: 'Something went wrong while cancelling the order'
    });
  }
});

// Admin routes for order management
// @route   GET /api/orders/admin/all
// @desc    Get all orders (admin only)
// @access  Private (Admin only)
router.get('/admin/all', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      payment_status,
      search,
      sort_by = 'created_at',
      sort_order = 'DESC'
    } = req.query;

    const offset = (page - 1) * limit;
    const whereClause = {};

    // Status filters
    if (status) {
      whereClause.status = status;
    }
    if (payment_status) {
      whereClause.payment_status = payment_status;
    }

    // Search functionality
    if (search) {
      whereClause[Op.or] = [
        { order_number: { [Op.iLike]: `%${search}%` } },
        { delivery_address: { [Op.iLike]: `%${search}%` } },
        { delivery_phone: { [Op.iLike]: `%${search}%` } }
      ];
    }

    // Sorting
    const validSortFields = ['created_at', 'total_amount', 'status', 'order_number'];
    const sortField = validSortFields.includes(sort_by) ? sort_by : 'created_at';
    const sortDirection = sort_order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const { count, rows: orders } = await Order.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'customer',
          attributes: ['id', 'full_name', 'email', 'phone']
        },
        {
          model: OrderItem,
          as: 'items',
          include: [
            {
              model: Book,
              as: 'book',
              attributes: ['id', 'title', 'title_arabic']
            }
          ]
        }
      ],
      order: [[sortField, sortDirection]],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    const totalPages = Math.ceil(count / limit);

    res.json({
      orders,
      pagination: {
        current_page: parseInt(page),
        total_pages: totalPages,
        total_items: count,
        items_per_page: parseInt(limit),
        has_next: page < totalPages,
        has_prev: page > 1
      }
    });

  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({
      error: 'Failed to fetch orders',
      message: 'Something went wrong while fetching orders'
    });
  }
});

// @route   PUT /api/orders/admin/:id/status
// @desc    Update order status (admin only)
// @access  Private (Admin only)
router.put('/admin/:id/status', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const { status, tracking_number, notes } = req.body;

    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        error: 'Invalid status',
        message: 'Status must be one of: ' + validStatuses.join(', ')
      });
    }

    const order = await Order.findByPk(req.params.id);

    if (!order) {
      return res.status(404).json({
        error: 'Order not found',
        message: 'The requested order was not found'
      });
    }

    const updateData = { status };
    if (tracking_number) updateData.tracking_number = tracking_number;
    if (notes) updateData.notes = notes;
    if (status === 'delivered') updateData.actual_delivery = new Date();

    await order.update(updateData);

    res.json({
      message: 'Order status updated successfully',
      order
    });

  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      error: 'Failed to update order status',
      message: 'Something went wrong while updating the order status'
    });
  }
});

// @route   GET /api/orders/stats
// @desc    Get order statistics
// @access  Private
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    let whereClause = {};

    // If not admin, only show user's orders
    if (req.user.role !== 'admin') {
      whereClause.customer_id = req.userId;
    }

    const stats = await Order.findAll({
      where: whereClause,
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        [sequelize.fn('SUM', sequelize.col('total_amount')), 'total_value']
      ],
      group: ['status'],
      raw: true
    });

    const totalOrders = await Order.count({ where: whereClause });
    const totalValue = await Order.sum('total_amount', { where: whereClause });

    res.json({
      total_orders: totalOrders,
      total_value: totalValue || 0,
      by_status: stats
    });

  } catch (error) {
    console.error('Get order stats error:', error);
    res.status(500).json({
      error: 'Failed to fetch order statistics',
      message: 'Something went wrong while fetching order statistics'
    });
  }
});

module.exports = router;
