# 🚇 Transit Card Management CRM System

A comprehensive Customer Relationship Management (CRM) system designed specifically for transit card operations. This full-stack application provides a modern, responsive interface for managing customers, transit cards, trips, service requests, and fare disputes.

## 🌟 Features

### 🔐 Authentication & Security
- **JWT-based Authentication** with bcrypt password hashing
- **Protected Routes** with role-based access control
- **Session Management** with automatic token refresh
- **API Key Protection** for backend endpoints

### 👥 Customer Management
- **Customer Registration** with validation
- **Profile Management** (name, email, phone, notifications)
- **Customer Search** and filtering
- **Customer History** tracking

### 💳 Transit Card Operations
- **Card Issuance** and registration
- **Balance Management** (reload, deduct)
- **Card Status Tracking** (Active, Suspended, Lost, etc.)
- **Product Management** (passes, tickets)
- **Card History** and transaction logs

### 🚌 Trip Management
- **Trip Recording** with entry/exit locations
- **Fare Calculation** and tracking
- **Route Management** with operator details
- **Transit Mode Support** (bus, train, subway)

### 🎫 Service & Support
- **Service Request Management** with priority levels
- **Case Tracking** with status updates
- **Fare Dispute Resolution**
- **Customer Support** ticket system

### 📊 Analytics & Reporting
- **Dashboard Analytics** with key metrics
- **Transaction History** with detailed logs
- **Tap History** tracking
- **Financial Reports** and summaries

### 🔧 API Integration
- **RESTful API** with standardized responses
- **POS System Integration** for card operations
- **Automation Support** with robot run IDs
- **Real-time Sync** capabilities

## 🏗️ Architecture

### Frontend (React + TypeScript)
- **React 18** with functional components and hooks
- **TypeScript** for type safety
- **Chakra UI** for modern, accessible components
- **React Router** for navigation
- **Axios** for API communication
- **Vite** for fast development and building

### Backend (FastAPI + Python)
- **FastAPI** for high-performance API
- **SQLAlchemy** ORM with PostgreSQL/SQLite support
- **Pydantic** for data validation
- **JWT** for authentication
- **CORS** enabled for cross-origin requests

### Database
- **PostgreSQL** (production) / **SQLite** (development)
- **Relational Design** with proper foreign keys
- **Cascade Operations** for data integrity

## 📁 Project Structure

```
CRM/
├── src/                          # Frontend React application
│   ├── components/               # Reusable UI components
│   │   ├── EditModal.tsx        # Generic edit modal
│   │   ├── Navbar.tsx           # Navigation sidebar
│   │   ├── ProtectedRoute.tsx   # Route protection
│   │   └── PublicRoute.tsx      # Public route handling
│   ├── context/                 # React context providers
│   │   └── AuthContext.tsx      # Authentication context
│   ├── pages/                   # Application pages
│   │   ├── Home.tsx            # Dashboard home
│   │   ├── Login.tsx           # Authentication
│   │   ├── Customers.tsx       # Customer management
│   │   ├── Products.tsx        # Card/product management
│   │   ├── Purchases.tsx       # Purchase tracking
│   │   ├── ServiceRequest.tsx  # Service requests
│   │   ├── TransactionHistory.tsx # Transaction logs
│   │   └── FareDisputes.tsx    # Dispute management
│   ├── services/               # API service layer
│   │   └── api.ts             # API client functions
│   ├── App.tsx                # Main application component
│   ├── Routes.tsx             # Route definitions
│   └── main.tsx              # Application entry point
├── backend/                    # FastAPI backend
│   ├── routers/               # API route modules
│   │   └── auth.py           # Authentication routes
│   ├── api.py                # Main API endpoints
│   ├── models.py             # Database models
│   ├── database.py           # Database configuration
│   ├── main.py              # FastAPI application
│   ├── requirements.txt     # Python dependencies
│   └── generate_data.py     # Sample data generation
├── package.json              # Frontend dependencies
├── vite.config.ts           # Vite configuration
├── tsconfig.json            # TypeScript configuration
└── README.md               # This file
```

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v16 or higher)
- **Python** (v3.8 or higher)
- **PostgreSQL** (optional, SQLite used by default)

### Frontend Setup
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Backend Setup
```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start the server
uvicorn main:app --reload --port 8000
```

### Database Setup
```bash
# The database will be created automatically on first run
# For sample data, use the admin endpoint:
curl -X POST http://localhost:8000/admin/generate-data
```

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the backend directory:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost/crm_db

# Security
SECRET_KEY=your-secret-key-here
API_KEY=mysecretkey

# Server
HOST=0.0.0.0
PORT=8000
```

### API Configuration
The frontend automatically detects the backend URL:
- **Development**: `http://127.0.0.1:8000`
- **Production**: `https://crm-n577.onrender.com`

## 📚 API Documentation

### Authentication Endpoints
- `POST /auth/signup` - User registration
- `POST /auth/login` - User authentication

### Customer Management
- `GET /customers/` - List all customers
- `POST /customers/` - Create new customer
- `PUT /customers/{id}` - Update customer
- `DELETE /customers/{id}` - Delete customer

### Card Operations
- `GET /cards/` - List all cards
- `POST /cards/` - Create new card
- `POST /api/cards/issue` - Issue card (POS API)
- `POST /api/cards/{id}/reload` - Reload card balance
- `POST /api/cards/{id}/products` - Add product to card

### Trip Management
- `GET /trips/` - List all trips
- `POST /trips/` - Create new trip
- `PUT /trips/{id}` - Update trip

### Service Requests
- `GET /cases/` - List all cases
- `POST /cases/` - Create new case
- `PUT /cases/{id}` - Update case

### Fare Disputes
- `GET /fare-disputes/` - List all disputes
- `POST /fare-disputes/` - Create new dispute
- `PUT /fare-disputes/{id}` - Update dispute

### Tap History
- `GET /tap-history/` - List tap entries
- `POST /tap-history/` - Create tap entry
- `POST /simulate/cardTap` - Simulate card tap

## 🎯 Key Features Explained

### Card Management System
The system supports various card operations:
- **Card Issuance**: Register new cards with customer association
- **Balance Management**: Add funds, deduct fares, track balances
- **Product Loading**: Add passes, tickets, or special products
- **Status Tracking**: Monitor card status (Active, Suspended, Lost)

### Customer Support Workflow
1. **Service Request Creation**: Customers can submit support tickets
2. **Case Assignment**: Requests are assigned to agents
3. **Status Tracking**: Monitor case progress and updates
4. **Resolution**: Track resolution time and customer satisfaction

### Fare Dispute Resolution
- **Dispute Recording**: Log fare-related issues
- **Evidence Tracking**: Link disputes to specific trips
- **Resolution Process**: Track dispute status and outcomes
- **Financial Impact**: Monitor dispute amounts and resolutions

### Real-time Operations
- **Card Tap Simulation**: Test card operations in real-time
- **Balance Updates**: Instant balance updates on transactions
- **Status Synchronization**: Real-time status updates across systems

## 🔒 Security Features

### Authentication
- **JWT Tokens**: Secure token-based authentication
- **Password Hashing**: bcrypt for secure password storage
- **Session Management**: Automatic token refresh and logout

### API Security
- **API Key Protection**: Required for sensitive operations
- **Input Validation**: Comprehensive data validation
- **CORS Configuration**: Secure cross-origin requests
- **Error Handling**: Secure error responses

### Data Protection
- **SQL Injection Prevention**: Parameterized queries
- **XSS Protection**: Input sanitization
- **CSRF Protection**: Token-based request validation

## 🚀 Deployment

### Frontend Deployment
```bash
# Build the application
npm run build

# Deploy to your preferred hosting service
# (Netlify, Vercel, AWS S3, etc.)
```

### Backend Deployment
```bash
# Using Docker
docker build -t crm-backend .
docker run -p 8000:8000 crm-backend

# Using Heroku
heroku create your-app-name
git push heroku main

# Using Railway/Render
# Connect your repository and deploy
```

### Database Deployment
- **Development**: SQLite (file-based)
- **Production**: PostgreSQL (recommended)
- **Cloud Options**: AWS RDS, Heroku Postgres, Railway Postgres

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

## 📝 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- **Issues**: Create an issue in the GitHub repository
- **Documentation**: Check the inline code comments
- **API Docs**: Visit `/docs` when running the backend server

## 🔄 Version History

- **v1.0.0** - Initial release with core CRM functionality
- **v1.1.0** - Added fare dispute management
- **v1.2.0** - Enhanced API integration and POS support
- **v1.3.0** - Improved UI/UX and performance optimizations

---

**Built with ❤️ for efficient transit card management**
