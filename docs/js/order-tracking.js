const mongoose = require('mongoose');

// Define Order Schema
const orderSchema = new mongoose.Schema({
    orderId: { type: String, required: true, unique: true },
    status: { 
        type: String, 
        enum: ['processing', 'confirmed', 'shipped', 'delivered'],
        default: 'processing'
    },
    createdAt: { type: Date, default: Date.now },
    trackingNumber: String,
    items: [{
        name: String,
        price: Number,
        quantity: Number,
        size: String,
        color: String,
        image: String
    }],
    total: Number,
    shipping: {
        name: String,
        address: String,
        city: String,
        state: String,
        zip: String
    }
});

const Order = mongoose.model('Order', orderSchema);

class OrderTracker {
    constructor() {
        this.orderId = new URLSearchParams(window.location.search).get('orderId');
        this.setupEventListeners();
        if (this.orderId) {
            this.loadOrderDetails();
            this.startPolling();
        }
    }

    setupEventListeners() {
        // Add event listener for tracking number copy button
        document.addEventListener('click', (e) => {
            if (e.target.matches('.copy-tracking')) {
                this.copyTrackingNumber(e);
            }
        });
    }

    async loadOrderDetails() {
        try {
            const response = await fetch(`/api/orders/${this.orderId}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const order = await response.json();
            this.updateOrderStatus(order.status);
            this.renderOrderDetails(order);
        } catch (error) {
            console.error('Error loading order details:', error);
            this.showError('Failed to load order details. Please try again later.');
        }
    }

    updateOrderStatus(status) {
        const steps = ['processing', 'confirmed', 'shipped', 'delivered'];
        const currentIndex = steps.indexOf(status);

        steps.forEach((step, index) => {
            const element = document.querySelector(`[data-status="${step}"]`);
            if (!element) return;

            element.dataset.status = 
                index < currentIndex ? 'completed' :
                index === currentIndex ? 'current' : 'pending';
            
            // Add animation class for status change
            element.classList.add('status-update');
            setTimeout(() => element.classList.remove('status-update'), 1000);
        });
    }

    renderOrderDetails(order) {
        const orderInfo = document.getElementById('order-info');
        if (!orderInfo) return;
        
        orderInfo.innerHTML = `
            <div class="order-info">
                <div class="order-header">
                    <h2>Order #${order.orderId}</h2>
                    <span class="order-date">Placed on ${new Date(order.createdAt).toLocaleDateString()}</span>
                </div>

                <div class="status-section">
                    <h3>Order Status</h3>
                    <p class="status ${order.status}">${order.status.charAt(0).toUpperCase() + order.status.slice(1)}</p>
                    ${order.trackingNumber ? `
                        <div class="tracking-number">
                            <strong>Tracking Number:</strong> 
                            <span id="tracking-number">${order.trackingNumber}</span>
                            <button class="copy-tracking" data-tracking="${order.trackingNumber}">
                                Copy Number
                            </button>
                        </div>
                    ` : ''}
                </div>
                
                <div class="items-section">
                    <h3>Items</h3>
                    ${order.items.map(item => `
                        <div class="order-item">
                            <img src="/images/${item.image}" alt="${item.name}" width="80">
                            <div class="item-details">
                                <p class="item-name">${item.name}</p>
                                <p class="item-specs">Size: ${item.size} | Color: ${item.color}</p>
                                <p class="item-quantity">Quantity: ${item.quantity}</p>
                            </div>
                            <p class="item-price">$${(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                    `).join('')}
                    
                    <div class="order-total">
                        <strong>Total:</strong> $${order.total.toFixed(2)}
                    </div>
                </div>
                
                <div class="shipping-section">
                    <h3>Shipping Address</h3>
                    <div class="address-details">
                        <p>${order.shipping.name}</p>
                        <p>${order.shipping.address}</p>
                        <p>${order.shipping.city}, ${order.shipping.state} ${order.shipping.zip}</p>
                    </div>
                </div>
            </div>
        `;
    }

    async copyTrackingNumber(event) {
        const trackingNumber = event.target.dataset.tracking;
        try {
            await navigator.clipboard.writeText(trackingNumber);
            const button = event.target;
            button.textContent = 'Copied!';
            setTimeout(() => button.textContent = 'Copy Number', 2000);
        } catch (err) {
            console.error('Failed to copy tracking number:', err);
            this.showError('Failed to copy tracking number');
        }
    }

    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        document.body.appendChild(errorDiv);
        setTimeout(() => errorDiv.remove(), 5000);
    }

    startPolling() {
        // Poll for order updates every 30 seconds
        this.pollingInterval = setInterval(() => {
            this.loadOrderDetails();
        }, 30000);
    }

    stopPolling() {
        if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
        }
    }
}

// Initialize order tracking
const orderTracker = new OrderTracker();

// Clean up on page unload
window.addEventListener('unload', () => {
    if (orderTracker) {
        orderTracker.stopPolling();
    }
});

// Export the Order model for use in other files
module.exports = { Order, OrderTracker };
