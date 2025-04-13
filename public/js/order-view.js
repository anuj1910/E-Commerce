// Order view functionality
document.addEventListener('DOMContentLoaded', function() {
    const orderDetails = document.getElementById('order-details');
    const shippingDetails = document.getElementById('shipping-details');
    const orderItems = document.getElementById('order-items');
    const orderSubtotal = document.getElementById('order-subtotal');
    const orderTotal = document.getElementById('order-total');

    // Get order ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get('id');

    if (!orderId) {
        showAlert('No order ID provided', 'danger');
        return;
    }

    // Load order details
    async function loadOrderDetails() {
        try {
            const response = await fetch(`/api/orders/${orderId}`, {
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error('Failed to fetch order details');
            }

            const order = await response.json();
            
            // Display order information
            orderDetails.innerHTML = `
                <p><strong>Order ID:</strong> ${order._id}</p>
                <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleString()}</p>
                <p><strong>Status:</strong> <span class="badge bg-${getStatusBadgeColor(order.status)}">${order.status}</span></p>
            `;

            // Display shipping information
            shippingDetails.innerHTML = `
                <p><strong>Name:</strong> ${order.shippingAddress?.name || 'N/A'}</p>
                <p><strong>Email:</strong> ${order.shippingAddress?.email || 'N/A'}</p>
                <p><strong>Address:</strong> ${order.shippingAddress?.address || 'N/A'}</p>
                <p><strong>City:</strong> ${order.shippingAddress?.city || 'N/A'}</p>
                <p><strong>State:</strong> ${order.shippingAddress?.state || 'N/A'}</p>
                <p><strong>ZIP Code:</strong> ${order.shippingAddress?.zipCode || 'N/A'}</p>
            `;

            // Display order items and calculate totals
            let subtotal = 0;
            orderItems.innerHTML = '';
            
            if (order.items && order.items.length > 0) {
                order.items.forEach(item => {
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
            } else {
                orderItems.innerHTML = '<p class="text-muted">No items found in this order</p>';
            }

            // Update totals
            subtotal = parseFloat(subtotal.toFixed(2)) || 0;
            orderSubtotal.textContent = `₹${subtotal.toFixed(2)}`;
            orderTotal.textContent = `₹${subtotal.toFixed(2)}`;
        } catch (error) {
            console.error('Error loading order details:', error);
            showAlert('Error loading order details. Please try again.', 'danger');
        }
    }

    // Helper function to get badge color based on order status
    function getStatusBadgeColor(status) {
        switch (status.toLowerCase()) {
            case 'pending':
                return 'warning';
            case 'processing':
                return 'info';
            case 'shipped':
                return 'primary';
            case 'delivered':
                return 'success';
            case 'cancelled':
                return 'danger';
            default:
                return 'secondary';
        }
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

    // Load order details when page loads
    loadOrderDetails();
}); 