class Cart {
    constructor() {
        this.items = JSON.parse(localStorage.getItem('cart')) || [];
        this.total = 0;
        this.updateCartCount();
    }

    addItem(product, size, color) {
        const cartItem = {
            id: product.id,
            name: product.name,
            price: product.price,
            size: size,
            color: color,
            quantity: 1
        };
        
        this.items.push(cartItem);
        this.saveCart();
        this.updateCartCount();
    }

    updateCartCount() {
        const cartCount = document.querySelector('.cart-count');
        cartCount.textContent = this.items.length;
    }

    saveCart() {
        localStorage.setItem('cart', JSON.stringify(this.items));
    }
}

const cart = new Cart();