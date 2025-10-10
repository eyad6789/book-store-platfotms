# المتنبي (Al-Mutanabbi) - Iraqi Online Bookstore Marketplace

A comprehensive Iraqi online bookstore marketplace inspired by the legendary Al-Mutanabbi Street in Baghdad - the heart of Arab intellectual and literary culture.

## 🎯 Project Overview

المتنبي is a full-featured online marketplace that connects book lovers with Iraqi bookstores, offering a modern digital platform that preserves the cultural essence of traditional book markets while providing contemporary e-commerce functionality.

### Current Development Status
- ✅ **Stage 1**: Foundation & MVP - Complete
- ✅ **Stage 2**: Advanced Features & Analytics - Complete  
- 🚧 **Stage 3**: Self-Service Portal & Enhanced Analytics - In Progress

### Key Achievements
- Full-featured bookstore marketplace with Arabic-first design
- Comprehensive user management and authentication system
- Advanced admin analytics dashboard with real-time metrics
- Star rating and review system for bookstores
- Library owner self-service portal with book management
- Mobile-responsive design with RTL support

## 🏗️ Tech Stack

### Frontend
- **Framework**: React 18+ (JavaScript)
- **Styling**: Tailwind CSS
- **State Management**: React Context API + useReducer
- **Routing**: React Router v6
- **Forms**: React Hook Form
- **HTTP Client**: Axios
- **Icons**: Lucide React

### Backend
- **Runtime**: Node.js 18+ with Express.js
- **Database**: PostgreSQL with Sequelize ORM
- **Authentication**: JWT + bcrypt
- **File Upload**: Multer
- **Validation**: Joi

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL
- npm or yarn

### Backend Setup
```bash
cd server
npm install
cp .env.example .env
# Configure your database settings in .env
npm run dev
```

### Frontend Setup
```bash
cd client
npm install
npm start
```

### Database Setup
```bash
# Create PostgreSQL database
createdb almutanabbi

# Run migrations (after setting up backend)
cd server
npm run migrate
```

## 📁 Project Structure

```
almutanabbi/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom hooks
│   │   ├── utils/         # Helper functions
│   │   ├── styles/        # CSS files
│   │   └── App.js
│   └── package.json
├── server/                # Express backend
│   ├── controllers/       # Route handlers
│   ├── middleware/        # Custom middleware
│   ├── models/           # Database models
│   ├── routes/           # API routes
│   ├── utils/            # Helper functions
│   ├── config/           # Database config
│   └── server.js
└── README.md
```

## 🎨 Design System

### Color Palette
- **Primary Brown**: #8B4513
- **Primary Gold**: #FFD700
- **Cream Background**: #F5F5DC
- **Dark Text**: #2D1810
- **Light Gray**: #F8F9FA

### Typography
- **Arabic**: Amiri font (Google Fonts)
- **English**: Inter font
- **RTL Support**: Full right-to-left layout

## 🔧 Core Features

### 👥 User Management System
- **Multi-role Authentication**: Customers, Library Owners, and Administrators
- **Secure Registration/Login**: JWT-based authentication with bcrypt encryption
- **Profile Management**: Complete user profile system with avatar support
- **Password Recovery**: Secure forgot password functionality
- **Role-based Access Control**: Different permissions for each user type

### 📚 Book & Library Management
- **Book Catalog**: Comprehensive book database with search and filtering
- **Library Registration**: Bookstore owners can register and manage their libraries
- **Book Management**: CRUD operations for library owners to manage their inventory
- **Image Upload**: Support for book cover and library avatar uploads
- **Availability Status**: Real-time book availability tracking
- **Book Sharing**: Promotional book sharing system with tracking

### 🛒 E-commerce Features
- **Shopping Cart**: Persistent cart functionality with localStorage
- **Order Management**: Complete order creation and tracking system
- **Wishlist**: Save favorite books for later purchase
- **Search & Filter**: Advanced search with multiple filter options
- **Mobile Cart**: Optimized mobile shopping experience

### ⭐ Rating & Review System
- **Library Ratings**: 5-star rating system for bookstores
- **Review Management**: Customers can write and manage reviews
- **Rating Analytics**: Comprehensive rating statistics and distribution
- **Helpful Votes**: Community-driven review helpfulness system
- **Real-time Updates**: Automatic rating calculations via database triggers

### 📊 Advanced Analytics Dashboard
- **Admin Dashboard**: Multi-tab analytics interface with real-time metrics
- **User Analytics**: User registration trends and engagement metrics
- **Library Analytics**: Library performance and rating analytics
- **Book Analytics**: Popular books and inventory insights
- **Engagement Metrics**: User activity and interaction tracking
- **Data Visualization**: Charts and graphs for key performance indicators

### 🎨 User Experience
- **Arabic-First Design**: Native RTL support with beautiful Arabic typography
- **Responsive Layout**: Mobile-optimized design for all screen sizes
- **Cultural Aesthetics**: Iraqi-inspired design elements and color scheme
- **Intuitive Navigation**: User-friendly interface with clear navigation
- **Loading States**: Smooth loading animations and skeleton screens

## 🗄️ Database Schema

### Core Tables
- **users**: User accounts with role-based access (customer, library_owner, admin)
- **bookstores**: Library/bookstore information and metadata
- **books**: Book catalog with detailed information
- **library_books**: Junction table linking books to specific libraries
- **orders**: Order management and tracking
- **order_items**: Individual items within orders
- **library_reviews**: Rating and review system for libraries
- **book_shares**: Book sharing and promotional tracking
- **user_activities**: User engagement and activity logging

### Key Features
- **Automatic Rating Calculation**: Database triggers for real-time rating updates
- **Referential Integrity**: Foreign key constraints ensuring data consistency
- **Indexing**: Optimized indexes for search and query performance
- **Migration System**: Structured database migrations for version control

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/forgot-password` - Password recovery
- `POST /api/auth/reset-password` - Password reset

### User Management
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `POST /api/users/avatar` - Upload user avatar

### Books & Libraries
- `GET /api/books` - Get books with search and filters
- `GET /api/bookstores` - Get bookstores/libraries
- `POST /api/bookstores` - Register new bookstore
- `GET /api/library/:id/books` - Get books for specific library
- `POST /api/library/books` - Add book to library (library owners)
- `PUT /api/library/books/:id` - Update book information
- `DELETE /api/library/books/:id` - Remove book from library

### Orders & Cart
- `POST /api/orders` - Create new order
- `GET /api/orders` - Get user orders
- `GET /api/orders/:id` - Get specific order details

### Rating System
- `POST /api/ratings/library/:id/review` - Create library review
- `GET /api/ratings/library/:id/reviews` - Get library reviews
- `GET /api/ratings/library/:id/stats` - Get rating statistics
- `PUT /api/ratings/library/review/:id` - Update review
- `DELETE /api/ratings/library/review/:id` - Delete review
- `POST /api/ratings/library/review/:id/helpful` - Mark review helpful

### Admin Analytics
- `GET /api/admin/analytics/overview` - Dashboard overview metrics
- `GET /api/admin/analytics/users` - User analytics
- `GET /api/admin/analytics/libraries` - Library performance
- `GET /api/admin/analytics/books` - Book analytics
- `GET /api/admin/ratings/analytics` - Rating system analytics

## 🚀 Deployment

### Environment Variables
```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=almutanabbi
DB_USER=your_username
DB_PASS=your_password

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d

# Server
PORT=5000
NODE_ENV=production

# File Upload
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5MB
```

### Production Setup
1. **Database**: PostgreSQL 13+ recommended
2. **Node.js**: Version 18+ required
3. **File Storage**: Local filesystem or cloud storage
4. **Reverse Proxy**: Nginx recommended for production
5. **SSL**: HTTPS certificate required for production

### Quick Start Scripts
```bash
# Development
npm run dev          # Start both client and server
npm run client       # Start React development server
npm run server       # Start Express server with nodemon

# Production
npm run build        # Build React app for production
npm start           # Start production server

# Database
npm run migrate     # Run database migrations
npm run seed        # Seed database with sample data
```

## 🧪 Testing

### Available Test Scripts
- Unit tests for API endpoints
- Database model testing
- Authentication flow testing
- Rating system testing
- Order creation testing

### Running Tests
```bash
cd server
npm test                    # Run all tests
npm run test:api           # Test API endpoints
npm run test:models        # Test database models
npm run test:auth          # Test authentication
```

## 🌟 Cultural Elements

This platform celebrates Iraqi literary culture:
- **Al-Mutanabbi Street**: Inspired by Baghdad's famous book market
- **Arabic Typography**: Beautiful Amiri font for authentic Arabic text
- **Cultural Design**: Iraqi-inspired color palette and visual elements
- **Literary Heritage**: Honoring Iraq's rich intellectual tradition
- **Bilingual Support**: Seamless Arabic-English interface

## 📈 Performance Features

- **Optimized Queries**: Efficient database queries with proper indexing
- **Image Optimization**: Compressed image uploads with size limits
- **Caching**: Strategic caching for frequently accessed data
- **Lazy Loading**: Component-based lazy loading for better performance
- **Mobile Optimization**: Responsive design optimized for mobile devices
- **SEO Ready**: Semantic HTML structure for search engine optimization

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt encryption for password security
- **Input Validation**: Comprehensive input validation using Joi
- **SQL Injection Protection**: Parameterized queries via Sequelize ORM
- **File Upload Security**: Secure file upload with type and size validation
- **CORS Configuration**: Proper cross-origin resource sharing setup

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

For questions, bug reports, or feature requests:
- Create an issue in this repository
- Contact the development team
- Check the documentation in the `/docs` folder

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 🎯 Future Roadmap

### Stage 3 (In Progress)
- Enhanced library owner self-service portal
- Advanced book sharing and promotional features
- Comprehensive user activity tracking
- Advanced analytics and reporting

### Stage 4 (Planned)
- Mobile app development (React Native)
- Payment gateway integration
- Advanced recommendation system
- Multi-language support expansion

---

**مرحباً بكم في المتنبي - مكتبة العراق الرقمية**

*Welcome to Al-Mutanabbi - Iraq's Digital Library*
