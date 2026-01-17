// ==================== DARK MODE TOGGLE ====================
// Check for saved dark mode preference
const savedDarkMode = localStorage.getItem('darkMode');
if (savedDarkMode === 'true') {
    document.body.classList.add('dark-mode');
}

// Dark mode toggle handler
document.addEventListener('DOMContentLoaded', () => {
    const darkModeToggle = document.getElementById('darkModeToggle');

    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            const isDarkMode = document.body.classList.contains('dark-mode');
            localStorage.setItem('darkMode', isDarkMode);
        });
    }
});

// Footer button handlers
document.addEventListener('DOMContentLoaded', () => {
    // LOGIN button in footer
    const footerLoginBtn = document.getElementById('footerLoginBtn');
    if (footerLoginBtn) {
        footerLoginBtn.addEventListener('click', function (e) {
            e.preventDefault();
            showModal('loginModal');
        });
    }

    // PRICING button in footer
    const footerPricingBtn = document.getElementById('footerPricingBtn');
    if (footerPricingBtn) {
        footerPricingBtn.addEventListener('click', function (e) {
            e.preventDefault();
            // Always reload packages when opening pricing from footer, for all users
            showAllPackagesModal();
        });
    }

    // Show all packages in the subscription modal for any user
    async function showAllPackagesModal() {
        showModal('subscriptionModal');
        document.getElementById('userSubscriptionDetails').innerHTML = '';
        document.getElementById('availablePackagesList').innerHTML = '<p style="color:#666;text-align:center;">Loading packages...</p>';
        try {
            const res = await fetch('/api/packages');
            const packages = await res.json();
            if (!Array.isArray(packages) || packages.length === 0) {
                document.getElementById('availablePackagesList').innerHTML = '<p style="color:#666;text-align:center;">No packages available.</p>';
                return;
            }
            document.getElementById('availablePackagesList').innerHTML = packages.map(pkg => `
            <div class=\"dashboard-card\" style=\"margin-bottom:18px;\">\n                <h4>${pkg.name} Package</h4>\n                <p><strong>Price:</strong> ₹${parseFloat(pkg.price).toLocaleString()}</p>\n                <p><strong>Duration:</strong> ${pkg.duration_days} days</p>\n                <p><strong>Features:</strong> ${Array.isArray(pkg.features) ? pkg.features.length : 0} items</p>\n                ${Array.isArray(pkg.features) ? `<ul style=\"margin: 10px 0; padding-left: 20px;\">${pkg.features.map(f => `<li>${f}</li>`).join('')}</ul>` : ''}\n                <span class=\"admin-badge ${pkg.is_active ? 'active' : 'inactive'}\">${pkg.is_active ? 'Active' : 'Inactive'}</span>\n            </div>`).join('');
        } catch (error) {
            document.getElementById('availablePackagesList').innerHTML = `<p style='color:red;text-align:center;'>Failed to load packages.</p>`;
        }
    }

    // PORTFOLIO button in footer
    const footerPortfolioBtn = document.getElementById('footerPortfolioBtn');
    if (footerPortfolioBtn) {
        footerPortfolioBtn.addEventListener('click', function (e) {
            e.preventDefault();
            handlePortfolioClick();
        });
    }
});
// Show all packages directly in dashboard
const dashboardViewPackagesBtn = document.getElementById('dashboardViewPackagesBtn');
if (dashboardViewPackagesBtn) {
    dashboardViewPackagesBtn.addEventListener('click', async () => {
        const list = document.getElementById('dashboardPackagesList');
        if (list) {
            list.innerHTML = '<p style="color:#666;text-align:center;">Loading packages...</p>';
            try {
                const res = await fetch('/api/packages');
                const packages = await res.json();
                if (!Array.isArray(packages) || packages.length === 0) {
                    list.innerHTML = '<p style="color:#666;text-align:center;">No packages available.</p>';
                } else {
                    list.innerHTML = packages.map(pkg => `
                        <div class="dashboard-card" style="margin-bottom:18px;">
                            <h4 style="color:var(--primary-red);margin-bottom:8px;">${pkg.name}</h4>
                            <div style="font-weight:700;font-size:18px;margin-bottom:8px;">₹${parseFloat(pkg.price).toLocaleString()} <span style="font-weight:400;font-size:14px;">+GST</span></div>
                            <div style="margin-bottom:8px;">${pkg.description || ''}</div>
                            <ul style="margin:0 0 8px 18px;padding:0;">${Array.isArray(pkg.features) ? pkg.features.map(f => `<li>${f}</li>`).join('') : ''}</ul>
                        </div>
                    `).join('');
                }
            } catch (err) {
                list.innerHTML = `<p style='color:red;text-align:center;'>Failed to load packages.</p>`;
            }
        }
    });
}
// Mobile Navigation Toggle
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');

if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        hamburger.classList.toggle('active');
    });

    // Close mobile menu when clicking a link
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            hamburger.classList.remove('active');
        });
    });
}

// Smooth Scrolling for all anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href === '#' || !href || href === '#!') return; // Skip empty anchors

        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
            const offsetTop = target.offsetTop - 80;
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

// Navbar scroll effect
let lastScroll = 0;
const navbar = document.querySelector('.navbar');

if (navbar) {
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;

        if (currentScroll > 100) {
            navbar.style.boxShadow = '0 2px 20px rgba(0,0,0,0.15)';
        } else {
            navbar.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
        }

        lastScroll = currentScroll;
    });
}

// Form Submission Handler
const contactForm = document.querySelector('#contactForm');

if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Get form values
        const formData = {
            fullName: contactForm.querySelector('input[name="fullName"]').value,
            email: contactForm.querySelector('input[name="email"]').value,
            mobile: contactForm.querySelector('input[name="mobile"]').value,
            service: contactForm.querySelector('select[name="service"]').value,
            message: contactForm.querySelector('textarea[name="message"]').value
        };

        try {
            await apiCall('/contact/submit', 'POST', formData);

            console.log('Contact form submitted:', formData);

            // Show success message
            alert('Thank you for reaching out! We will get back to you within 24 hours.');

            // Reset form
            contactForm.reset();
        } catch (error) {
            alert(error.message || 'Failed to submit form. Please try again.');
        }
    });
}

// ==================== AUTHENTICATION SYSTEM ====================
// ==================== DYNAMIC PRICING SECTION ====================
async function renderDynamicPricing() {
    const grid = document.getElementById('dynamicPricingGrid');
    if (!grid) return;
    try {
        const res = await fetch('/api/packages');
        const packages = await res.json();
        if (!Array.isArray(packages) || packages.length === 0) {
            grid.innerHTML = '<p style="color:#666;text-align:center;">No packages available.</p>';
            return;
        }
        grid.innerHTML = packages.map((pkg, index) => `
            <div class="pricing-card">
                ${index === 1 ? '<div class="ribbon">Most Popular</div>' : ''}
                <div class="pricing-header">
                    <p class="package-label">${pkg.description || ''}</p>
                    <p class="package-type">${pkg.name}</p>
                </div>
                <div class="pricing-price">
                    <span class="currency">₹</span>${parseFloat(pkg.price).toLocaleString()} <span class="period">+GST</span>
                </div>
                <ul class="pricing-features">
                    ${Array.isArray(pkg.features) ? pkg.features.map(f => `<li>${f}</li>`).join('') : ''}
                </ul>
                <a href="#contact" class="pricing-btn purchase-package" data-package="${pkg.name}" data-price="${pkg.price}">PURCHASE NOW <span class="arrow">→</span></a>
            </div>
        `).join('');
        // Re-attach purchase button listeners
        attachPurchaseButtonListeners();
    } catch (error) {
        grid.innerHTML = `<p style='color:red;text-align:center;'>Failed to load packages.</p>`;
    }
}

function attachPurchaseButtonListeners() {
    const purchaseButtons = document.querySelectorAll('.purchase-package');
    purchaseButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const currentUser = JSON.parse(localStorage.getItem('currentUser'));
            if (!currentUser) {
                alert('Please login to purchase a subscription package.');
                showModal('loginModal');
                return;
            }
            const packageName = btn.getAttribute('data-package');
            const packagePrice = btn.getAttribute('data-price');
            showPaymentModal(packageName, packagePrice);
        });
    });
}

// Call dynamic pricing render on DOMContentLoaded
document.addEventListener('DOMContentLoaded', renderDynamicPricing);
// Show/hide admin logout button based on admin login
function setAdminAdminPanelVisible(isVisible) {
    const panelBtn = document.getElementById('adminPanelBtn');
    const logoutBtn = document.getElementById('adminLogoutBtn');
    if (panelBtn) panelBtn.style.display = isVisible ? 'inline-block' : 'none';
    if (logoutBtn) logoutBtn.style.display = isVisible ? 'inline-block' : 'none';
}

// Call setAdminAdminPanelVisible(true) after successful admin login
// Call setAdminAdminPanelVisible(false) after admin logout

document.getElementById('adminLogoutBtn')?.addEventListener('click', function () {
    // Clear admin session (implement as needed)
    setAdminAdminPanelVisible(false);
    // Optionally redirect or show login modal
    alert('Admin logged out!');
    window.location.hash = '#home';
});

// API Base URL
const API_URL = '/api';

// Helper function for API calls
async function apiCall(endpoint, method = 'GET', data = null) {
    // Use adminToken for admin endpoints, else use authToken
    let token = null;
    if (endpoint.startsWith('/admin')) {
        token = localStorage.getItem('adminToken');
    } else {
        token = localStorage.getItem('authToken');
    }

    const options = {
        method: method,
        headers: {
            'Content-Type': 'application/json'
        }
    };

    if (token) {
        options.headers['Authorization'] = `Bearer ${token}`;
    }

    if (data && method !== 'GET') {
        options.body = JSON.stringify(data);
    }

    try {
        const response = await fetch(`${API_URL}${endpoint}`, options);
        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || 'Request failed');
        }

        return result;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// Check login status on page load
document.addEventListener('DOMContentLoaded', () => {
    checkLoginStatus();
    initializeAuthSystem();
    loadRazorpayScript();
});

// Load Razorpay script
function loadRazorpayScript() {
    if (document.querySelector('script[src*="razorpay"]')) {
        return; // Already loaded
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
}

async function checkLoginStatus() {
    const token = localStorage.getItem('authToken');
    const adminToken = localStorage.getItem('adminToken');
    const loginBtn = document.getElementById('loginBtn');
    const adminBtn = document.getElementById('adminBtn');
    const userMenu = document.getElementById('userMenu');

    if (adminToken) {
        // Admin is logged in
        loginBtn.style.display = 'none';
        adminBtn.style.display = 'none';
        userMenu.style.display = 'none';
        document.getElementById('adminPanelBtn').style.display = 'inline-block';
        document.getElementById('adminLogoutBtn').style.display = 'inline-block';
        // Show admin panel modal if just logged in or hash is #adminPanel
        if (window.location.hash === '#adminPanel' || !window._adminPanelShown) {
            showModal('adminPanelModal');
            await loadAdminData();
            window._adminPanelShown = true;
        }
    } else if (token) {
        // User is logged in
        try {
            const userData = await apiCall('/user/profile');
            localStorage.setItem('currentUser', JSON.stringify(userData));

            loginBtn.style.display = 'none';
            adminBtn.style.display = 'block';
            userMenu.style.display = 'block';
            document.getElementById('userName').textContent = userData.full_name.split(' ')[0];
            document.getElementById('adminPanelBtn').style.display = 'none';
            document.getElementById('adminLogoutBtn').style.display = 'none';
            window._adminPanelShown = false;
            updateDashboardInfo(userData);
        } catch (error) {
            // Token invalid, clear and logout
            localStorage.removeItem('authToken');
            localStorage.removeItem('currentUser');
            checkLoginStatus();
        }
    } else {
        // No one is logged in
        loginBtn.style.display = 'block';
        adminBtn.style.display = 'block';
        userMenu.style.display = 'none';
        document.getElementById('adminPanelBtn').style.display = 'none';
        document.getElementById('adminLogoutBtn').style.display = 'none';
        window._adminPanelShown = false;
    }
}

function updateDashboardInfo(user) {
    document.getElementById('dashName').textContent = user.full_name;
    document.getElementById('dashEmail').textContent = user.email;
    document.getElementById('dashMobile').textContent = user.mobile;

    if (user.package_name && user.subscription_status === 'active') {
        document.getElementById('dashPackage').textContent = user.package_name;
        document.getElementById('dashStatus').textContent = 'Active';
        document.getElementById('dashStatus').className = 'status-badge active';
        document.getElementById('dashValidity').textContent = new Date(user.valid_until).toLocaleDateString();
    } else {
        document.getElementById('dashPackage').textContent = 'No Active Subscription';
        document.getElementById('dashStatus').textContent = 'Inactive';
        document.getElementById('dashStatus').className = 'status-badge inactive';
        document.getElementById('dashValidity').textContent = '-';
    }
}

function initializeAuthSystem() {
    // Modal controls
    const modals = document.querySelectorAll('.modal');
    const closeBtns = document.querySelectorAll('.close-modal');

    // Close modal when clicking X
    closeBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            const modalId = this.getAttribute('data-modal');
            closeModal(modalId);
        });
    });

    // Close modal when clicking outside
    modals.forEach(modal => {
        modal.addEventListener('click', function (e) {
            if (e.target === this) {
                closeModal(this.id);
            }
        });
    });

    // Login button click
    document.getElementById('loginBtn')?.addEventListener('click', (e) => {
        e.preventDefault();
        showModal('loginModal');
    });

    // Admin button click
    document.getElementById('adminBtn')?.addEventListener('click', (e) => {
        e.preventDefault();
        showModal('adminLoginModal');
    });
    // Admin Panel button click (only for admins)
    document.getElementById('adminPanelBtn')?.addEventListener('click', (e) => {
        e.preventDefault();
        if (localStorage.getItem('adminToken')) {
            window.location.hash = '#adminPanel';
            showModal('adminPanelModal');
            loadAdminData();
        }
    });
    // Admin Logout button click
    document.getElementById('adminLogoutBtn')?.addEventListener('click', (e) => {
        e.preventDefault();
        adminLogout();
    });

    // Portfolio link click
    document.getElementById('portfolioLink')?.addEventListener('click', (e) => {
        e.preventDefault();
        handlePortfolioClick();
    });

    // Forgot password link
    document.getElementById('forgotPasswordLink')?.addEventListener('click', (e) => {
        e.preventDefault();
        closeModal('loginModal');
        showModal('forgotPasswordModal');
    });

    // Switch between login and register
    document.getElementById('showRegisterModal')?.addEventListener('click', (e) => {
        e.preventDefault();
        closeModal('loginModal');
        showModal('registerModal');
    });

    document.getElementById('showLoginModal')?.addEventListener('click', (e) => {
        e.preventDefault();
        closeModal('registerModal');
        showModal('loginModal');
    });

    // Dashboard link
    document.getElementById('dashboardLink')?.addEventListener('click', (e) => {
        e.preventDefault();
        showModal('dashboardModal');
    });
    // Profile link
    document.getElementById('profileLink')?.addEventListener('click', (e) => {
        e.preventDefault();
        showUserProfile();
    });
    // Subscription link
    document.getElementById('subscriptionLink')?.addEventListener('click', (e) => {
        e.preventDefault();
        showUserSubscription();
    });
    // Logout button
    document.getElementById('logoutBtn')?.addEventListener('click', (e) => {
        e.preventDefault();
        logout();
    });
    // Login form submission
    document.getElementById('loginForm')?.addEventListener('submit', handleLogin);
    // Register form submission
    document.getElementById('registerForm')?.addEventListener('submit', handleRegister);
    // Admin login form submission
    document.getElementById('adminLoginForm')?.addEventListener('submit', handleAdminLogin);

    // Show user profile modal and fill details
    function showUserProfile() {
        const user = JSON.parse(localStorage.getItem('currentUser'));
        if (!user) return;
        const html = `
            <div class="dashboard-card">
                <h3>Personal Details</h3>
                <p><strong>Name:</strong> ${user.full_name}</p>
                <p><strong>Email:</strong> ${user.email}</p>
                <p><strong>Mobile:</strong> ${user.mobile}</p>
                <p><strong>Email Verified:</strong> ${user.email_verified ? 'Yes' : 'No'}</p>
            </div>
        `;
        document.getElementById('profileDetails').innerHTML = html;
        showModal('profileModal');
    }

    // Show user subscription modal and fill details
    async function showUserSubscription() {
        const user = JSON.parse(localStorage.getItem('currentUser'));
        if (!user) return;
        // Always show modal first and clear previous list
        showModal('subscriptionModal');
        document.getElementById('availablePackagesList').innerHTML = '<p style="color:#666;text-align:center;">Loading packages...</p>';
        // User's current subscription
        let subHtml = `<div class="dashboard-card">
        <h3>Current Subscription</h3>
        <p><strong>Package:</strong> ${user.package_name || 'No Active Subscription'}</p>
        <p><strong>Status:</strong> <span class="status-badge ${user.subscription_status === 'active' ? 'active' : 'inactive'}">${user.subscription_status ? user.subscription_status.charAt(0).toUpperCase() + user.subscription_status.slice(1) : 'Inactive'}</span></p>
        <p><strong>Valid Until:</strong> ${user.valid_until ? new Date(user.valid_until).toLocaleDateString() : '-'}</p>
    </div>`;
        document.getElementById('userSubscriptionDetails').innerHTML = subHtml;
        // Fetch all available packages
        try {
            const res = await fetch('/api/packages');
            const packages = await res.json();
            if (!Array.isArray(packages) || packages.length === 0) {
                document.getElementById('availablePackagesList').innerHTML = '<p style="color:#666;text-align:center;">No packages available.</p>';
                return;
            }
            document.getElementById('availablePackagesList').innerHTML = packages.map(pkg => `
            <div class="dashboard-card" style="margin-bottom:18px;">
                <h4>${pkg.name} Package</h4>
                <p><strong>Price:</strong> ₹${parseFloat(pkg.price).toLocaleString()}</p>
                <p><strong>Duration:</strong> ${pkg.duration_days} days</p>
                <p><strong>Features:</strong> ${Array.isArray(pkg.features) ? pkg.features.length : 0} items</p>
                ${Array.isArray(pkg.features) ? `<ul style="margin: 10px 0; padding-left: 20px;">${pkg.features.map(f => `<li>${f}</li>`).join('')}</ul>` : ''}
                <span class="admin-badge ${pkg.is_active ? 'active' : 'inactive'}">${pkg.is_active ? 'Active' : 'Inactive'}</span>
            </div>
        `).join('');
        } catch (error) {
            document.getElementById('availablePackagesList').innerHTML = `<p style='color:red;text-align:center;'>Failed to load packages.</p>`;
        }
    }

    // Forgot password form submission
    document.getElementById('forgotPasswordForm')?.addEventListener('submit', handleForgotPassword);

    // Email verification form submission
    document.getElementById('verificationForm')?.addEventListener('submit', handleEmailVerification);

    // Resend verification code
    document.getElementById('resendCodeLink')?.addEventListener('click', (e) => {
        e.preventDefault();
        resendVerificationCode();
    });

    // Portfolio access control for portfolio section links
    // Do not override portfolio-btn click behavior; allow anchor tags to work normally

    // Purchase package buttons
    const purchaseButtons = document.querySelectorAll('.purchase-package');
    purchaseButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const currentUser = JSON.parse(localStorage.getItem('currentUser'));

            if (!currentUser) {
                alert('Please login to purchase a subscription package.');
                showModal('loginModal');
                return;
            }

            const packageName = btn.getAttribute('data-package');
            const packagePrice = btn.getAttribute('data-price');

            showPaymentModal(packageName, packagePrice);
        });
    });
}

// Portfolio click handler (used in navbar and footer)
function handlePortfolioClick() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        showModal('portfolioAccessModal');
    } else {
        window.open('https://www.behance.net/satyamsharma66', '_blank');
    }
}

// Helper: Show login required notification/modal
function showLoginRequired(message = 'Log in first to view this.') {
    alert(message);
    showModal('loginModal');
}

// Enforce login for all protected actions
document.addEventListener('DOMContentLoaded', () => {
    // Protect all .portfolio-btn and .portfolio-btn, .portfolio-btn, .portfolio-grid .portfolio-btn
    document.querySelectorAll('.portfolio-btn').forEach(btn => {
        btn.addEventListener('click', function (e) {
            const currentUser = JSON.parse(localStorage.getItem('currentUser'));
            if (!currentUser) {
                e.preventDefault();
                showLoginRequired('Log in first to view the portfolio.');
            }
        });
    });

    // Protect all .purchase-package (dynamic pricing section)
    document.querySelectorAll('.purchase-package').forEach(btn => {
        btn.addEventListener('click', function (e) {
            const currentUser = JSON.parse(localStorage.getItem('currentUser'));
            if (!currentUser) {
                e.preventDefault();
                showLoginRequired('Log in first to purchase a package.');
            }
        });
    });

    // Protect all .info-btn (GET MORE INFO)
    document.querySelectorAll('.info-btn').forEach(btn => {
        btn.addEventListener('click', function (e) {
            const currentUser = JSON.parse(localStorage.getItem('currentUser'));
            if (!currentUser) {
                e.preventDefault();
                showLoginRequired('Log in first to get more info.');
            }
        });
    });

    // Protect all .service-btn (MORE INFO in services)
    document.querySelectorAll('.service-btn').forEach(btn => {
        btn.addEventListener('click', function (e) {
            const currentUser = JSON.parse(localStorage.getItem('currentUser'));
            if (!currentUser) {
                e.preventDefault();
                showLoginRequired('Log in first to get more info.');
            }
        });
    });

    // Protect Get In Touch (footer-cta and contact section)
    document.querySelectorAll('.cta-btn, .submit-btn').forEach(btn => {
        btn.addEventListener('click', function (e) {
            // Only protect if it's a button that leads to contact or get in touch
            if (btn.textContent.toLowerCase().includes('get in touch')) {
                const currentUser = JSON.parse(localStorage.getItem('currentUser'));
                if (!currentUser) {
                    e.preventDefault();
                    showLoginRequired('Log in first to get in touch.');
                }
            }
        });
    });

    // Protect Meet Our Team (about.html)
    if (window.location.pathname.endsWith('about.html')) {
        const teamBtn = document.querySelector('.meet-team-btn');
        if (teamBtn) {
            teamBtn.addEventListener('click', function (e) {
                const currentUser = JSON.parse(localStorage.getItem('currentUser'));
                if (!currentUser) {
                    e.preventDefault();
                    showLoginRequired('Log in first to view our team.');
                } else {
                    // You can show a modal or redirect to a team page if needed
                    alert('Team details coming soon!');
                }
            });
        }
    }
});

function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
}

async function handleLogin(e) {
    e.preventDefault();

    const email = e.target.querySelector('input[name="email"]').value;
    const password = e.target.querySelector('input[name="password"]').value;

    try {
        const result = await apiCall('/auth/login', 'POST', { email, password });

        localStorage.setItem('authToken', result.token);
        localStorage.setItem('currentUser', JSON.stringify(result.user));

        closeModal('loginModal');
        await checkLoginStatus();
        alert(`Welcome back, ${result.user.fullName}!`);
        e.target.reset();
    } catch (error) {
        alert(error.message || 'Login failed. Please try again.');
    }
}

async function handleRegister(e) {
    e.preventDefault();

    const formData = {
        fullName: e.target.querySelector('input[name="fullName"]').value,
        email: e.target.querySelector('input[name="email"]').value,
        mobile: e.target.querySelector('input[name="mobile"]').value,
        password: e.target.querySelector('input[name="password"]').value,
        confirmPassword: e.target.querySelector('input[name="confirmPassword"]').value
    };

    // Validate mobile number (10-15 digits only)
    const mobileRegex = /^[0-9]{10,15}$/;
    if (!mobileRegex.test(formData.mobile)) {
        alert('Please enter a valid mobile number (10-15 digits only, no spaces or special characters)');
        return;
    }

    // Validate password match
    if (formData.password !== formData.confirmPassword) {
        alert('Passwords do not match!');
        return;
    }

    // Validate password strength
    if (formData.password.length < 8) {
        alert('Password must be at least 8 characters long!');
        return;
    }

    try {
        const result = await apiCall('/auth/register', 'POST', formData);

        // Store email for verification
        localStorage.setItem('pendingEmail', formData.email);

        closeModal('registerModal');
        document.getElementById('verificationEmail').textContent = formData.email;
        showModal('emailVerificationModal');

        alert(`Registration successful! Verification code: ${result.verificationCode} (Check your email)`);
        e.target.reset();
    } catch (error) {
        alert(error.message || 'Registration failed. Please try again.');
    }
}

async function handleEmailVerification(e) {
    e.preventDefault();

    const enteredCode = e.target.querySelector('input[name="verificationCode"]').value;
    const email = localStorage.getItem('pendingEmail');

    if (!email) {
        alert('No pending registration found. Please register again.');
        closeModal('emailVerificationModal');
        return;
    }

    try {
        const result = await apiCall('/auth/verify-email', 'POST', {
            email: email,
            verificationCode: enteredCode
        });

        localStorage.setItem('authToken', result.token);
        localStorage.setItem('currentUser', JSON.stringify(result.user));
        localStorage.removeItem('pendingEmail');

        closeModal('emailVerificationModal');
        await checkLoginStatus();
        alert(`Email verified successfully! Welcome, ${result.user.fullName}!`);
        e.target.reset();
    } catch (error) {
        alert(error.message || 'Verification failed. Please try again.');
    }
}

async function resendVerificationCode() {
    const email = localStorage.getItem('pendingEmail');

    if (!email) {
        alert('No pending registration found.');
        return;
    }

    try {
        const result = await apiCall('/auth/resend-code', 'POST', { email });
        alert(`New verification code sent! Code: ${result.verificationCode} (Check your email)`);
    } catch (error) {
        alert(error.message || 'Failed to resend code.');
    }
}

function logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    checkLoginStatus();
    alert('You have been logged out successfully.');
    window.location.hash = 'home';
}

function showPaymentModal(packageName, packagePrice) {
    const basePrice = parseInt(packagePrice);
    const gst = Math.round(basePrice * 0.18);
    const total = basePrice + gst;

    document.getElementById('paymentPackage').textContent = packageName;
    document.getElementById('paymentPrice').textContent = `₹${basePrice.toLocaleString()}`;
    document.getElementById('paymentGST').textContent = `₹${gst.toLocaleString()}`;
    document.getElementById('paymentTotal').textContent = `₹${total.toLocaleString()}`;

    // Store package info for payment processing
    window.currentPackage = { packageName, basePrice, gst, total };

    showModal('paymentModal');
}

// Load Razorpay script
function loadRazorpayScript() {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
}

async function initiatePayment(gateway) {
    const token = localStorage.getItem('authToken');
    const packageInfo = window.currentPackage;

    if (!token || !packageInfo) {
        alert('Please login to purchase a subscription.');
        return;
    }

    try {
        // Create Razorpay order
        const orderData = await apiCall('/payment/create-order', 'POST', {
            packageName: packageInfo.packageName,
            amount: packageInfo.total
        });

        closeModal('paymentModal');

        // Razorpay options
        const options = {
            key: orderData.keyId,
            amount: orderData.amount,
            currency: orderData.currency,
            name: 'SatAns',
            description: `${packageInfo.packageName} Package`,
            order_id: orderData.orderId,
            handler: async function (response) {
                // Payment successful
                await verifyPayment(response, packageInfo);
            },
            prefill: {
                email: JSON.parse(localStorage.getItem('currentUser')).email,
                contact: JSON.parse(localStorage.getItem('currentUser')).mobile
            },
            theme: {
                color: '#E84855'
            },
            modal: {
                ondismiss: function () {
                    showModal('paymentModal');
                }
            }
        };

        const rzp = new Razorpay(options);

        rzp.on('payment.failed', function (response) {
            document.getElementById('paymentErrorMsg').textContent = response.error.description;
            showModal('paymentFailedModal');
        });

        rzp.open();

    } catch (error) {
        alert(error.message || 'Failed to initiate payment.');
        showModal('paymentModal');
    }
}

async function verifyPayment(response, packageInfo) {
    try {
        const result = await apiCall('/payment/verify', 'POST', {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            packageName: packageInfo.packageName,
            amount: packageInfo.total
        });

        // Update local user data
        const userData = await apiCall('/user/profile');
        localStorage.setItem('currentUser', JSON.stringify(userData));
        updateDashboardInfo(userData);

        // Show success modal with receipt
        document.getElementById('receiptTxnId').textContent = response.razorpay_payment_id;
        document.getElementById('receiptPackage').textContent = packageInfo.packageName;
        document.getElementById('receiptAmount').textContent = `₹${packageInfo.total.toLocaleString()}`;
        document.getElementById('receiptDate').textContent = new Date().toLocaleString();

        window.currentReceipt = {
            transactionId: response.razorpay_payment_id,
            packageName: packageInfo.packageName,
            amount: packageInfo.total
        };

        showModal('paymentSuccessModal');

    } catch (error) {
        document.getElementById('paymentErrorMsg').textContent = error.message;
        showModal('paymentFailedModal');
    }
}

async function downloadReceipt() {
    const receipt = window.currentReceipt;
    if (!receipt) {
        alert('No receipt available.');
        return;
    }

    try {
        const receiptData = await apiCall(`/payment/receipt/${receipt.transactionId}`);

        const receiptContent = `
PAYMENT RECEIPT
=====================================

Transaction ID: ${receiptData.transaction_id}
Date: ${new Date(receiptData.payment_date).toLocaleString()}

Customer Details:
Name: ${receiptData.full_name}
Email: ${receiptData.email}

Package Details:
Package: ${receiptData.package_name}
Amount: ₹${receiptData.amount.toLocaleString()}
Payment Gateway: ${receiptData.payment_gateway}

Payment Status: SUCCESS

Thank you for your business!
SatAns - Real World Designer
=====================================
        `;

        const blob = new Blob([receiptContent], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Receipt_${receiptData.transaction_id}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        alert('Receipt downloaded successfully!');
    } catch (error) {
        alert('Failed to download receipt.');
    }
}

async function handleForgotPassword(e) {
    e.preventDefault();

    const email = e.target.querySelector('input[name="email"]').value;

    try {
        await apiCall('/auth/forgot-password', 'POST', { email });
        alert('Password reset link has been sent to your email.');
        closeModal('forgotPasswordModal');
        e.target.reset();
    } catch (error) {
        alert(error.message || 'Failed to process request.');
    }
}

async function handleAdminLogin(e) {
    e.preventDefault();

    const email = e.target.querySelector('input[name="email"]').value;
    const password = e.target.querySelector('input[name="password"]').value;

    try {
        const result = await apiCall('/auth/admin-login', 'POST', { email, password });

        localStorage.setItem('adminToken', result.token);
        closeModal('adminLoginModal');
        await checkLoginStatus();
        e.target.reset();
    } catch (error) {
        alert(error.message || 'Invalid admin credentials!');
    }
}

function adminLogout() {
    localStorage.removeItem('adminToken');
    closeModal('adminPanelModal');
    // Restore login/admin options
    document.getElementById('loginBtn').style.display = 'block';
    document.getElementById('adminBtn').style.display = 'block';
    document.getElementById('userMenu').style.display = 'none';
    document.getElementById('adminPanelBtn').style.display = 'none';
    document.getElementById('adminLogoutBtn').style.display = 'none';
    window._adminPanelShown = false;
    alert('Admin logged out successfully.');
    window.location.hash = '#home';
}

async function loadAdminData() {
    await loadAdminUsers();
    await loadAdminSubscriptions();
    await loadAdminContacts();
    await loadAdminPackages();
    await loadAdminPortfolio();
}

async function loadAdminUsers() {
    const container = document.getElementById('adminUsersList');
    try {
        const users = await apiCall('/admin/users');
        if (users.length === 0) {
            container.innerHTML = '<p style="color: #666; text-align: center; padding: 20px;">No registered users yet.</p>';
            return;
        }
        container.innerHTML = users.map(user => `
            <div class="admin-list-item">
                <h4>${user.full_name}</h4>
                <p><strong>Email:</strong> ${user.email}</p>
                <p><strong>Mobile:</strong> ${user.mobile}</p>
                <p><strong>Registered:</strong> ${new Date(user.created_at).toLocaleDateString()}</p>
                <div class="item-meta">
                    <span class="admin-badge ${user.email_verified ? 'active' : 'inactive'}">${user.email_verified ? '✓ Verified' : '✗ Not Verified'}</span>
                    <span class="admin-badge ${user.subscription_status === 'active' ? 'active' : 'inactive'}">${user.subscription_status === 'active' ? 'Subscribed' : 'No Subscription'}</span>
                </div>
            </div>
        `).join('');
    } catch (error) {
        container.innerHTML = `<p style='color: red; text-align: center; padding: 20px;'>Failed to load users: ${error.message || error}</p>`;
        console.error('Failed to load users:', error);
    }
}

async function loadAdminSubscriptions() {
    try {
        const subscriptions = await apiCall('/admin/subscriptions');
        const container = document.getElementById('adminSubscriptionsList');

        if (subscriptions.length === 0) {
            container.innerHTML = '<p style="color: #666; text-align: center; padding: 20px;">No active subscriptions.</p>';
            return;
        }

        container.innerHTML = subscriptions.map(sub => `
            <div class="admin-list-item">
                <h4>${sub.full_name}</h4>
                <p><strong>Email:</strong> ${sub.email}</p>
                <p><strong>Package:</strong> ${sub.package_name}</p>
                <p><strong>Amount:</strong> ₹${parseFloat(sub.amount).toLocaleString()}</p>
                <p><strong>Start Date:</strong> ${new Date(sub.start_date).toLocaleDateString()}</p>
                <p><strong>Valid Until:</strong> ${new Date(sub.valid_until).toLocaleDateString()}</p>
                <p><strong>Transaction ID:</strong> ${sub.transaction_id || 'N/A'}</p>
                <div class="item-meta">
                    <span class="admin-badge active">Active</span>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Failed to load subscriptions:', error);
    }
}

async function loadAdminContacts() {
    try {
        const submissions = await apiCall('/admin/contacts');
        const container = document.getElementById('adminContactsList');

        if (submissions.length === 0) {
            container.innerHTML = '<p style="color: #666; text-align: center; padding: 20px;">No contact form submissions yet.</p>';
            return;
        }

        container.innerHTML = submissions.map(contact => `
            <div class="admin-list-item">
                <h4>${contact.full_name}</h4>
                <p><strong>Email:</strong> ${contact.email}</p>
                <p><strong>Mobile:</strong> ${contact.mobile}</p>
                <p><strong>Service:</strong> ${contact.service}</p>
                <p><strong>Message:</strong> ${contact.message}</p>
                <p><strong>Submitted:</strong> ${new Date(contact.submitted_at).toLocaleString()}</p>
                <div class="item-meta">
                    <span class="admin-badge ${contact.status === 'pending' ? 'pending' : contact.status === 'contacted' ? 'active' : 'inactive'}">${contact.status}</span>
                    ${contact.status === 'pending' ? `<button onclick="updateContactStatus(${contact.id}, 'contacted')" style="margin-left: 10px; padding: 5px 15px; background: #E84855; color: white; border: none; border-radius: 5px; cursor: pointer;">Mark as Contacted</button>` : ''}
                    ${contact.status === 'contacted' ? `<button onclick="updateContactStatus(${contact.id}, 'resolved')" style="margin-left: 10px; padding: 5px 15px; background: #28a745; color: white; border: none; border-radius: 5px; cursor: pointer;">Mark as Resolved</button>` : ''}
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Failed to load contacts:', error);
    }
}

async function loadAdminPackages() {
    const container = document.getElementById('adminPackagesList');
    try {
        const packages = await apiCall('/admin/packages');
        if (packages.length === 0) {
            container.innerHTML = '<p style="color: #666; text-align: center; padding: 20px;">No packages found.</p>';
            return;
        }
        container.innerHTML = packages.map(pkg => `
            <div class="admin-list-item">
                <h4>${pkg.name} Package</h4>
                <p><strong>Price:</strong> ₹${parseFloat(pkg.price).toLocaleString()}</p>
                <p><strong>Duration:</strong> ${pkg.duration_days} days</p>
                <p><strong>Features:</strong> ${pkg.features ? pkg.features.length : 0} items</p>
                ${pkg.features ? `<ul style="margin: 10px 0; padding-left: 20px;">${pkg.features.map(f => `<li>${f}</li>`).join('')}</ul>` : ''}
                <div class="item-meta">
                    <span class="admin-badge ${pkg.is_active ? 'active' : 'inactive'}">${pkg.is_active ? 'Active' : 'Inactive'}</span>
                    <button onclick="editPackage(${pkg.id})" style="margin-left: 10px; padding: 5px 15px; background: #E84855; color: white; border: none; border-radius: 5px; cursor: pointer;">Edit</button>
                    <button onclick="deletePackage(${pkg.id})" style="margin-left: 5px; padding: 5px 15px; background: #333; color: white; border: none; border-radius: 5px; cursor: pointer;">Delete</button>
                </div>
            </div>
        `).join('');
        // Add "Create New Package" button
        container.innerHTML += `
            <div class="admin-list-item" style="text-align: center; cursor: pointer;" onclick="showCreatePackageForm()">
                <h4 style="color: #E84855;">+ Create New Package</h4>
            </div>
        `;
    } catch (error) {
        container.innerHTML = `<p style='color: red; text-align: center; padding: 20px;'>Failed to load packages: ${error.message || error}</p>`;
        console.error('Failed to load packages:', error);
    }
}

async function loadAdminPortfolio() {
    const container = document.getElementById('adminPortfolioTab');
    try {
        const items = await apiCall('/admin/portfolio');
        // Check if container exists, if not create it
        if (!container) return;
        const listContainer = container.querySelector('.admin-list') || container;
        if (items.length === 0) {
            listContainer.innerHTML = '<p style="color: #666; text-align: center; padding: 20px;">No portfolio items yet.</p>';
            return;
        }
        listContainer.innerHTML = items.map(item => `
            <div class="admin-list-item">
                <h4>${item.title}</h4>
                <p><strong>Category:</strong> ${item.category || 'Uncategorized'}</p>
                <p>${item.description || 'No description'}</p>
                ${item.image_url ? `<img src="${item.image_url}" style="max-width: 200px; margin: 10px 0; border-radius: 8px;" alt="${item.title}">` : ''}
                ${item.project_url ? `<p><strong>Project URL:</strong> <a href="${item.project_url}" target="_blank">${item.project_url}</a></p>` : ''}
                <div class="item-meta">
                    <span class="admin-badge ${item.is_active ? 'active' : 'inactive'}">${item.is_active ? 'Active' : 'Inactive'}</span>
                    <span class="admin-badge">Order: ${item.display_order}</span>
                    <button onclick="editPortfolioItem(${item.id})" style="margin-left: 10px; padding: 5px 15px; background: #E84855; color: white; border: none; border-radius: 5px; cursor: pointer;">Edit</button>
                    <button onclick="deletePortfolioItem(${item.id})" style="margin-left: 5px; padding: 5px 15px; background: #333; color: white; border: none; border-radius: 5px; cursor: pointer;">Delete</button>
                </div>
            </div>
        `).join('');
        // Add "Create New Item" button
        listContainer.innerHTML += `
            <div class="admin-list-item" style="text-align: center; cursor: pointer;" onclick="showCreatePortfolioForm()">
                <h4 style="color: #E84855;">+ Create New Item</h4>
            </div>
        `;
    } catch (error) {
        const listContainer = (container && (container.querySelector('.admin-list') || container)) || null;
        if (listContainer) {
            listContainer.innerHTML = `<p style='color: red; text-align: center; padding: 20px;'>Failed to load portfolio: ${error.message || error}</p>`;
        }
        console.error('Failed to load portfolio:', error);
    }
}

// Portfolio Management Functions
function showCreatePortfolioForm() {
    const form = prompt('Enter portfolio details (format: title,description,image_url,category,project_url)');
    if (!form) return;

    const [title, description, image_url, category, project_url] = form.split(',');
    createPortfolioItem({ title, description, image_url, category, project_url });
}

async function createPortfolioItem(data) {
    try {
        await apiCall('/admin/portfolio', 'POST', data);
        alert('Portfolio item created successfully!');
        await loadAdminPortfolio();
    } catch (error) {
        alert('Failed to create portfolio item: ' + error.message);
    }
}

async function editPortfolioItem(id) {
    // Simple prompt-based editing (can be enhanced with a modal)
    const title = prompt('Enter new title:');
    if (!title) return;

    const description = prompt('Enter new description:');
    const category = prompt('Enter category:');
    const is_active = confirm('Is this item active?');

    try {
        await apiCall(`/admin/portfolio/${id}`, 'PUT', {
            title,
            description,
            category,
            is_active,
            image_url: '',
            project_url: '',
            display_order: 0
        });
        alert('Portfolio item updated successfully!');
        await loadAdminPortfolio();
    } catch (error) {
        alert('Failed to update portfolio item: ' + error.message);
    }
}

async function deletePortfolioItem(id) {
    if (!confirm('Are you sure you want to delete this portfolio item?')) return;

    try {
        await apiCall(`/admin/portfolio/${id}`, 'DELETE');
        alert('Portfolio item deleted successfully!');
        await loadAdminPortfolio();
    } catch (error) {
        alert('Failed to delete portfolio item: ' + error.message);
    }
}

// Package Management Functions
function showCreatePackageForm() {
    const name = prompt('Enter package name:');
    if (!name) return;

    const price = parseFloat(prompt('Enter price (in rupees):'));
    const description = prompt('Enter description:');
    const features = prompt('Enter features (comma-separated):').split(',');

    createPackage({ name, price, description, features, duration_days: 30 });
}

async function createPackage(data) {
    try {
        await apiCall('/admin/packages', 'POST', data);
        alert('Package created successfully!');
        await loadAdminPackages();
    } catch (error) {
        alert('Failed to create package: ' + error.message);
    }
}

async function editPackage(id) {
    const name = prompt('Enter new package name:');
    if (!name) return;

    const price = parseFloat(prompt('Enter new price:'));
    const description = prompt('Enter new description:');
    const is_active = confirm('Is this package active?');

    try {
        await apiCall(`/admin/packages/${id}`, 'PUT', {
            name,
            price,
            description,
            is_active,
            duration_days: 30,
            features: [],
            display_order: 0
        });
        alert('Package updated successfully!');
        await loadAdminPackages();
    } catch (error) {
        alert('Failed to update package: ' + error.message);
    }
}

async function deletePackage(id) {
    if (!confirm('Are you sure you want to delete this package?')) return;

    try {
        await apiCall(`/admin/packages/${id}`, 'DELETE');
        alert('Package deleted successfully!');
        await loadAdminPackages();
    } catch (error) {
        alert('Failed to delete package: ' + error.message);
    }
}

// Contact Status Update
async function updateContactStatus(id, status) {
    try {
        await apiCall(`/admin/contacts/${id}/status`, 'PUT', { status });
        alert('Contact status updated successfully!');
        await loadAdminContacts();
    } catch (error) {
        alert('Failed to update status: ' + error.message);
    }
}

function switchAdminTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.admin-tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.admin-tab-content').forEach(content => content.classList.remove('active'));

    // Show selected tab
    document.querySelector(`[onclick="switchAdminTab('${tabName}')"]`).classList.add('active');
    document.getElementById(`admin${tabName.charAt(0).toUpperCase() + tabName.slice(1)}Tab`).classList.add('active');
}

function notifyAdmin(type, data) {
    // Store notification for admin (in production, this would send email/push notification)
    const notifications = JSON.parse(localStorage.getItem('adminNotifications') || '[]');
    notifications.push({
        type: type,
        data: data,
        timestamp: new Date().toISOString(),
        read: false
    });
    localStorage.setItem('adminNotifications', JSON.stringify(notifications));
    console.log('Admin notified:', type, data);
}


// Intersection Observer for fade-in animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe all sections - disabled to fix blank page
// document.querySelectorAll('section').forEach(section => {
//     section.style.opacity = '0';
//     section.style.transform = 'translateY(30px)';
//     section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
//     observer.observe(section);
// });

// Carousel pause on hover
const carouselTrack = document.querySelector('.carousel-track');

if (carouselTrack) {
    carouselTrack.addEventListener('mouseenter', () => {
        carouselTrack.style.animationPlayState = 'paused';
    });

    carouselTrack.addEventListener('mouseleave', () => {
        carouselTrack.style.animationPlayState = 'running';
    });
}

// Counter Animation for Stats
const animateCounter = (element, target, suffix, duration = 2000) => {
    let start = 0;
    const increment = target / (duration / 16);

    const timer = setInterval(() => {
        start += increment;
        if (start >= target) {
            element.textContent = target + suffix;
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(start) + suffix;
        }
    }, 16);
};

// Trigger counter animation when stats section is visible
const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const statNumbers = entry.target.querySelectorAll('.stat-number');
            statNumbers.forEach(stat => {
                const text = stat.textContent;
                const number = parseInt(text.replace(/\D/g, ''));
                // Extract suffix by removing all digits (e.g., "25K+" -> "K+")
                const suffix = text.replace(/[0-9]/g, '');
                stat.textContent = '0' + suffix;
                animateCounter(stat, number, suffix);
            });
            statsObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

const statsSection = document.querySelector('.stats');
if (statsSection) {
    statsObserver.observe(statsSection);
}

// Add active class to current section in navigation
window.addEventListener('scroll', () => {
    let current = '';
    const sections = document.querySelectorAll('section[id]');

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (window.pageYOffset >= sectionTop - 200) {
            current = section.getAttribute('id');
        }
    });

    document.querySelectorAll('.nav-links a').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
});

// Preload images for better performance
const preloadImages = () => {
    const images = [
        'images/hero-person.png',
        'images/contact-person.png'
    ];

    images.forEach(src => {
        const img = new Image();
        img.src = src;
    });
};

// Initialize on page load
window.addEventListener('load', () => {
    preloadImages();

    // Remove initial loading class if you have one
    document.body.classList.add('loaded');
});

// Add parallax effect to hero section
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const heroImage = document.querySelector('.hero-image');

    if (heroImage && scrolled < 800) {
        heroImage.style.transform = `translateY(${scrolled * 0.3}px)`;
    }
});

// Handle window resize
let resizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        // Reset mobile menu on resize
        if (window.innerWidth > 768) {
            navLinks.classList.remove('active');
            hamburger.classList.remove('active');
        }
    }, 250);
});

// Add loading state to buttons
document.querySelectorAll('a[href^="#"], button[type="submit"]').forEach(button => {
    button.addEventListener('click', function () {
        if (!this.classList.contains('loading')) {
            this.classList.add('loading');
            setTimeout(() => {
                this.classList.remove('loading');
            }, 1000);
        }
    });
});

console.log('Website loaded successfully! 🚀');

// Scroll Reveal Animation Observer
document.addEventListener('DOMContentLoaded', () => {
    const revealElements = document.querySelectorAll('.reveal');
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.15
    });

    revealElements.forEach(el => revealObserver.observe(el));
});

// Scroll Reveal Animation Observer
const revealElements = document.querySelectorAll('.reveal');

const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
            observer.unobserve(entry.target);
        }
    });
}, {
    threshold: 0.15
});

revealElements.forEach(el => revealObserver.observe(el));
