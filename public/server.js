const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const path = require('path');
require('dotenv').config();

// DEBUG: Log environment variables on startup
console.log('=== Environment Check ===');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('DB_HOST:', process.env.DB_HOST || 'NOT SET');
console.log('DB_USER:', process.env.DB_USER || 'NOT SET');
console.log('DB_NAME:', process.env.DB_NAME || 'NOT SET');
console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? '***SET***' : 'NOT SET');
console.log('DB_PORT:', process.env.DB_PORT || 'NOT SET');
console.log('========================');

const pool = require('./config/database');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from root directory correctly
app.use(express.static(__dirname));

// Explicit path for root to ensure index.html loads
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Razorpay Instance
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Email transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(400).json({ error: 'Invalid token.' });
    }
};

// Admin verification middleware
const verifyAdmin = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access denied.' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        if (decoded.email !== process.env.ADMIN_EMAIL) {
            return res.status(403).json({ error: 'Admin access required.' });
        }
        next();
    } catch (error) {
        res.status(400).json({ error: 'Invalid token.' });
    }
};

// ==================== USER ROUTES ====================

// Register User
app.post('/api/auth/register', async (req, res) => {
    try {
        const { fullName, email, mobile, password } = req.body;

        // Check if user exists
        const userExists = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userExists.rows.length > 0) {
            return res.status(400).json({ error: 'Email already registered.' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Generate verification code
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

        // Insert user
        const result = await pool.query(
            `INSERT INTO users (full_name, email, mobile, password, verification_code, email_verified) 
             VALUES ($1, $2, $3, $4, $5, false) RETURNING id, full_name, email, mobile, created_at`,
            [fullName, email, mobile, hashedPassword, verificationCode]
        );

        // Send verification email
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Email Verification - SatAns',
            html: `
                <h2>Welcome to SatAns!</h2>
                <p>Your verification code is: <strong>${verificationCode}</strong></p>
                <p>This code will expire in 10 minutes.</p>
            `
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) console.log('Email error:', error);
        });

        res.status(201).json({
            message: 'Registration successful. Please check your email for verification code.',
            user: result.rows[0],
            verificationCode: verificationCode // Remove in production
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Registration failed.' });
    }
});

// Verify Email
app.post('/api/auth/verify-email', async (req, res) => {
    try {
        const { email, verificationCode } = req.body;

        const result = await pool.query(
            'SELECT * FROM users WHERE email = $1 AND verification_code = $2',
            [email, verificationCode]
        );

        if (result.rows.length === 0) {
            return res.status(400).json({ error: 'Invalid verification code.' });
        }

        await pool.query(
            'UPDATE users SET email_verified = true, verification_code = NULL WHERE email = $1',
            [email]
        );

        const user = result.rows[0];
        const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

        res.json({
            message: 'Email verified successfully.',
            token,
            user: {
                id: user.id,
                fullName: user.full_name,
                email: user.email,
                mobile: user.mobile
            }
        });
    } catch (error) {
        console.error('Verification error:', error);
        res.status(500).json({ error: 'Verification failed.' });
    }
});

// Resend Verification Code
app.post('/api/auth/resend-code', async (req, res) => {
    try {
        const { email } = req.body;

        const newCode = Math.floor(100000 + Math.random() * 900000).toString();

        await pool.query(
            'UPDATE users SET verification_code = $1 WHERE email = $2',
            [newCode, email]
        );

        // Send email
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'New Verification Code - SatAns',
            html: `<p>Your new verification code is: <strong>${newCode}</strong></p>`
        };

        transporter.sendMail(mailOptions);

        res.json({
            message: 'New verification code sent.',
            verificationCode: newCode // Remove in production
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to resend code.' });
    }
});

// Login
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

        if (result.rows.length === 0) {
            return res.status(400).json({ error: 'Invalid credentials.' });
        }

        const user = result.rows[0];

        if (!user.email_verified) {
            return res.status(400).json({ error: 'Please verify your email first.' });
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(400).json({ error: 'Invalid credentials.' });
        }

        const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

        res.json({
            token,
            user: {
                id: user.id,
                fullName: user.full_name,
                email: user.email,
                mobile: user.mobile
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed.' });
    }
});

// Admin Login
app.post('/api/auth/admin-login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (email !== process.env.ADMIN_EMAIL || password !== process.env.ADMIN_PASSWORD) {
            return res.status(400).json({ error: 'Invalid admin credentials.' });
        }
        const token = jwt.sign({ email: email, role: 'admin' }, JWT_SECRET, { expiresIn: '7d' });
        res.json({ token, message: 'Admin login successful' });
    } catch (error) {
        res.status(500).json({ error: 'Login failed.' });
    }
});

// Forgot Password
app.post('/api/auth/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;

        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Email not found.' });
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetExpiry = new Date(Date.now() + 3600000); // 1 hour

        await pool.query(
            'UPDATE users SET reset_token = $1, reset_expiry = $2 WHERE email = $3',
            [resetToken, resetExpiry, email]
        );

        // Send reset email
        const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Password Reset - SatAns',
            html: `
                <h2>Password Reset Request</h2>
                <p>Click the link below to reset your password:</p>
                <a href="${resetLink}">${resetLink}</a>
                <p>This link will expire in 1 hour.</p>
            `
        };

        transporter.sendMail(mailOptions);

        res.json({ message: 'Password reset link sent to your email.' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to process request.' });
    }
});

// Get User Profile
app.get('/api/user/profile', verifyToken, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT u.id, u.full_name, u.email, u.mobile, u.created_at,
                    s.package_name, s.status, s.start_date, s.valid_until, s.amount
             FROM users u
             LEFT JOIN subscriptions s ON u.id = s.user_id AND s.status = 'active'
             WHERE u.id = $1`,
            [req.user.id]
        );

        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch profile.' });
    }
});

// ==================== PAYMENT ROUTES ====================

// Create Razorpay Order
app.post('/api/payment/create-order', verifyToken, async (req, res) => {
    try {
        const { packageName, amount } = req.body;

        const options = {
            amount: amount * 100, // amount in smallest currency unit (paise)
            currency: 'INR',
            receipt: `receipt_${Date.now()}`,
            notes: {
                userId: req.user.id,
                packageName: packageName
            }
        };

        const order = await razorpay.orders.create(options);

        res.json({
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            keyId: process.env.RAZORPAY_KEY_ID
        });
    } catch (error) {
        console.error('Order creation error:', error);
        res.status(500).json({ error: 'Failed to create order.' });
    }
});

// Verify Payment and Activate Subscription
app.post('/api/payment/verify', verifyToken, async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, packageName, amount } = req.body;

        // Verify signature
        const body = razorpay_order_id + '|' + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest('hex');

        if (expectedSignature !== razorpay_signature) {
            return res.status(400).json({ error: 'Payment verification failed.' });
        }

        // Payment successful - Create subscription
        const validUntil = new Date();
        validUntil.setMonth(validUntil.getMonth() + 1);

        const result = await pool.query(
            `INSERT INTO subscriptions (user_id, package_name, amount, status, start_date, valid_until, transaction_id)
             VALUES ($1, $2, $3, 'active', NOW(), $4, $5)
             RETURNING *`,
            [req.user.id, packageName, amount, validUntil, razorpay_payment_id]
        );

        // Create receipt
        await pool.query(
            `INSERT INTO payment_receipts (user_id, transaction_id, package_name, amount, payment_gateway)
             VALUES ($1, $2, $3, $4, 'razorpay')`,
            [req.user.id, razorpay_payment_id, packageName, amount]
        );

        // Notify admin
        await pool.query(
            `INSERT INTO admin_notifications (type, message, user_id)
             VALUES ('subscription', $1, $2)`,
            [`New subscription: ${packageName} by user ${req.user.id}`, req.user.id]
        );

        // Send confirmation email
        const userResult = await pool.query('SELECT email, full_name FROM users WHERE id = $1', [req.user.id]);
        const user = userResult.rows[0];

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: 'Subscription Activated - SatAns',
            html: `
                <h2>Subscription Activated!</h2>
                <p>Dear ${user.full_name},</p>
                <p>Your ${packageName} subscription has been activated successfully.</p>
                <p><strong>Transaction ID:</strong> ${razorpay_payment_id}</p>
                <p><strong>Amount:</strong> ₹${amount}</p>
                <p><strong>Valid Until:</strong> ${validUntil.toLocaleDateString()}</p>
            `
        };

        transporter.sendMail(mailOptions);

        res.json({
            message: 'Subscription activated successfully!',
            subscription: result.rows[0]
        });
    } catch (error) {
        console.error('Payment verification error:', error);
        res.status(500).json({ error: 'Payment verification failed.' });
    }
});

// Get Receipt
app.get('/api/payment/receipt/:transactionId', verifyToken, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT r.*, u.full_name, u.email 
             FROM payment_receipts r
             JOIN users u ON r.user_id = u.id
             WHERE r.transaction_id = $1 AND r.user_id = $2`,
            [req.params.transactionId, req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Receipt not found.' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch receipt.' });
    }
});

// ==================== CONTACT FORM ROUTES ====================

// Submit Contact Form
app.post('/api/contact/submit', async (req, res) => {
    try {
        const { fullName, email, mobile, service, message } = req.body;

        const result = await pool.query(
            `INSERT INTO contact_submissions (full_name, email, mobile, service, message)
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [fullName, email, mobile, service, message]
        );

        // Notify admin
        await pool.query(
            `INSERT INTO admin_notifications (type, message)
             VALUES ('contact', $1)`,
            [`New contact form from ${fullName} - ${service}`]
        );

        // Send notification email to admin
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: 'satansproduction@gmail.com',
            replyTo: email, // Set reply-to to user's email
            subject: 'New Contact Form Submission',
            html: `
                <h2>New Contact Form Submission</h2>
                <p><strong>Name:</strong> ${fullName}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Mobile:</strong> ${mobile}</p>
                <p><strong>Service:</strong> ${service}</p>
                <p><strong>Message:</strong> ${message}</p>
            `
        };

        transporter.sendMail(mailOptions);

        res.json({ message: 'Form submitted successfully!', submission: result.rows[0] });
    } catch (error) {
        console.error('Contact form error:', error);
        res.status(500).json({ error: 'Failed to submit form.' });
    }
});

// ==================== ADMIN ROUTES ====================

// Get All Users
app.get('/api/admin/users', verifyAdmin, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT u.id, u.full_name, u.email, u.mobile, u.email_verified, u.created_at,
                    s.package_name, s.status as subscription_status
             FROM users u
             LEFT JOIN subscriptions s ON u.id = s.user_id AND s.status = 'active'
             ORDER BY u.created_at DESC`
        );

        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch users.' });
    }
});

// Get All Subscriptions
app.get('/api/admin/subscriptions', verifyAdmin, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT s.*, u.full_name, u.email
             FROM subscriptions s
             JOIN users u ON s.user_id = u.id
             WHERE s.status = 'active'
             ORDER BY s.start_date DESC`
        );

        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch subscriptions.' });
    }
});

// Get All Contact Submissions
app.get('/api/admin/contacts', verifyAdmin, async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM contact_submissions ORDER BY submitted_at DESC'
        );

        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch contacts.' });
    }
});

// Get Admin Notifications
app.get('/api/admin/notifications', verifyAdmin, async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM admin_notifications ORDER BY created_at DESC LIMIT 50'
        );

        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch notifications.' });
    }
});

// Mark Notification as Read
app.put('/api/admin/notifications/:id/read', verifyAdmin, async (req, res) => {
    try {
        await pool.query(
            'UPDATE admin_notifications SET read = true WHERE id = $1',
            [req.params.id]
        );

        res.json({ message: 'Notification marked as read.' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update notification.' });
    }
});

// ==================== PORTFOLIO MANAGEMENT ====================

// Get All Portfolio Items
app.get('/api/admin/portfolio', verifyAdmin, async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM portfolio_items ORDER BY display_order ASC, created_at DESC'
        );
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch portfolio items.' });
    }
});

// Get Active Portfolio Items (Public)
app.get('/api/portfolio', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM portfolio_items WHERE is_active = true ORDER BY display_order ASC'
        );
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch portfolio.' });
    }
});

// Create Portfolio Item
app.post('/api/admin/portfolio', verifyAdmin, async (req, res) => {
    try {
        const { title, description, image_url, category, project_url, display_order } = req.body;

        const result = await pool.query(
            `INSERT INTO portfolio_items (title, description, image_url, category, project_url, display_order)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING *`,
            [title, description, image_url, category, project_url, display_order || 0]
        );

        res.status(201).json({
            message: 'Portfolio item created successfully!',
            item: result.rows[0]
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create portfolio item.' });
    }
});

// Update Portfolio Item
app.put('/api/admin/portfolio/:id', verifyAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, image_url, category, project_url, display_order, is_active } = req.body;

        const result = await pool.query(
            `UPDATE portfolio_items
             SET title = $1, description = $2, image_url = $3, category = $4,
                 project_url = $5, display_order = $6, is_active = $7
             WHERE id = $8
             RETURNING *`,
            [title, description, image_url, category, project_url, display_order, is_active, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Portfolio item not found.' });
        }

        res.json({
            message: 'Portfolio item updated successfully!',
            item: result.rows[0]
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update portfolio item.' });
    }
});

// Delete Portfolio Item
app.delete('/api/admin/portfolio/:id', verifyAdmin, async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            'DELETE FROM portfolio_items WHERE id = $1 RETURNING *',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Portfolio item not found.' });
        }

        res.json({ message: 'Portfolio item deleted successfully!' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete portfolio item.' });
    }
});

// ==================== PACKAGE MANAGEMENT ====================

// Get All Packages (Admin)
app.get('/api/admin/packages', verifyAdmin, async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM packages ORDER BY display_order ASC'
        );
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch packages.' });
    }
});

// Get Active Packages (Public)
app.get('/api/packages', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM packages ORDER BY display_order ASC'
        );
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch packages.' });
    }
});

// Create Package
app.post('/api/admin/packages', verifyAdmin, async (req, res) => {
    try {
        const { name, description, price, duration_days, features, display_order } = req.body;

        const result = await pool.query(
            `INSERT INTO packages (name, description, price, duration_days, features, display_order)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING *`,
            [name, description, price, duration_days || 30, features, display_order || 0]
        );

        res.status(201).json({
            message: 'Package created successfully!',
            package: result.rows[0]
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create package.' });
    }
});

// Update Package
app.put('/api/admin/packages/:id', verifyAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, price, duration_days, features, display_order, is_active } = req.body;

        const result = await pool.query(
            `UPDATE packages
             SET name = $1, description = $2, price = $3, duration_days = $4,
                 features = $5, display_order = $6, is_active = $7
             WHERE id = $8
             RETURNING *`,
            [name, description, price, duration_days, features, display_order, is_active, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Package not found.' });
        }

        res.json({
            message: 'Package updated successfully!',
            package: result.rows[0]
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update package.' });
    }
});

// Delete Package
app.delete('/api/admin/packages/:id', verifyAdmin, async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            'DELETE FROM packages WHERE id = $1 RETURNING *',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Package not found.' });
        }

        res.json({ message: 'Package deleted successfully!' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete package.' });
    }
});

// ==================== CONTACT MANAGEMENT ====================

// Update Contact Status
app.put('/api/admin/contacts/:id/status', verifyAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['pending', 'contacted', 'resolved'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status. Must be: pending, contacted, or resolved' });
        }

        const result = await pool.query(
            'UPDATE contact_submissions SET status = $1 WHERE id = $2 RETURNING *',
            [status, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Contact submission not found.' });
        }

        res.json({
            message: 'Contact status updated successfully!',
            contact: result.rows[0]
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update contact status.' });
    }
});

// ==================== START SERVER ====================

const PORT = process.env.PORT || 3000;
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

module.exports = app;
