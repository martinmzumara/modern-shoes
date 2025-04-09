class ProductsManager {
    constructor() {
        this.products = [];
        this.filteredProducts = [];
        this.filters = {
            size: null,
            color: null,
            maxPrice: 300
        };
    }

    async loadProducts() {
        try {
            // Update the fetch path to be relative
            const response = await fetch('js/products.json');
            const data = await response.json();
            this.products = Object.values(data.categories)
                .flatMap(category => category.products);
            this.filteredProducts = [...this.products];
            this.renderProducts();
        } catch (error) {
            console.error('Error loading products:', error);
        }
    }

    applyFilters() {
        this.filteredProducts = this.products.filter(product => {
            const sizeMatch = !this.filters.size || product.sizes.includes(this.filters.size);
            const colorMatch = !this.filters.color || product.colors.includes(this.filters.color);
            const priceMatch = product.price <= this.filters.maxPrice;
            return sizeMatch && colorMatch && priceMatch;
        });
        this.renderProducts();
    }

    renderProducts() {
        const grid = document.getElementById('products-grid');
        grid.innerHTML = this.filteredProducts.map(product => `
            <div class="product-card" data-id="${product.id}">
                <img src="${product.images[0]}" alt="${product.name}" class="product-image">
                <div class="product-info">
                    <h3 class="product-name">${product.name}</h3>
                    <p class="product-price">$${product.price}</p>
                    <a href="product-detail.html?id=${product.id}" class="cta-button">
                        View Details
                    </a>
                </div>
            </div>
        `).join('');
    }
}

// Initialize
const productsManager = new ProductsManager();
productsManager.loadProducts();

// Event Listeners
document.querySelectorAll('.size-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        productsManager.filters.size = parseInt(e.target.dataset.size);
        productsManager.applyFilters();
    });
});

document.querySelectorAll('.color-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        productsManager.filters.color = e.target.dataset.color;
        productsManager.applyFilters();
    });
});

document.getElementById('price-range').addEventListener('input', (e) => {
    productsManager.filters.maxPrice = parseInt(e.target.value);
    document.getElementById('price-value').textContent = `$${e.target.value}`;
    productsManager.applyFilters();
});
