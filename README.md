# المتنبي (Al-Mutanabbi) - Iraqi Online Bookstore

An Iraqi online bookstore marketplace inspired by Al-Mutanabbi Street in Baghdad.

## 🎯 Project Overview

**Stage 1: Foundation & MVP (8-12 weeks)**
- User authentication system
- Basic book catalog with search
- Bookstore registration and management
- Simple shopping cart functionality
- Arabic-first responsive UI with RTL support

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

### Stage 1 Features
- ✅ User registration and authentication
- ✅ Bookstore owner registration
- ✅ Book catalog with search functionality
- ✅ Book management for store owners
- ✅ Shopping cart (localStorage)
- ✅ Basic order system
- ✅ Responsive Arabic-first UI

## 🌟 Cultural Elements

This platform celebrates Iraqi literary culture:
- Inspired by the famous Al-Mutanabbi Street in Baghdad
- Arabic-first interface with beautiful typography
- Iraqi cultural aesthetics in design
- Support for Arabic book titles and descriptions

## 📞 Support

For questions or support, please create an issue in this repository.

---

**مرحباً بكم في المتنبي - مكتبة العراق الرقمية**
