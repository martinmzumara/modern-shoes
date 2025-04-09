class CheckoutManager {
    constructor() {
        this.stripe = Stripe('your_publishable_key'); // Replace with your Stripe publishable key
        this.elements = this.stripe.elements();
        this.cart = JSON.parse(localStorage.getItem('cart')) || [];
        this.setupStripeElements();
        this.setupEventListeners();
        this.renderCartItems();
    }

    setupStripeElements() {
        const style = {
            base: {
                color: '#ffffff',
                fontFamily: '"Montserrat", sans-serif',
                fontSize: '16px',
                '::placeholder': {
                    color: '#aab7c4'
                }
            },
            invalid: {
                color: '#ff4444',
                iconColor: '#ff4444'
            }
        };

        this.card = this.elements.create('card', { style });
        this.card.mount('#card-element');

        this.card.addEventListener('change', (event) => {
            const displayError = document.getElementById('card-errors');
            if (event.error) {
                displayError.textContent = event.error.message;
            } else {
                displayError.textContent = '';
            }
        });
    }

    setupEventListeners() {
        const form = document.getElementById('payment-form');
        form.addEventListener('submit', async (event) => {
            event.preventDefault();
            await this.handlePayment();
        });
    }

    renderCartItems() {
        const cartContainer = document.getElementById('cart-items');
        const total = this.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

        cartContainer.innerHTML = this.cart.map(item => `
            <div class="cart-item">
                <img src="/images/${item.image}" alt="${item.name}">
                <div class="item-details">
                    <span class="item-name">${item.name}</span>
                    <span class="item-size">Size: ${item.size}</span>
                    <span class="item-color">Color: ${item.color}</span>
                    <span class="item-quantity">Quantity: ${item.quantity}</span>
                </div>
                <span class="item-price">$${(item.price * item.quantity).toFixed(2)}</span>
            </div>
        `).join('');

        document.getElementById('total-amount').textContent = `$${total.toFixed(2)}`;
    }

    async handlePayment() {
        const submitButton = document.getElementById('submit-button');
        submitButton.disabled = true;
        submitButton.textContent = 'Processing...';

        try {
            const { token, error } = await this.stripe.createToken(this.card);

            if (error) {
                const errorElement = document.getElementById('card-errors');
                errorElement.textContent = error.message;
                submitButton.disabled = false;
                submitButton.textContent = 'Pay Now';
                return;
            }

            const response = await this.processPayment(token);
            if (response.success) {
                this.handlePaymentSuccess();
            } else {
                throw new Error(response.error);
            }
        } catch (error) {
            console.error('Payment error:', error);
            const errorElement = document.getElementById('card-errors');
            errorElement.textContent = 'An error occurred while processing your payment. Please try again.';
            submitButton.disabled = false;
            submitButton.textContent = 'Pay Now';
        }
    }

    async processPayment(token) {
        const orderData = {
            token: token.id,
            amount: this.cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
            items: this.cart,
            shipping: {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                address: document.getElementById('address').value,
                city: document.getElementById('city').value,
                state: document.getElementById('state').value,
                zip: document.getElementById('zip').value
            }
        };

        const response = await fetch('/api/process-payment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(orderData)
        });

        const result = await response.json();
        if (result.success) {
            localStorage.setItem('lastOrderId', result.orderId);
        }
        return result;
    }

    handlePaymentSuccess() {
        localStorage.removeItem('cart');
        const orderId = localStorage.getItem('lastOrderId');
        window.location.href = `/order-confirmation.html?orderId=${orderId}`;
    }
}

// Initialize checkout
const checkout = new CheckoutManager();
