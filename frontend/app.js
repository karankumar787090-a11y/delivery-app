// API Configuration
const API_URL = 'http://localhost:5000/api';
let authToken = localStorage.getItem('authToken');
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
let selectedRestaurantId = null;
let cart = {};
let cartTotal = 0;

// ==================== INITIALIZATION ====================

document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    if (authToken && currentUser) {
        if (currentUser.role === 'admin') {
            switchPage('admin-page');
            loadAdminQueries();
            loadAdminOrders();
        } else {
            switchPage('dashboard-page');
            displayUserName();
            loadRestaurants();
            loadUserOrders();
            loadUserQueries();
            loadUserProfile();
        }
    } else {
        switchPage('signup-page');
    }

    // Form submissions
    document.getElementById('signup-form').addEventListener('submit', handleSignup);
    document.getElementById('login-form').addEventListener('submit', handleLogin);
    document.getElementById('query-form').addEventListener('submit', handleQuerySubmit);
    document.getElementById('add-restaurant-form').addEventListener('submit', handleAddRestaurant);
});

// ==================== PAGE MANAGEMENT ====================

function switchPage(pageId) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    // Show selected page
    document.getElementById(pageId).classList.add('active');
}

function switchTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab
    document.getElementById(tabName + '-tab').classList.add('active');
    event.target.classList.add('active');
}

function switchAdminTab(tabName) {
    // Hide all admin tabs
    document.querySelectorAll('.admin-tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.admin-tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab
    document.getElementById(tabName + '-tab').classList.add('active');
    event.target.classList.add('active');
}

// ==================== NOTIFICATIONS ====================

function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = 'notification show ' + type;
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// ==================== AUTHENTICATION ====================

async function handleSignup(e) {
    e.preventDefault();
    
    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const phone = document.getElementById('signup-phone').value;
    const password = document.getElementById('signup-password').value;
    const confirm = document.getElementById('signup-confirm').value;
    
    if (password !== confirm) {
        showNotification('Passwords do not match', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, phone, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            authToken = data.access_token;
            currentUser = data.user;
            localStorage.setItem('authToken', authToken);
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            
            showNotification('Account created successfully!');
            setTimeout(() => {
                switchPage('dashboard-page');
                displayUserName();
                loadRestaurants();
            }, 1000);
        } else {
            showNotification(data.error, 'error');
        }
    } catch (error) {
        showNotification('Error: ' + error.message, 'error');
    }
}

async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            authToken = data.access_token;
            currentUser = data.user;
            localStorage.setItem('authToken', authToken);
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            
            showNotification('Login successful!');
            setTimeout(() => {
                if (currentUser.role === 'admin') {
                    switchPage('admin-page');
                    loadAdminQueries();
                    loadAdminOrders();
                } else {
                    switchPage('dashboard-page');
                    displayUserName();
                    loadRestaurants();
                    loadUserOrders();
                    loadUserQueries();
                    loadUserProfile();
                }
            }, 1000);
        } else {
            showNotification(data.error, 'error');
        }
    } catch (error) {
        showNotification('Error: ' + error.message, 'error');
    }
}

function logout() {
    authToken = null;
    currentUser = null;
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    cart = {};
    cartTotal = 0;
    
    showNotification('Logged out successfully');
    setTimeout(() => {
        switchPage('signup-page');
        document.getElementById('signup-form').reset();
        document.getElementById('login-form').reset();
    }, 1000);
}

function displayUserName() {
    if (currentUser) {
        document.getElementById('user-name').textContent = 'Welcome, ' + currentUser.name;
    }
}

// ==================== RESTAURANTS & MENU ====================

async function loadRestaurants() {
    try {
        const response = await fetch(`${API_URL}/restaurants`);
        const restaurants = await response.json();
        
        const grid = document.getElementById('restaurants-grid');
        grid.innerHTML = '';
        
        restaurants.forEach(restaurant => {
            const card = document.createElement('div');
            card.className = 'restaurant-card';
            card.innerHTML = `
                <div class="restaurant-header">
                    <h3>${restaurant.name}</h3>
                    <p style="font-size: 14px;">${restaurant.cuisine}</p>
                </div>
                <div class="restaurant-info">
                    <p class="restaurant-rating">⭐ ${restaurant.rating}</p>
                    <p>⏱️ ${restaurant.delivery_time} mins delivery</p>
                    <p>₹${restaurant.delivery_fee} delivery fee</p>
                </div>
                <div class="restaurant-footer">
                    <button class="btn btn-primary" onclick="openMenu(${restaurant.id}, '${restaurant.name}')">
                        View Menu
                    </button>
                </div>
            `;
            grid.appendChild(card);
        });
    } catch (error) {
        showNotification('Error loading restaurants: ' + error.message, 'error');
    }
}

async function openMenu(restaurantId, restaurantName) {
    selectedRestaurantId = restaurantId;
    document.getElementById('menu-title').textContent = restaurantName + ' - Menu';
    cart = {};
    cartTotal = 0;
    
    try {
        const response = await fetch(`${API_URL}/restaurants/${restaurantId}/menu`);
        const items = await response.json();
        
        const menuDiv = document.getElementById('menu-items');
        menuDiv.innerHTML = '';
        
        items.forEach(item => {
            const card = document.createElement('div');
            card.className = 'menu-item-card';
            card.innerHTML = `
                <h4>${item.name}</h4>
                <p>${item.description}</p>
                <div class="menu-item-price">₹${item.price}</div>
                <button class="btn btn-primary" onclick="addToCart(${item.id}, '${item.name}', ${item.price})">
                    Add to Cart
                </button>
            `;
            menuDiv.appendChild(card);
        });
        
        document.getElementById('menu-modal').classList.add('active');
        updateCartDisplay();
    } catch (error) {
        showNotification('Error loading menu: ' + error.message, 'error');
    }
}

function closeMenuModal() {
    document.getElementById('menu-modal').classList.remove('active');
}

function addToCart(itemId, itemName, price) {
    if (!cart[itemId]) {
        cart[itemId] = { name: itemName, price: price, quantity: 0 };
    }
    cart[itemId].quantity++;
    cartTotal += price;
    updateCartDisplay();
    showNotification(itemName + ' added to cart!');
}

function updateCartDisplay() {
    const cartDiv = document.getElementById('cart-items');
    cartDiv.innerHTML = '';
    
    for (let itemId in cart) {
        const item = cart[itemId];
        const itemTotal = item.price * item.quantity;
        const itemDiv = document.createElement('div');
        itemDiv.className = 'cart-item';
        itemDiv.innerHTML = `
            <span>${item.name} x${item.quantity}</span>
            <span>₹${itemTotal}</span>
        `;
        cartDiv.appendChild(itemDiv);
    }
    
    document.getElementById('cart-total').textContent = cartTotal;
}

async function placeOrder() {
    const deliveryAddress = document.getElementById('delivery-address').value;
    
    if (!deliveryAddress) {
        showNotification('Please enter delivery address', 'error');
        return;
    }
    
    if (cartTotal === 0) {
        showNotification('Your cart is empty', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({
                restaurant_id: selectedRestaurantId,
                items: cart,
                total_price: cartTotal + 50,  // Adding delivery fee
                delivery_address: deliveryAddress
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showNotification('Order placed successfully! Order ID: ' + data.order_id);
            closeMenuModal();
            cart = {};
            cartTotal = 0;
            loadUserOrders();
        } else {
            showNotification(data.error, 'error');
        }
    } catch (error) {
        showNotification('Error placing order: ' + error.message, 'error');
    }
}

// ==================== ORDERS ====================

async function loadUserOrders() {
    try {
        const response = await fetch(`${API_URL}/orders/user/all`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        const orders = await response.json();
        const ordersList = document.getElementById('orders-list');
        ordersList.innerHTML = '';
        
        if (orders.length === 0) {
            ordersList.innerHTML = '<p style="text-align: center; color: #999;">No orders yet. Start ordering!</p>';
            return;
        }
        
        orders.forEach(order => {
            const orderCard = document.createElement('div');
            orderCard.className = 'order-card';
            orderCard.innerHTML = `
                <div class="order-header">
                    <span class="order-id">Order #${order.id}</span>
                    <span class="order-status ${order.status}">${order.status.toUpperCase()}</span>
                </div>
                <div class="order-details">
                    <p><strong>Restaurant ID:</strong> ${order.restaurant_id}</p>
                    <p><strong>Date:</strong> ${new Date(order.created_at).toLocaleDateString()}</p>
                    <p><strong>Address:</strong> ${order.delivery_address}</p>
                </div>
                <div class="order-price">₹${order.total_price}</div>
            `;
            ordersList.appendChild(orderCard);
        });
    } catch (error) {
        showNotification('Error loading orders: ' + error.message, 'error');
    }
}

// ==================== CUSTOMER QUERIES ====================

async function handleQuerySubmit(e) {
    e.preventDefault();
    
    const subject = document.getElementById('query-subject').value;
    const message = document.getElementById('query-message').value;
    const orderId = document.getElementById('query-order-id').value;
    
    try {
        const response = await fetch(`${API_URL}/queries`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({
                subject: subject,
                message: message,
                order_id: orderId || null
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showNotification('Query submitted successfully!');
            document.getElementById('query-form').reset();
            loadUserQueries();
        } else {
            showNotification(data.error, 'error');
        }
    } catch (error) {
        showNotification('Error submitting query: ' + error.message, 'error');
    }
}

async function loadUserQueries() {
    try {
        const response = await fetch(`${API_URL}/queries/user/all`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        const queries = await response.json();
        const queriesList = document.getElementById('queries-list');
        queriesList.innerHTML = '';
        
        if (queries.length === 0) {
            queriesList.innerHTML = '<p style="text-align: center; color: #999;">No queries submitted yet</p>';
            return;
        }
        
        queries.forEach(query => {
            const queryCard = document.createElement('div');
            queryCard.className = 'query-card';
            queryCard.innerHTML = `
                <h4>${query.subject}</h4>
                <span class="query-status ${query.status}">${query.status.toUpperCase()}</span>
                <p style="margin-top: 8px;">${query.message}</p>
                ${query.response ? `
                    <div class="query-response">
                        <strong>Admin Response:</strong><br>
                        ${query.response}
                    </div>
                ` : ''}
            `;
            queriesList.appendChild(queryCard);
        });
        
        // Populate order dropdown
        const orderSelect = document.getElementById('query-order-id');
        const existingOptions = orderSelect.querySelectorAll('option:not(:first-child)');
        existingOptions.forEach(opt => opt.remove());
    } catch (error) {
        showNotification('Error loading queries: ' + error.message, 'error');
    }
}

// ==================== PROFILE ====================

async function loadUserProfile() {
    if (currentUser) {
        document.getElementById('profile-name').textContent = currentUser.name || 'N/A';
        document.getElementById('profile-email').textContent = currentUser.email || 'N/A';
        document.getElementById('profile-phone').textContent = currentUser.phone || 'N/A';
        document.getElementById('profile-address').textContent = currentUser.address || 'Not set';
    }
}

// ==================== ADMIN FUNCTIONS ====================

async function loadAdminQueries() {
    try {
        const response = await fetch(`${API_URL}/admin/queries`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        const queries = await response.json();
        const queriesList = document.getElementById('admin-queries-list');
        queriesList.innerHTML = '';
        
        if (queries.length === 0) {
            queriesList.innerHTML = '<p style="text-align: center; color: #999;">No queries</p>';
            return;
        }
        
        queries.forEach(query => {
            const queryCard = document.createElement('div');
            queryCard.className = 'admin-query-card';
            queryCard.innerHTML = `
                <div class="admin-query-header">
                    <div class="admin-query-title">
                        <h3>${query.subject}</h3>
                        <div class="admin-query-meta">
                            <p>User ID: ${query.user_id} | Query ID: ${query.id}</p>
                            <p>Submitted: ${new Date(query.created_at).toLocaleString()}</p>
                        </div>
                    </div>
                    <span class="query-status ${query.status}">${query.status.toUpperCase()}</span>
                </div>
                <p><strong>Message:</strong> ${query.message}</p>
                <div class="admin-resolve-form">
                    <textarea id="response-${query.id}" placeholder="Write your response here..."></textarea>
                    <button class="btn btn-primary" style="width: 150px; margin-top: 10px;" onclick="resolveQuery(${query.id})">
                        Resolve Query
                    </button>
                </div>
            `;
            queriesList.appendChild(queryCard);
        });
    } catch (error) {
        showNotification('Error loading admin queries: ' + error.message, 'error');
    }
}

async function resolveQuery(queryId) {
    const response = document.getElementById('response-' + queryId).value;
    
    if (!response) {
        showNotification('Please write a response', 'error');
        return;
    }
    
    try {
        const result = await fetch(`${API_URL}/admin/queries/${queryId}/resolve`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ response: response })
        });
        
        const data = await result.json();
        
        if (result.ok) {
            showNotification('Query resolved successfully!');
            loadAdminQueries();
        } else {
            showNotification(data.error, 'error');
        }
    } catch (error) {
        showNotification('Error resolving query: ' + error.message, 'error');
    }
}

async function loadAdminOrders() {
    try {
        const response = await fetch(`${API_URL}/admin/orders`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        const orders = await response.json();
        const tbody = document.getElementById('admin-orders-tbody');
        tbody.innerHTML = '';
        
        orders.forEach(order => {
            const row = tbody.insertRow();
            row.innerHTML = `
                <td>${order.id}</td>
                <td>${order.user_id}</td>
                <td>${order.restaurant_id}</td>
                <td>₹${order.total_price}</td>
                <td><span class="order-status ${order.status}">${order.status}</span></td>
                <td>${new Date(order.created_at).toLocaleDateString()}</td>
            `;
        });
    } catch (error) {
        showNotification('Error loading orders: ' + error.message, 'error');
    }
}

async function handleAddRestaurant(e) {
    e.preventDefault();
    
    const name = document.getElementById('rest-name').value;
    const cuisine = document.getElementById('rest-cuisine').value;
    const deliveryTime = document.getElementById('rest-delivery-time').value;
    const deliveryFee = document.getElementById('rest-delivery-fee').value;
    
    try {
        const response = await fetch(`${API_URL}/admin/restaurants`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({
                name: name,
                cuisine: cuisine,
                delivery_time: deliveryTime,
                delivery_fee: deliveryFee
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showNotification('Restaurant added successfully!');
            document.getElementById('add-restaurant-form').reset();
        } else {
            showNotification(data.error, 'error');
        }
    } catch (error) {
        showNotification('Error adding restaurant: ' + error.message, 'error');
    }
}

// ==================== INIT DATABASE ====================

async function initializeDatabase() {
    try {
        const response = await fetch(`${API_URL}/init-db`, { method: 'POST' });
        const data = await response.json();
        showNotification(data.message);
    } catch (error) {
        showNotification('Error initializing database: ' + error.message, 'error');
    }
}
