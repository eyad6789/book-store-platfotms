const { User, Order, OrderItem, Book, Bookstore } = require('../models');
const { Op } = require('sequelize');

// Create notification system for purchase confirmations
const createPurchaseNotifications = async (orderId) => {
  try {
    const order = await Order.findByPk(orderId, {
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
              include: [
                {
                  model: Bookstore,
                  as: 'bookstore',
                  include: [
                    {
                      model: User,
                      as: 'owner',
                      attributes: ['id', 'full_name', 'email', 'phone']
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    });

    if (!order) {
      throw new Error('Order not found');
    }

    // Group items by bookstore to send one notification per bookstore owner
    const bookstoreGroups = {};
    
    order.items.forEach(item => {
      const bookstoreId = item.book.bookstore.id;
      if (!bookstoreGroups[bookstoreId]) {
        bookstoreGroups[bookstoreId] = {
          bookstore: item.book.bookstore,
          owner: item.book.bookstore.owner,
          items: [],
          totalAmount: 0
        };
      }
      bookstoreGroups[bookstoreId].items.push(item);
      bookstoreGroups[bookstoreId].totalAmount += parseFloat(item.total);
    });

    // Create notifications for each bookstore owner
    const notifications = [];
    
    for (const [bookstoreId, group] of Object.entries(bookstoreGroups)) {
      const notification = {
        type: 'new_purchase',
        recipient: group.owner,
        bookstore: group.bookstore,
        order: {
          id: order.id,
          order_number: order.order_number,
          customer: order.customer,
          items: group.items,
          total_amount: group.totalAmount,
          created_at: order.created_at
        }
      };
      
      notifications.push(notification);
      
      // Send notification (you can implement email/SMS here)
      await sendPurchaseNotification(notification);
    }

    return notifications;

  } catch (error) {
    console.error('Error creating purchase notifications:', error);
    throw error;
  }
};

// Send purchase notification to bookstore owner
const sendPurchaseNotification = async (notification) => {
  try {
    const { recipient, bookstore, order } = notification;
    
    // Create in-app notification record
    await createInAppNotification({
      user_id: recipient.id,
      type: 'purchase',
      title: 'طلب شراء جديد!',
      message: `تم شراء ${order.items.length} كتاب من مكتبتك "${bookstore.name_arabic || bookstore.name}" بواسطة ${order.customer.full_name}`,
      data: {
        order_id: order.id,
        order_number: order.order_number,
        customer_name: order.customer.full_name,
        total_amount: order.total_amount,
        items_count: order.items.length
      }
    });

    // Send email notification (if email service is configured)
    if (process.env.EMAIL_ENABLED === 'true') {
      await sendEmailNotification({
        to: recipient.email,
        subject: `طلب شراء جديد - ${order.order_number}`,
        template: 'purchase_notification',
        data: {
          owner_name: recipient.full_name,
          bookstore_name: bookstore.name_arabic || bookstore.name,
          order_number: order.order_number,
          customer_name: order.customer.full_name,
          customer_phone: order.customer.phone,
          items: order.items.map(item => ({
            title: item.book.title_arabic || item.book.title,
            quantity: item.quantity,
            price: item.price
          })),
          total_amount: order.total_amount,
          order_date: order.created_at
        }
      });
    }

    // Send SMS notification (if SMS service is configured)
    if (process.env.SMS_ENABLED === 'true' && recipient.phone) {
      await sendSMSNotification({
        to: recipient.phone,
        message: `مكتبة المتنبي: طلب شراء جديد #${order.order_number} من ${order.customer.full_name}. المبلغ: ${order.total_amount} د.ع. تفاصيل أكثر في لوحة التحكم.`
      });
    }

    console.log(`✅ Purchase notification sent to ${recipient.full_name} for order ${order.order_number}`);

  } catch (error) {
    console.error('Error sending purchase notification:', error);
  }
};

// Create in-app notification
const createInAppNotification = async (notificationData) => {
  try {
    // This would typically save to a notifications table
    // For now, we'll just log it
    console.log('📱 In-app notification created:', {
      user_id: notificationData.user_id,
      title: notificationData.title,
      message: notificationData.message,
      created_at: new Date()
    });
    
    // TODO: Implement actual notification storage
    // await Notification.create(notificationData);
    
  } catch (error) {
    console.error('Error creating in-app notification:', error);
  }
};

// Send email notification (placeholder)
const sendEmailNotification = async ({ to, subject, template, data }) => {
  try {
    console.log('📧 Email notification would be sent:', {
      to,
      subject,
      template,
      data: JSON.stringify(data, null, 2)
    });
    
    // TODO: Implement actual email sending
    // Example with nodemailer:
    // const transporter = nodemailer.createTransporter(config);
    // await transporter.sendMail({ to, subject, html: renderTemplate(template, data) });
    
  } catch (error) {
    console.error('Error sending email notification:', error);
  }
};

// Send SMS notification (placeholder)
const sendSMSNotification = async ({ to, message }) => {
  try {
    console.log('📱 SMS notification would be sent:', {
      to,
      message
    });
    
    // TODO: Implement actual SMS sending
    // Example with Twilio or local SMS service
    
  } catch (error) {
    console.error('Error sending SMS notification:', error);
  }
};

// Send purchase confirmation to customer
const sendCustomerConfirmation = async (orderId) => {
  try {
    const order = await Order.findByPk(orderId, {
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
              attributes: ['id', 'title', 'title_arabic', 'author', 'author_arabic', 'price']
            }
          ]
        }
      ]
    });

    if (!order) {
      throw new Error('Order not found');
    }

    // Send confirmation email to customer
    if (process.env.EMAIL_ENABLED === 'true') {
      await sendEmailNotification({
        to: order.customer.email,
        subject: `تأكيد الطلب - ${order.order_number}`,
        template: 'order_confirmation',
        data: {
          customer_name: order.customer.full_name,
          order_number: order.order_number,
          items: order.items.map(item => ({
            title: item.book.title_arabic || item.book.title,
            author: item.book.author_arabic || item.book.author,
            quantity: item.quantity,
            price: item.price,
            total: item.total
          })),
          subtotal: order.subtotal,
          shipping_cost: order.shipping_cost,
          total_amount: order.total_amount,
          delivery_address: order.delivery_address,
          estimated_delivery: order.estimated_delivery,
          payment_method: order.payment_method
        }
      });
    }

    // Send confirmation SMS to customer
    if (process.env.SMS_ENABLED === 'true' && order.customer.phone) {
      await sendSMSNotification({
        to: order.customer.phone,
        message: `مكتبة المتنبي: تم تأكيد طلبك #${order.order_number}. المبلغ: ${order.total_amount} د.ع. سيتم التوصيل خلال 3-5 أيام عمل.`
      });
    }

    console.log(`✅ Customer confirmation sent for order ${order.order_number}`);

  } catch (error) {
    console.error('Error sending customer confirmation:', error);
  }
};

// Update order status and notify relevant parties
const updateOrderStatus = async (orderId, newStatus, updatedBy) => {
  try {
    const order = await Order.findByPk(orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    const oldStatus = order.status;
    await order.update({ status: newStatus });

    // Send status update notifications
    await sendStatusUpdateNotifications(order, oldStatus, newStatus, updatedBy);

    console.log(`✅ Order ${order.order_number} status updated from ${oldStatus} to ${newStatus}`);

  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
};

// Send status update notifications
const sendStatusUpdateNotifications = async (order, oldStatus, newStatus, updatedBy) => {
  try {
    const statusMessages = {
      confirmed: 'تم تأكيد طلبك وسيتم تحضيره قريباً',
      processing: 'جاري تحضير طلبك',
      shipped: 'تم شحن طلبك وهو في الطريق إليك',
      delivered: 'تم توصيل طلبك بنجاح',
      cancelled: 'تم إلغاء طلبك'
    };

    const message = statusMessages[newStatus] || `تم تحديث حالة طلبك إلى ${newStatus}`;

    // Get customer info
    const customerOrder = await Order.findByPk(order.id, {
      include: [
        {
          model: User,
          as: 'customer',
          attributes: ['id', 'full_name', 'email', 'phone']
        }
      ]
    });

    // Send notification to customer
    if (process.env.SMS_ENABLED === 'true' && customerOrder.customer.phone) {
      await sendSMSNotification({
        to: customerOrder.customer.phone,
        message: `مكتبة المتنبي - طلب #${order.order_number}: ${message}`
      });
    }

  } catch (error) {
    console.error('Error sending status update notifications:', error);
  }
};

module.exports = {
  createPurchaseNotifications,
  sendCustomerConfirmation,
  updateOrderStatus,
  sendPurchaseNotification
};
