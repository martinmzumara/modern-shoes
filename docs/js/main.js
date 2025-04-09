document.addEventListener('DOMContentLoaded', () => {
    const shopNowBtn = document.getElementById('shop-now-btn');
    
    // Add hover animation class
    shopNowBtn.addEventListener('mouseenter', () => {
        shopNowBtn.classList.add('button-hover');
    });

    shopNowBtn.addEventListener('mouseleave', () => {
        shopNowBtn.classList.remove('button-hover');
    });

    // Optional: Smooth scroll if linking to a section on the same page
    shopNowBtn.addEventListener('click', (e) => {
        const href = shopNowBtn.getAttribute('href');
        
        // If it's an anchor link (starts with #), handle smooth scroll
        if (href.startsWith('#')) {
            e.preventDefault();
            const targetSection = document.querySelector(href);
            if (targetSection) {
                targetSection.scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }
        // Otherwise, it will navigate to the products page normally
    });
});