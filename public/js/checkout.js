// Checkout form validation and processing
document.addEventListener('DOMContentLoaded', function() {
    const checkoutForm = document.getElementById('checkout-form');
    const placeOrderBtn = document.getElementById('place-order-btn');
    const orderItems = document.getElementById('order-items');
    const orderSubtotal = document.getElementById('order-subtotal');
    const orderTotal = document.getElementById('order-total');

    // Load cart items and calculate totals
    async function loadCartItems() {
        try {
            const response = await fetch('/api/cart', {
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error('Failed to fetch cart');
            }

            const cart = await response.json();
            let subtotal = 0;
            
            orderItems.innerHTML = '';
            
            if (!cart || cart.length === 0) {
                const emptyCartMessage = document.createElement('div');
                emptyCartMessage.className = 'text-center text-muted my-3';
                emptyCartMessage.innerHTML = 'Your cart is empty';
                orderItems.appendChild(emptyCartMessage);
                
                // Disable place order button when cart is empty
                placeOrderBtn.disabled = true;
                placeOrderBtn.classList.add('disabled');
            } else {
                // Enable place order button
                placeOrderBtn.disabled = false;
                placeOrderBtn.classList.remove('disabled');
                
                cart.forEach(item => {
                    if (!item.product) return;
                    
                    const price = parseFloat(item.product.price) || 0;
                    const quantity = parseInt(item.quantity) || 0;
                    const itemTotal = price * quantity;
                    subtotal += itemTotal;
                    
                    const itemElement = document.createElement('div');
                    itemElement.className = 'd-flex justify-content-between mb-2';
                    itemElement.innerHTML = `
                        <span>${item.product.name} x ${quantity}</span>
                        <span>₹${itemTotal.toFixed(2)}</span>
                    `;
                    orderItems.appendChild(itemElement);
                });
            }

            // Ensure subtotal is a valid number
            subtotal = parseFloat(subtotal.toFixed(2)) || 0;
            orderSubtotal.textContent = `₹${subtotal.toFixed(2)}`;
            orderTotal.textContent = `₹${subtotal.toFixed(2)}`;
        } catch (error) {
            console.error('Error loading cart:', error);
            const errorMessage = document.createElement('div');
            errorMessage.className = 'text-center text-danger my-3';
            errorMessage.innerHTML = 'Error loading cart. Please try again.';
            orderItems.innerHTML = '';
            orderItems.appendChild(errorMessage);
        }
    }

    // Form validation
    function validateForm() {
        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const address = document.getElementById('address').value.trim();
        const city = document.getElementById('city').value.trim();
        const state = document.getElementById('state').value.trim();
        const zip = document.getElementById('zip').value.trim();

        // Name validation (at least 2 words)
        if (!name) {
            showAlert('Please enter your full name', 'warning');
            return false;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showAlert('Please enter a valid email address', 'warning');
            return false;
        }

        // Address validation
        if (address.length < 10) {
            showAlert('Please enter a complete address', 'warning');
            return false;
        }

        // City validation
        if (!city) {
            showAlert('Please enter your city', 'warning');
            return false;
        }

        // State validation
        if (!state) {
            showAlert('Please enter your state', 'warning');
            return false;
        }

        // ZIP code validation (6 digits for Indian postal codes)
        const zipRegex = /^\d{6}$/;
        if (!zipRegex.test(zip)) {
            showAlert('Please enter a valid 6-digit ZIP code', 'warning');
            return false;
        }

        return true;
    }

    // Show alert message
    function showAlert(message, type = 'info') {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        const container = document.querySelector('.container');
        container.insertBefore(alertDiv, container.firstChild);
        
        setTimeout(() => {
            alertDiv.remove();
        }, 5000);
    }

    // Handle order submission
    async function handleOrderSubmission(event) {
        if (event) {
            event.preventDefault();
        }
        
        if (!validateForm()) return;

        const orderData = {
            items: await getCartItems(),
            shippingAddress: {
                name: document.getElementById('name').value.trim(),
                email: document.getElementById('email').value.trim(),
                address: document.getElementById('address').value.trim(),
                city: document.getElementById('city').value.trim(),
                state: document.getElementById('state').value.trim(),
                zipCode: document.getElementById('zip').value.trim()
            }
        };

        try {
            const response = await fetch('/api/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(orderData),
                credentials: 'include'
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to place order');
            }

            const order = await response.json();
            showAlert('Order placed successfully!', 'success');
            window.location.href = `/order-view.html?id=${order._id}`;
        } catch (error) {
            console.error('Error placing order:', error);
            showAlert(error.message || 'There was an error placing your order. Please try again.', 'danger');
        }
    }

    // Helper function to get cart items
    async function getCartItems() {
        try {
            const response = await fetch('/api/cart', {
                credentials: 'include'
            });
            if (!response.ok) {
                throw new Error('Failed to fetch cart items');
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching cart items:', error);
            return [];
        }
    }

    // Event listeners
    if (placeOrderBtn) {
        placeOrderBtn.addEventListener('click', handleOrderSubmission);
    }
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', handleOrderSubmission);
    }

    // Load cart items when page loads
    loadCartItems();
}); 