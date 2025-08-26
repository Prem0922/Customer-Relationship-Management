# CRM Application

A comprehensive Customer Relationship Management system for transit card operations, built with FastAPI backend and React frontend.

## 🏗️ Architecture

- **Backend**: FastAPI + SQLAlchemy + PostgreSQL/SQLite
- **Frontend**: React + TypeScript + Chakra UI + React Router
- **Database**: PostgreSQL (production) / SQLite (development)
- **Authentication**: JWT-based with bcrypt password hashing

## 📁 Project Structure

```
CRM/
├── backend/                 # FastAPI backend
│   ├── __init__.py
│   ├── main.py             # FastAPI app entry point
│   ├── api.py              # Main API routes and logic
│   ├── models.py           # SQLAlchemy database models
│   ├── database.py         # Database connection and session
│   ├── routers/            # API route modules
│   │   └── auth.py         # Authentication endpoints
│   ├── init_db.py          # Database schema initialization
│   ├── generate_data.py    # Demo data generation
│   ├── delete_db.py        # Database cleanup utilities
│   ├── requirements.txt    # Python dependencies
│   └── config.json         # Configuration file
├── src/                    # React frontend
│   ├── components/         # Reusable UI components
│   ├── pages/              # Application pages
│   ├── context/            # React context providers
│   ├── services/           # API service layer
│   ├── Routes.tsx          # Application routing
│   └── App.tsx             # Main app component
├── package.json            # Node.js dependencies
└── README.md               # This file
```

## 🚀 Quick Start

### Prerequisites

- **Python 3.11+**
- **Node.js 18+**
- **npm or yarn**
- **PostgreSQL** (optional, SQLite used by default)

### 1. Backend Setup

#### Clone and Navigate
```bash
cd CRM/backend
```

#### Create Virtual Environment
**Windows:**
```bash
python -m venv .venv
.\.venv\Scripts\activate
```

**macOS/Linux:**
```bash
python3 -m venv .venv
source .venv/bin/activate
```

#### Install Dependencies
```bash
pip install -r requirements.txt
```

#### Environment Configuration
Create a `.env` file in `CRM/backend/`:
```env
# Database (optional - defaults to SQLite if not set)
DATABASE_URL=postgresql://username:password@localhost:5432/crm_db

# API Security
API_KEY=your_secret_api_key_here

# JWT Secret (for production)
SECRET_KEY=your_jwt_secret_key_here
```

#### Initialize Database
```bash
# Create tables and schema
python init_db.py

# (Optional) Generate demo data
python generate_data.py
```

#### Run Backend Server
```bash
python -m uvicorn main:app --reload --port 8000
```

**Backend will be available at:**
- API Base: `http://127.0.0.1:8000`
- Swagger Docs: `http://127.0.0.1:8000/docs`
- ReDoc: `http://127.0.0.1:8000/redoc`
- Health Check: `http://127.0.0.1:8000/`

### 2. Frontend Setup

#### Navigate to Frontend Directory
```bash
cd CRM
```

#### Install Dependencies
```bash
npm install
```

#### Run Development Server
```bash
npm run dev
```

**Frontend will be available at:**
- `http://localhost:5173` (Vite default port)

#### Build for Production
```bash
npm run build
```

## 🗄️ Database Models

### Core Entities

- **Customer**: Transit card holders with contact information
- **Card**: Physical/virtual transit cards linked to customers
- **Trip**: Transit journeys with fare and route details
- **Case**: Customer support tickets and issues
- **TapHistory**: Card tap events at stations/vehicles
- **FareDispute**: Disputed fare charges
- **User**: System users (agents/admins)

### Database Schema
```sql
-- Example table structure
customers:
  - id (PK): CUST000001
  - name: John Doe
  - email: john@example.com
  - phone: +1234567890
  - notifications: Email Enabled
  - join_date: 2024-01-15

cards:
  - id (PK): 4716000000000001
  - type: Bank Card
  - status: ACTIVE
  - balance: 45.67
  - customer_id (FK): CUST000001
  - issue_date: 2024-01-15
```

## 🔌 API Endpoints

### Authentication
- `POST /auth/signup` - User registration
- `POST /auth/login` - User login

### Core Resources
- `GET/POST/PUT/DELETE /customers/` - Customer management
- `GET/POST/PUT/DELETE /cards/` - Card operations
- `GET/POST/PUT/DELETE /trips/` - Trip records
- `GET/POST/PUT/DELETE /cases/` - Support cases
- `GET/POST/PUT/DELETE /tap-history/` - Tap events
- `GET/POST/PUT/DELETE /fare-disputes/` - Fare disputes

### Special Operations
- `POST /cards/issue` - Issue new transit card
- `POST /cards/{id}/reload` - Add funds to card
- `POST /cards/{id}/products` - Add transit products
- `GET /cards/{id}/balance` - Check card balance
- `GET /cards/{id}/transactions` - Card transaction history
- `POST /payment/simulate` - Simulate payment processing
- `POST /simulate/cardTap` - Simulate card tap event

### Reports
- `GET /reports/summary` - System overview statistics

## 🧪 Testing

### Backend Testing
```bash
cd CRM/backend

# Test database connection
curl http://127.0.0.1:8000/admin/db-info

# Test API key authentication
curl -H "x-api-key: your_api_key" http://127.0.0.1:8000/customers/

# Test without API key (should fail)
curl http://127.0.0.1:8000/customers/
```

### Frontend Testing
1. Open `http://localhost:5173` in browser
2. Navigate through different pages
3. Test authentication flow
4. Verify API calls in browser dev tools

### Demo Data Testing
```bash
cd CRM/backend

# Generate fresh demo data
python generate_data.py

# Test with generated data
curl -H "x-api-key: your_api_key" http://127.0.0.1:8000/customers/
curl -H "x-api-key: your_api_key" http://127.0.0.1:8000/cards/
```

## 🔧 Configuration

### Backend Configuration
- **Database**: Configure via `DATABASE_URL` environment variable
- **API Keys**: Set `API_KEY` for endpoint protection
- **CORS**: Configured for development (allows all origins)

### Frontend Configuration
- **API Base URL**: Automatically switches between local and hosted
- **Authentication**: JWT tokens stored in localStorage
- **Routing**: Protected routes require authentication

## 🚨 Troubleshooting

### Common Issues

#### Backend Won't Start
```bash
# Check if port 8000 is available
netstat -an | grep 8000

# Check Python version
python --version

# Verify virtual environment
which python
```

#### Database Connection Issues
```bash
# Test database connection
python -c "from database import engine; print(engine.url)"

# Recreate database
python init_db.py
```

#### Frontend Build Issues
```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### API Authentication Errors
- Verify `x-api-key` header is sent
- Check `API_KEY` environment variable
- Ensure backend is running on correct port

### Debug Mode
```bash
# Backend with debug logging
python -m uvicorn main:app --reload --port 8000 --log-level debug

# Frontend with verbose logging
npm run dev -- --verbose
```


