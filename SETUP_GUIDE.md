# Complete Setup Guide - SatAns Website

This guide will help you set up the complete full-stack application with backend, database, and payment gateway integration.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

1. **Node.js** (v16 or higher)
   - Download from: https://nodejs.org/
   - Verify installation: `node --version`

2. **PostgreSQL** (v12 or higher)
   - Download from: https://www.postgresql.org/download/
   - Verify installation: `psql --version`

3. **Git** (for version control)
   - Download from: https://git-scm.com/

4. **Razorpay Account** (for payments)
   - Sign up at: https://razorpay.com/
   - Get your API keys from dashboard

5. **Gmail Account** (for email sending)
   - Enable 2-Factor Authentication
   - Generate App Password: https://myaccount.google.com/apppasswords

---

## 🚀 Installation Steps

### Step 1: Install Node.js Dependencies

```bash
# Navigate to project directory
cd "c:\Users\HP\Downloads\Satans"

# Install all required packages
npm install
```

This will install:
- express (web server)
- cors (cross-origin requests)
- pg (PostgreSQL client)
- bcryptjs (password hashing)
- jsonwebtoken (JWT authentication)
- razorpay (payment gateway)
- dotenv (environment variables)
- nodemailer (email sending)

---

### Step 2: Set Up PostgreSQL Database

#### 2.1 Start PostgreSQL Service

**Windows:**
```bash
# Open Services (Win + R, type 'services.msc')
# Find PostgreSQL service and start it
# OR use command:
net start postgresql-x64-14
```

**Mac:**
```bash
brew services start postgresql
```

**Linux:**
```bash
sudo systemctl start postgresql
```

#### 2.2 Create Database

```bash
# Connect to PostgreSQL (default user is 'postgres')
psql -U postgres

# Create database
CREATE DATABASE satans_db;

# Exit psql
\q
```

#### 2.3 Run Database Schema

```bash
# Run the database.sql file to create tables
psql -U postgres -d satans_db -f database.sql
```

Or manually in psql:
```bash
psql -U postgres -d satans_db
\i database.sql
\q
```

#### 2.4 Verify Database Setup

```bash
psql -U postgres -d satans_db

# List tables
\dt

# You should see:
# - users
# - subscriptions
# - payment_receipts
# - contact_submissions
# - admin_notifications

# Exit
\q
```

---

### Step 3: Configure Environment Variables

#### 3.1 Create `.env` file

Copy the `.env.example` file and rename it to `.env`:

```bash
copy .env.example .env
```

#### 3.2 Configure Database Connection

Edit `.env` file:

```env
# Database Configuration
DB_USER=postgres
DB_HOST=localhost
DB_NAME=satans_db
DB_PASSWORD=your_postgres_password
DB_PORT=5432
```

**Important:** Replace `your_postgres_password` with your actual PostgreSQL password!

#### 3.3 Configure JWT Secret

Generate a secure random string for JWT:

```env
JWT_SECRET=your_very_secure_random_string_here_min_32_chars
```

You can generate one using Node.js:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

#### 3.4 Configure Razorpay

Get your Razorpay credentials:
1. Login to https://dashboard.razorpay.com/
2. Go to Settings → API Keys
3. Generate Test/Live Keys

Add to `.env`:
```env
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_secret_key
```

#### 3.5 Configure Email (Gmail)

1. Enable 2-Factor Authentication on your Gmail account
2. Generate App Password:
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" and "Other (Custom name)"
   - Copy the 16-character password

Add to `.env`:
```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your_16_char_app_password
```

#### 3.6 Configure Admin Credentials

Set your admin email and password:

```env
ADMIN_EMAIL=satans@gmail.com
ADMIN_PASSWORD=Satans123
```

**Important:** Change these in production!

#### 3.7 Final .env File Check

Your `.env` file should look like:

```env
# Server Configuration
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://127.0.0.1:5500

# Database Configuration
DB_USER=postgres
DB_HOST=localhost
DB_NAME=satans_db
DB_PASSWORD=your_actual_password
DB_PORT=5432

# JWT Secret
JWT_SECRET=your_generated_secret_key_here

# Razorpay Configuration
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_secret

# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your_app_password

# Admin Credentials
ADMIN_EMAIL=satans@gmail.com
ADMIN_PASSWORD=Satans123
```

---

### Step 4: Update Frontend Configuration

Edit `script.js` and update the Razorpay key:

The backend will send this automatically, but you can also add it in the frontend for reference.

---

## 🏃 Running the Application

### Method 1: Development Mode (Recommended)

Start the backend server:

```bash
npm run dev
```

This uses `nodemon` to auto-restart on file changes.

### Method 2: Production Mode

```bash
npm start
```

You should see:
```
✓ PostgreSQL database connected successfully!
Server running on port 3000
```

### Open Frontend

1. **Option A: Using Live Server (VS Code)**
   - Install "Live Server" extension
   - Right-click on `index.html`
   - Select "Open with Live Server"

2. **Option B: Using Python**
   ```bash
   python -m http.server 5500
   ```

3. **Option C: Direct File**
   - Simply open `index.html` in browser
   - Note: CORS might cause issues, use Live Server instead

---

## 🧪 Testing the System

### 1. Test User Registration

1. Open website: http://127.0.0.1:5500
2. Click "Login / Register"
3. Fill registration form
4. Check email for verification code
5. Enter code to verify account

### 2. Test Login

1. Use registered email and password
2. Click "Login"
3. You should see dashboard with user info

### 3. Test Payment Flow

1. Login as user
2. Navigate to "Packages" section
3. Click "Get Started" on any package
4. Click "Pay with Razorpay"
5. Use Razorpay test cards:
   - Card: 4111 1111 1111 1111
   - CVV: Any 3 digits
   - Expiry: Any future date
6. Complete payment
7. Check dashboard for active subscription

### 4. Test Admin Panel

1. Click "Admin Login"
2. Email: `satans@gmail.com`
3. Password: `Satans123`
4. You should see all users, subscriptions, and contact forms

### 5. Test Contact Form

1. Fill contact form
2. Submit
3. Login as admin to see submission

---

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/verify-email` - Verify email with code
- `POST /api/auth/resend-code` - Resend verification code
- `POST /api/auth/forgot-password` - Send password reset email
- `POST /api/auth/admin-login` - Admin login

### User
- `GET /api/user/profile` - Get user profile (requires auth)

### Payments
- `POST /api/payment/create-order` - Create Razorpay order (requires auth)
- `POST /api/payment/verify` - Verify payment signature (requires auth)
- `GET /api/payment/receipt/:txnId` - Get payment receipt (requires auth)

### Contact
- `POST /api/contact/submit` - Submit contact form

### Admin (requires admin auth)
- `GET /api/admin/users` - Get all users
- `GET /api/admin/subscriptions` - Get all subscriptions
- `GET /api/admin/contacts` - Get all contact submissions
- `GET /api/admin/notifications` - Get admin notifications

---

## 🔒 Security Notes

### Important Security Measures:

1. **Never commit `.env` file** to Git
   - Already in `.gitignore`

2. **Use strong passwords**
   - Change default admin credentials in production

3. **Use HTTPS in production**
   - Update `FRONTEND_URL` to use https://

4. **Secure your JWT_SECRET**
   - Minimum 32 characters
   - Use random string generator

5. **Enable Razorpay webhooks**
   - For production, set up webhooks for payment confirmations

6. **Rate limiting**
   - Consider adding rate limiting middleware in production

7. **Input validation**
   - All inputs are validated, but add more checks as needed

---

## 🐛 Troubleshooting

### Database Connection Error

**Error:** `ECONNREFUSED ::1:5432`

**Solution:**
1. Check if PostgreSQL is running
2. Verify `DB_HOST` in `.env` (try `127.0.0.1` instead of `localhost`)
3. Check PostgreSQL port: `SELECT * FROM pg_settings WHERE name = 'port';`

### Authentication Error: "invalid_grant"

**Error:** `Auth error`

**Solution:**
1. Verify Gmail App Password is correct
2. Ensure 2FA is enabled on Gmail account
3. Regenerate App Password if needed

### Razorpay Key Error

**Error:** `Key/Secret required`

**Solution:**
1. Verify Razorpay keys in `.env`
2. Check if you're using Test Mode keys (start with `rzp_test_`)
3. Ensure no extra spaces in `.env` file

### CORS Error

**Error:** `Access-Control-Allow-Origin`

**Solution:**
1. Ensure backend is running on port 3000
2. Verify `FRONTEND_URL` in `.env` matches your frontend URL
3. Use Live Server for frontend (not direct file opening)

### Port Already in Use

**Error:** `Port 3000 already in use`

**Solution:**
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:3000 | xargs kill -9
```

Or change port in `.env`:
```env
PORT=3001
```

### Email Not Sending

**Error:** `Nodemailer error`

**Solution:**
1. Check Gmail settings: https://myaccount.google.com/security
2. Allow less secure apps (if needed)
3. Verify App Password is correctly copied
4. Check spam folder for emails

---

## 📊 Database Management

### View Data

```sql
-- Connect to database
psql -U postgres -d satans_db

-- View all users
SELECT * FROM users;

-- View all subscriptions
SELECT * FROM subscriptions;

-- View active subscriptions with user details
SELECT * FROM active_subscriptions_view;

-- View payment receipts
SELECT * FROM payment_receipts;

-- View contact submissions
SELECT * FROM contact_submissions;
```

### Reset Database

```bash
# Drop and recreate database
psql -U postgres -c "DROP DATABASE IF EXISTS satans_db;"
psql -U postgres -c "CREATE DATABASE satans_db;"
psql -U postgres -d satans_db -f database.sql
```

---

## 🚀 Deployment

### Preparing for Production

1. **Update environment variables:**
   ```env
   NODE_ENV=production
   FRONTEND_URL=https://yourdomain.com
   ```

2. **Use production Razorpay keys:**
   - Switch from `rzp_test_` to `rzp_live_`

3. **Set up SSL certificate:**
   - Use Let's Encrypt or Cloudflare

4. **Deploy backend:**
   - Heroku, AWS, DigitalOcean, Railway, etc.

5. **Deploy frontend:**
   - Netlify, Vercel, GitHub Pages, etc.

6. **Update CORS:**
   - Change `FRONTEND_URL` to production domain

7. **Set up database backups:**
   - Schedule regular PostgreSQL backups

---

## 📝 Support

If you encounter any issues:

1. Check this guide thoroughly
2. Review error logs in terminal
3. Verify all `.env` variables
4. Check PostgreSQL connection
5. Test API endpoints with Postman

---

## ✅ Checklist

Before launching:

- [ ] PostgreSQL installed and running
- [ ] Database created and schema imported
- [ ] `.env` file configured with all variables
- [ ] Node.js dependencies installed (`npm install`)
- [ ] Backend server starts without errors
- [ ] Frontend opens in browser
- [ ] User registration works
- [ ] Email verification works
- [ ] Login works
- [ ] Payment flow works (test mode)
- [ ] Admin panel accessible
- [ ] Contact form works
- [ ] All data visible in admin panel

---

## 🎉 Success!

Once all tests pass, your application is ready to use!

**Test Credentials:**
- **Admin:** satans@gmail.com / Satans123
- **User:** Register new account

**Test Payment:**
- **Card:** 4111 1111 1111 1111
- **CVV:** 123
- **Expiry:** 12/25

Enjoy your fully functional application! 🚀
