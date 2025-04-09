class ProductDetail {
    constructor() {
        this.product = null;
        this.mainImage = document.getElementById('main-product-image');
        this.currentImageIndex = 0;
    }

    async initialize() {
        // Get product ID from URL parameters
        const params = new URLSearchParams(window.location.search);
        const productId = params.get('id');
        
        if (!productId) {
            console.error('No product ID provided');
            return;
        }

        await this.loadProduct(productId);
        this.setupImages();
        this.setupImageControls();
    }

    async loadProduct(productId) {
        try {
            const response = await fetch('/js/products.json');
            const data = await response.json();
            
            // Find the product in any category
            this.product = Object.values(data.categories)
                .flatMap(category => category.products)
                .find(product => product.id === productId);

            if (!this.product) {
                console.error('Product not found');
                return;
            }

            this.updateProductInfo();
        } catch (error) {
            console.error('Error loading product:', error);
        }
    }

    setupImages() {
        if (!this.product || !this.product.images) return;

        // Replace thumbnail container with navigation buttons
        const imageContainer = document.querySelector('.product-images');
        imageContainer.innerHTML = `
            <div class="main-image">
                <img id="main-product-image" src="${this.product.images[0]}" alt="${this.product.name}">
            </div>
            <div class="image-navigation">
                <button class="image-nav prev" id="prev-image">
                    <i class="fas fa-chevron-left"></i>
                </button>
                <div class="image-counter">
                    <span id="current-image">1</span>/<span id="total-images">${this.product.images.length}</span>
                </div>
                <button class="image-nav next" id="next-image">
                    <i class="fas fa-chevron-right"></i>
                </button>
            </div>
        `;

        // Update mainImage reference after DOM changes
        this.mainImage = document.getElementById('main-product-image');
    }

    setupImageControls() {
        const prevButton = document.getElementById('prev-image');
        const nextButton = document.getElementById('next-image');

        prevButton.addEventListener('click', () => this.changeImage('prev'));
        nextButton.addEventListener('click', () => this.changeImage('next'));

        // Optional: Add keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') this.changeImage('prev');
            if (e.key === 'ArrowRight') this.changeImage('next');
        });
    }

    changeImage(direction) {
        const totalImages = this.product.images.length;
        
        if (direction === 'next') {
            this.currentImageIndex = (this.currentImageIndex + 1) % totalImages;
        } else {
            this.currentImageIndex = (this.currentImageIndex - 1 + totalImages) % totalImages;
        }

        this.mainImage.src = this.product.images[this.currentImageIndex];
        document.getElementById('current-image').textContent = this.currentImageIndex + 1;
    }

    updateProductInfo() {
        document.getElementById('product-name').textContent = this.product.name;
        document.getElementById('product-price').textContent = `$${this.product.price}`;
        document.getElementById('product-description').textContent = this.product.description;
    }
}

// Initialize the product detail page
const productDetail = new ProductDetail();
document.addEventListener('DOMContentLoaded', () => productDetail.initialize());
