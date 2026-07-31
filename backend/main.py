from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
import os

# Initialize Flask App
app = Flask(__name__)
CORS(app)

# Configuration
DATABASE_URL = os.environ.get('DATABASE_URL', 'sqlite:///delivery_app.db')

# Handle PostgreSQL URL format for Render
if DATABASE_URL and DATABASE_URL.startswith('postgresql://'):
    DATABASE_URL = DATABASE_URL.replace('postgresql://', 'postgresql+psycopg2://', 1)

app.config['SQLALCHEMY_DATABASE_URI'] = DATABASE_URL
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'your-secret-key-change-this-in-production')

# Initialize Database and JWT
db = SQLAlchemy(app)
jwt = JWTManager(app)
#======================================HOME ROUTE ==============================
@app.route('/', methods=['GET'])
def home():
    return jsonify({
        'status': 'success',
        'message': 'Welcome to Delivery App Backend API! Server is running fine.',
        'endpoints': {
            'health': '/api/health',
            'restaurants': '/api/restaurants',
            'login': '/api/auth/login',
            'signup': '/api/auth/signup'
        }
    }), 200

# ==================== DATABASE MODELS ====================

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    phone = db.Column(db.String(10), nullable=False)
    password = db.Column(db.String(255), nullable=False)
    address = db.Column(db.Text, default='')
    role = db.Column(db.String(20), default='customer')  # customer, admin
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    orders = db.relationship('Order', backref='customer', lazy=True, foreign_keys='Order.user_id')
    queries = db.relationship('CustomerQuery', backref='user', lazy=True)

class Restaurant(db.Model):
    __tablename__ = 'restaurants'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    cuisine = db.Column(db.String(100), nullable=False)
    rating = db.Column(db.Float, default=4.5)
    delivery_time = db.Column(db.Integer, default=30)  # minutes
    delivery_fee = db.Column(db.Float, default=50)
    is_active = db.Column(db.Boolean, default=True)
    
    menu_items = db.relationship('MenuItem', backref='restaurant', lazy=True, cascade='all, delete-orphan')
    orders = db.relationship('Order', backref='restaurant', lazy=True)

class MenuItem(db.Model):
    __tablename__ = 'menu_items'
    
    id = db.Column(db.Integer, primary_key=True)
    restaurant_id = db.Column(db.Integer, db.ForeignKey('restaurants.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    price = db.Column(db.Float, nullable=False)
    category = db.Column(db.String(50), default='Main')
    is_available = db.Column(db.Boolean, default=True)

class Order(db.Model):
    __tablename__ = 'orders'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    restaurant_id = db.Column(db.Integer, db.ForeignKey('restaurants.id'), nullable=False)
    order_items = db.Column(db.Text)  # JSON format
    total_price = db.Column(db.Float, nullable=False)
    status = db.Column(db.String(20), default='pending')  # pending, confirmed, delivered, cancelled
    delivery_address = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    delivery_by = db.Column(db.DateTime)

class CustomerQuery(db.Model):
    __tablename__ = 'customer_queries'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    order_id = db.Column(db.Integer, db.ForeignKey('orders.id'), nullable=True)
    subject = db.Column(db.String(200), nullable=False)
    message = db.Column(db.Text, nullable=False)
    status = db.Column(db.String(20), default='open')  # open, in-progress, resolved
    response = db.Column(db.Text, default='')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    resolved_at = db.Column(db.DateTime)

# ==================== AUTHENTICATION ROUTES ====================

@app.route('/api/auth/signup', methods=['POST'])
def signup():
    """User Signup - Phase 1 (New User)"""
    try:
        data = request.get_json()
        
        if not all(k in data for k in ['name', 'email', 'phone', 'password']):
            return jsonify({'error': 'Missing required fields'}), 400
        
        if User.query.filter_by(email=data['email']).first():
            return jsonify({'error': 'Email already exists'}), 400
        
        user = User(
            name=data['name'],
            email=data['email'],
            phone=data['phone'],
            password=generate_password_hash(data['password']),
            role='customer'
        )
        db.session.add(user)
        db.session.commit()
        
        access_token = create_access_token(identity=user.id)
        return jsonify({
            'message': 'User created successfully',
            'access_token': access_token,
            'user': {'id': user.id, 'name': user.name, 'email': user.email}
        }), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/auth/login', methods=['POST'])
def login():
    """User Login - Phase 2 (Registered User)"""
    try:
        data = request.get_json()
        
        if not all(k in data for k in ['email', 'password']):
            return jsonify({'error': 'Email and password required'}), 400
        
        user = User.query.filter_by(email=data['email']).first()
        
        if not user or not check_password_hash(user.password, data['password']):
            return jsonify({'error': 'Invalid email or password'}), 401
        
        access_token = create_access_token(identity=user.id)
        return jsonify({
            'message': 'Login successful',
            'access_token': access_token,
            'user': {'id': user.id, 'name': user.name, 'email': user.email, 'role': user.role}
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ==================== RESTAURANT ROUTES ====================

@app.route('/api/restaurants', methods=['GET'])
def get_restaurants():
    """Get all active restaurants"""
    try:
        restaurants = Restaurant.query.filter_by(is_active=True).all()
        return jsonify([{
            'id': r.id,
            'name': r.name,
            'cuisine': r.cuisine,
            'rating': r.rating,
            'delivery_time': r.delivery_time,
            'delivery_fee': r.delivery_fee
        } for r in restaurants]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/restaurants/<int:restaurant_id>/menu', methods=['GET'])
def get_menu(restaurant_id):
    """Get menu items for a restaurant"""
    try:
        items = MenuItem.query.filter_by(restaurant_id=restaurant_id, is_available=True).all()
        return jsonify([{
            'id': item.id,
            'name': item.name,
            'description': item.description,
            'price': item.price,
            'category': item.category
        } for item in items]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ==================== ORDER ROUTES ====================

@app.route('/api/orders', methods=['POST'])
@jwt_required()
def create_order():
    """Create a new order"""
    try:
        current_user_id = get_jwt_identity()
        data = request.get_json()
        
        if not all(k in data for k in ['restaurant_id', 'items', 'total_price', 'delivery_address']):
            return jsonify({'error': 'Missing required fields'}), 400
        
        order = Order(
            user_id=current_user_id,
            restaurant_id=data['restaurant_id'],
            order_items=str(data['items']),
            total_price=data['total_price'],
            delivery_address=data['delivery_address'],
            status='pending'
        )
        db.session.add(order)
        db.session.commit()
        
        return jsonify({
            'message': 'Order created successfully',
            'order_id': order.id,
            'status': order.status
        }), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/orders/<int:order_id>', methods=['GET'])
@jwt_required()
def get_order(order_id):
    """Get order details"""
    try:
        order = Order.query.get(order_id)
        if not order:
            return jsonify({'error': 'Order not found'}), 404
        
        return jsonify({
            'id': order.id,
            'restaurant_id': order.restaurant_id,
            'total_price': order.total_price,
            'status': order.status,
            'delivery_address': order.delivery_address,
            'created_at': order.created_at
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/orders/user/all', methods=['GET'])
@jwt_required()
def get_user_orders():
    """Get all orders for logged-in user"""
    try:
        current_user_id = get_jwt_identity()
        orders = Order.query.filter_by(user_id=current_user_id).all()
        
        return jsonify([{
            'id': o.id,
            'restaurant_id': o.restaurant_id,
            'total_price': o.total_price,
            'status': o.status,
            'created_at': o.created_at
        } for o in orders]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ==================== CUSTOMER QUERY ROUTES ====================

@app.route('/api/queries', methods=['POST'])
@jwt_required()
def create_query():
    """Create a customer query/problem"""
    try:
        current_user_id = get_jwt_identity()
        data = request.get_json()
        
        if not all(k in data for k in ['subject', 'message']):
            return jsonify({'error': 'Subject and message required'}), 400
        
        query = CustomerQuery(
            user_id=current_user_id,
            order_id=data.get('order_id'),
            subject=data['subject'],
            message=data['message'],
            status='open'
        )
        db.session.add(query)
        db.session.commit()
        
        return jsonify({
            'message': 'Query submitted successfully',
            'query_id': query.id,
            'status': query.status
        }), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/queries/user/all', methods=['GET'])
@jwt_required()
def get_user_queries():
    """Get all queries for logged-in user"""
    try:
        current_user_id = get_jwt_identity()
        queries = CustomerQuery.query.filter_by(user_id=current_user_id).all()
        
        return jsonify([{
            'id': q.id,
            'subject': q.subject,
            'message': q.message,
            'status': q.status,
            'response': q.response,
            'created_at': q.created_at
        } for q in queries]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/queries/<int:query_id>', methods=['GET'])
@jwt_required()
def get_query(query_id):
    """Get specific query details"""
    try:
        query = CustomerQuery.query.get(query_id)
        if not query:
            return jsonify({'error': 'Query not found'}), 404
        
        return jsonify({
            'id': query.id,
            'subject': query.subject,
            'message': query.message,
            'status': query.status,
            'response': query.response,
            'created_at': query.created_at
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ==================== ADMIN ROUTES ====================

@app.route('/api/admin/queries', methods=['GET'])
@jwt_required()
def admin_get_all_queries():
    """Admin: Get all customer queries"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if user.role != 'admin':
            return jsonify({'error': 'Admin access required'}), 403
        
        queries = CustomerQuery.query.all()
        return jsonify([{
            'id': q.id,
            'user_id': q.user_id,
            'subject': q.subject,
            'message': q.message,
            'status': q.status,
            'created_at': q.created_at
        } for q in queries]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin/queries/<int:query_id>/resolve', methods=['PUT'])
@jwt_required()
def admin_resolve_query(query_id):
    """Admin: Resolve customer query"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if user.role != 'admin':
            return jsonify({'error': 'Admin access required'}), 403
        
        query = CustomerQuery.query.get(query_id)
        if not query:
            return jsonify({'error': 'Query not found'}), 404
        
        data = request.get_json()
        query.response = data.get('response', '')
        query.status = 'resolved'
        query.resolved_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({'message': 'Query resolved successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin/orders', methods=['GET'])
@jwt_required()
def admin_get_all_orders():
    """Admin: Get all orders"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if user.role != 'admin':
            return jsonify({'error': 'Admin access required'}), 403
        
        orders = Order.query.all()
        return jsonify([{
            'id': o.id,
            'user_id': o.user_id,
            'restaurant_id': o.restaurant_id,
            'status': o.status,
            'total_price': o.total_price,
            'created_at': o.created_at
        } for o in orders]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin/restaurants', methods=['POST'])
@jwt_required()
def admin_add_restaurant():
    """Admin: Add new restaurant"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if user.role != 'admin':
            return jsonify({'error': 'Admin access required'}), 403
        
        data = request.get_json()
        restaurant = Restaurant(
            name=data['name'],
            cuisine=data['cuisine'],
            rating=data.get('rating', 4.5),
            delivery_time=data.get('delivery_time', 30),
            delivery_fee=data.get('delivery_fee', 50)
        )
        db.session.add(restaurant)
        db.session.commit()
        
        return jsonify({'message': 'Restaurant added successfully', 'id': restaurant.id}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ==================== DATABASE INITIALIZATION ====================

@app.route('/api/init-db', methods=['POST'])
def init_db():
    """Initialize database with sample data"""
    try:
        db.drop_all()
        db.create_all()
        
        # Create admin user
        admin = User(
            name='Admin User',
            email='admin@delivery.com',
            phone='9999999999',
            password=generate_password_hash('admin123'),
            role='admin'
        )
        db.session.add(admin)
        
        # Create sample restaurants
        restaurants = [
            Restaurant(name='Biryani House', cuisine='Indian', rating=4.8, delivery_time=25, delivery_fee=40),
            Restaurant(name='Pizza Palace', cuisine='Italian', rating=4.6, delivery_time=30, delivery_fee=50),
            Restaurant(name='Dragon Wok', cuisine='Chinese', rating=4.5, delivery_time=20, delivery_fee=35),
            Restaurant(name='Burger Barn', cuisine='American', rating=4.7, delivery_time=15, delivery_fee=30),
        ]
        db.session.add_all(restaurants)
        db.session.commit()
        
        # Add menu items for each restaurant
        menu_items = [
            MenuItem(restaurant_id=1, name='Chicken Biryani', description='Fragrant rice with spiced chicken', price=250, category='Rice'),
            MenuItem(restaurant_id=1, name='Goat Biryani', description='Premium goat biryani', price=350, category='Rice'),
            MenuItem(restaurant_id=1, name='Naan', description='Freshly baked naan bread', price=50, category='Bread'),
            
            MenuItem(restaurant_id=2, name='Margherita Pizza', description='Classic cheese pizza', price=300, category='Pizza'),
            MenuItem(restaurant_id=2, name='Pepperoni Pizza', description='Pizza with pepperoni', price=350, category='Pizza'),
            MenuItem(restaurant_id=2, name='Garlic Bread', description='Crispy garlic bread', price=80, category='Sides'),
            
            MenuItem(restaurant_id=3, name='Chicken Hakka Noodles', description='Stir-fried noodles with chicken', price=200, category='Noodles'),
            MenuItem(restaurant_id=3, name='Fried Rice', description='Egg fried rice', price=180, category='Rice'),
            MenuItem(restaurant_id=3, name='Spring Rolls', description='Crispy spring rolls', price=120, category='Appetizers'),
            
            MenuItem(restaurant_id=4, name='Cheese Burger', description='Juicy beef burger with cheese', price=150, category='Burgers'),
            MenuItem(restaurant_id=4, name='Chicken Burger', description='Grilled chicken burger', price=120, category='Burgers'),
            MenuItem(restaurant_id=4, name='French Fries', description='Golden crispy fries', price=80, category='Sides'),
        ]
        db.session.add_all(menu_items)
        db.session.commit()
        
        return jsonify({'message': 'Database initialized successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ==================== ERROR HANDLERS ====================

@app.errorhandler(404)
def not_found(e):
    return jsonify({'error': 'Route not found'}), 404

@app.errorhandler(500)
def server_error(e):
    return jsonify({'error': 'Internal server error'}), 500

# ==================== HEALTH CHECK ====================

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({'status': 'Backend is running!'}), 200

# ==================== RUN APP ====================

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)

