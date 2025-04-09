// Check authentication status
async function checkAuth() {
    try {
        const response = await $.ajax({
            url: '/api/auth/me',
            xhrFields: {
                withCredentials: true
            }
        });
        
        updateNavForLoggedInUser(response);
        return response;
    } catch (error) {
        console.error('Error checking auth status:', error);
        updateNavForLoggedOutUser();
        return null;
    }
}

// Update navigation based on auth status
function updateNavForLoggedInUser(user) {
    $('#login-nav, #register-nav').hide();
    
    // Create dropdown menu
    const dropdownHtml = `
        <li class="nav-item dropdown">
            <a class="nav-link dropdown-toggle" href="#" id="userDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                Welcome, ${user.username}
            </a>
            <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
                <li><a class="dropdown-item" href="/support.html" id="support-link"><i class="fas fa-envelope"></i> Contact Support</a></li>
                <li><hr class="dropdown-divider"></li>
                <li><a class="dropdown-item" href="#" id="logout-link"><i class="fas fa-sign-out-alt"></i> Logout</a></li>
            </ul>
        </li>
    `;
    
    // Remove existing logout nav item and dropdown if they exist
    $('#logout-nav, .nav-item.dropdown').remove();
    
    // Add the dropdown menu after the cart item
    $('.nav-item a[href="/cart.html"]').parent().after(dropdownHtml);
    
    // Update logout event listener
    $('#logout-link').on('click', function(e) {
        e.preventDefault();
        handleLogout();
    });
}

function updateNavForLoggedOutUser() {
    $('#login-nav, #register-nav').show();
    $('.nav-item.dropdown').remove();
}

// Handle login
async function handleLogin(event) {
    event.preventDefault();
    
    const email = $('#email').val();
    const password = $('#password').val();
    
    try {
        const response = await $.ajax({
            url: '/api/auth/login',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ email, password }),
            xhrFields: {
                withCredentials: true
            }
        });
        
        window.location.href = '/';
    } catch (error) {
        showAlert(error.responseJSON?.message || 'Error logging in', 'danger');
    }
}

// Password validation functions
function validatePassword(password) {
    const validations = {
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number: /[0-9]/.test(password),
        special: /[!@#$%^&*]/.test(password)
    };
    
    return {
        isValid: Object.values(validations).every(v => v),
        validations
    };
}

function updatePasswordFeedback(validations) {
    const checks = {
        'length-check': validations.length,
        'uppercase-check': validations.uppercase,
        'lowercase-check': validations.lowercase,
        'number-check': validations.number,
        'special-check': validations.special
    };

    $.each(checks, (id, isValid) => {
        const $element = $(`#${id}`);
        if ($element.length) {
            $element.css('color', isValid ? 'green' : 'red')
                .html(`${isValid ? '✓' : '✗'} ${$element.html().replace(/[✓✗] /, '')}`);
        }
    });
}

// Handle registration
async function handleRegister(event) {
    event.preventDefault();
    
    const username = $('#username').val();
    const email = $('#email').val();
    const password = $('#password').val();
    const confirmPassword = $('#confirmPassword').val();
    
    // Validate password
    const { isValid, validations } = validatePassword(password);
    updatePasswordFeedback(validations);
    
    if (!isValid) {
        showAlert('Please meet all password requirements', 'danger');
        return;
    }
    
    if (password !== confirmPassword) {
        showAlert('Passwords do not match', 'danger');
        return;
    }
    
    try {
        const response = await $.ajax({
            url: '/api/auth/register',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ username, email, password }),
            xhrFields: {
                withCredentials: true
            }
        });
        
        window.location.href = '/';
    } catch (error) {
        showAlert(error.responseJSON?.message || 'Error registering', 'danger');
    }
}

// Handle logout
async function handleLogout() {
    try {
        const response = await $.ajax({
            url: '/api/auth/logout',
            method: 'POST',
            xhrFields: {
                withCredentials: true
            }
        });
        
        window.location.href = '/';
    } catch (error) {
        showAlert('Error logging out', 'danger');
    }
}

// Show alert message
function showAlert(message, type = 'info') {
    const $alertDiv = $('<div>', {
        class: `alert alert-${type} alert-dismissible fade show`,
        html: `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `
    });
    
    $('.container').prepend($alertDiv);
    
    setTimeout(() => {
        $alertDiv.remove();
    }, 5000);
}

// Add event listeners
$(document).ready(() => {
    checkAuth();
    
    $('#login-form').on('submit', handleLogin);
    $('#register-form').on('submit', handleRegister);
    
    // Add real-time password validation
    $('#password').on('input', function() {
        const { validations } = validatePassword($(this).val());
        updatePasswordFeedback(validations);
    });
    
    $('#logout-link').on('click', function(e) {
        e.preventDefault();
        handleLogout();
    });
}); 