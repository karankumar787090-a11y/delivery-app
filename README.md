# 🍔 FoodHub - Food Delivery App (Swiggy/Zomato Clone)

A complete full-stack food delivery application built with Python Flask backend and HTML/CSS/JavaScript frontend. Features user authentication, restaurant browsing, order management, and customer support system with admin panel.

---

## 📋 Features

### User Features (Phase 1 & 2)
- **Phase 1 - New User Signup**: Sign up with name, email, phone, and password
- **Phase 2 - Registered User Login**: Login to existing accounts
- **Browse Restaurants**: View all available restaurants with ratings and delivery info
- **Browse Menu**: View menu items for each restaurant with prices
- **Place Orders**: Add items to cart and checkout with delivery address
- **Order Tracking**: View order history with status (pending, confirmed, delivered)
- **Customer Support**: Submit queries/problems related to orders or general issues
- **Query Tracking**: Track submitted queries with admin responses
- **Profile Management**: View and manage user profile

### Admin Features
- **Query Management**: View all customer queries and respond to them
- **Order Management**: View all orders in the system
- **Restaurant Management**: Add new restaurants to the platform
- **Query Resolution**: Mark queries as resolved with responses

---

## 🛠 Tech Stack

### Backend
- **Framework**: Flask (Python)
- **Database**: SQLite
- **Authentication**: JWT (JSON Web Tokens)
- **APIs**: RESTful API with Flask-CORS

### Frontend
- **HTML5**: Semantic markup
- **CSS3**: Responsive design
- **JavaScript (ES6)**: Dynamic interactions
- **Local Storage**: Session management

---

## 📁 Project Structure

```
delivery app/
├── backend/
│   └── main.py                    # Flask backend with all APIs
├── Dependencies/
│   └── requrement.txt             # Python dependencies
└── frontend/
    ├── index.html                 # All pages (signup, login, dashboard, admin)
    ├── style.css                  # Responsive styling
    └── app.js                     # Frontend logic and API calls
```

---

## 🚀 Setup & Installation

### Prerequisites
- Python 3.8 or higher
- pip (Python package manager)
- Modern web browser

### Step 1: Install Python Dependencies

```bash
cd "delivery app\backend"
pip install -r ..\Dependencies\requrement.txt
```

### Step 2: Start the Backend Server

```bash
cd backend
python main.py
```

The backend will start on `http://localhost:5000`

### Step 3: Open the Frontend

Open `frontend/index.html` in your web browser:
```
file:///path/to/delivery app/frontend/index.html
```

Or use a local server (recommended):
```bash
# Using Python 3
cd frontend
python -m http.server 8000
```

Then open `http://localhost:8000/index.html`

### Step 4: Initialize Database (Optional)

First login with admin credentials:
- Email: `admin@delivery.com`
- Password: `admin123`

Then call this endpoint to populate sample data:
```
POST http://localhost:5000/api/init-db
```

Or click a button in the admin panel if provided.

---

## 📚 API Endpoints

### Authentication
```
POST /api/auth/signup          - Register new user
POST /api/auth/login           - Login user
```

### Restaurants & Menu
```
GET  /api/restaurants                    - Get all restaurants
GET  /api/restaurants/<id>/menu          - Get menu items
```

### Orders
```
POST   /api/orders                       - Create order (auth required)
GET    /api/orders/<id>                  - Get order details (auth required)
GET    /api/orders/user/all              - Get user's orders (auth required)
```

### Customer Queries
```
POST   /api/queries                      - Submit query (auth required)
GET    /api/queries/user/all             - Get user's queries (auth required)
GET    /api/queries/<id>                 - Get query details (auth required)
```

### Admin
```
GET    /api/admin/queries                - Get all queries (admin required)
PUT    /api/admin/queries/<id>/resolve   - Resolve query (admin required)
GET    /api/admin/orders                 - Get all orders (admin required)
POST   /api/admin/restaurants            - Add restaurant (admin required)
```

---

## 🧪 Sample Test Accounts

### Regular User
- Email: `user@delivery.com`
- Password: `user123`

### Admin User
- Email: `admin@delivery.com`
- Password: `admin123`

### Sample Restaurants
1. **Biryani House** - Indian Cuisine (4.8⭐)
2. **Pizza Palace** - Italian Cuisine (4.6⭐)
3. **Dragon Wok** - Chinese Cuisine (4.5⭐)
4. **Burger Barn** - American Cuisine (4.7⭐)

---

## 🎯 How to Use

### As a Customer

1. **Sign Up** (Phase 1):
   - Go to signup page
   - Enter name, email, phone, and password
   - Click "Sign Up"

2. **Login** (Phase 2):
   - Enter email and password
   - Access customer dashboard

3. **Browse & Order**:
   - View restaurants in "Restaurants" tab
   - Click "View Menu" on any restaurant
   - Add items to cart
   - Enter delivery address
   - Click "Place Order"

4. **Track Orders**:
   - Go to "My Orders" tab
   - View all order history with status

5. **Support & Queries**:
   - Go to "Support & Queries" tab
   - Submit a new query with subject and description
   - View admin responses in "Your Previous Queries"

6. **Profile**:
   - View your profile information in "Profile" tab

### As Admin

1. **Login** with admin credentials
2. **Manage Queries**:
   - View all customer queries
   - Write response and mark as resolved
3. **View Orders**:
   - See all orders in the system
4. **Manage Restaurants**:
   - Add new restaurants with details

---

## 🔐 Security Features

- Password hashing using Werkzeug
- JWT token-based authentication
- Admin role verification
- Protected API endpoints
- CORS enabled for frontend communication

---

## 📱 Responsive Design

- Mobile-first CSS approach
- Responsive grid layouts
- Mobile menu support
- Touch-friendly buttons
- Optimized for all screen sizes

---

## 🐛 Troubleshooting

### CORS Error
If you get CORS errors, make sure:
- Backend is running on `http://localhost:5000`
- Frontend is served via HTTP (not file:// protocol)
- Use Python local server for frontend

### Database Issues
- Delete `backend/instance/delivery_app.db` to reset database
- Re-run `python main.py` to create fresh database
- Call `POST /api/init-db` to populate sample data

### JWT Errors
- Clear browser localStorage
- Login again to get fresh token
- Check token in browser developer tools (Application → Local Storage)

---

## 🚀 Future Enhancements

- Payment gateway integration (Stripe/PayPal)
- Real-time order tracking with maps
- Rating and reviews system
- Loyalty points program
- Push notifications
- Multiple payment methods
- Delivery partner management
- Advanced analytics dashboard
- Mobile app (React Native/Flutter)
- Email notifications

---

## 📝 API Request Examples

### Signup
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@example.com","phone":"9876543210","password":"pass123"}'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"pass123"}'
```

### Get Restaurants
```bash
curl -X GET http://localhost:5000/api/restaurants
```

### Place Order
```bash
curl -X POST http://localhost:5000/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"restaurant_id":1,"items":{"1":{"name":"Biryani","price":250,"quantity":1}},"total_price":300,"delivery_address":"123 Main St"}'
```

### Submit Query
```bash
curl -X POST http://localhost:5000/api/queries \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"subject":"Order Issue","message":"My order is delayed"}'
```

---

## 💡 Notes

- All data is stored in SQLite database (can be easily migrated to PostgreSQL)
- JWT secret key should be changed in production
- Add environment variables for sensitive configuration
- Implement proper error logging in production
- Add rate limiting to prevent abuse
- Implement payment processing for real transactions

---

## 📄 License

This project is created for educational purposes.

---

**Created with ❤️ - Enjoy Your Food Delivery Experience! 🍕🍔🍜**
