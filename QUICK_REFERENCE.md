# 🚀 Quick Reference Guide

## Common Commands

### Starting the Application

```bash
# Terminal 1: Start Backend
cd "c:\Users\HP\Downloads\Satans"
npm start

# Terminal 2: Start Frontend (Live Server)
# Right-click index.html → Open with Live Server
# OR
python -m http.server 5500
```

---

## Database Commands

### Connect to Database
```bash
psql -U postgres -d satans_db
```

### View Tables
```sql
\dt
```

### View All Users
```sql
SELECT * FROM users;
```

### View Active Subscriptions
```sql
SELECT * FROM active_subscriptions_view;
```

### View All Subscriptions
```sql
SELECT u.full_name, u.email, s.package_name, s.amount, s.status, s.valid_until
FROM subscriptions s
JOIN users u ON s.user_id = u.id
ORDER BY s.created_at DESC;
```

### View Payment Receipts
```sql
SELECT * FROM payment_receipts ORDER BY payment_date DESC;
```

### View Contact Submissions
```sql
SELECT * FROM contact_submissions ORDER BY submitted_at DESC;
```

### Update Contact Status
```sql
UPDATE contact_submissions 
SET status = 'contacted' 
WHERE id = 1;
```

### Count Users
```sql
SELECT COUNT(*) FROM users;
```

### Count Active Subscriptions
```sql
SELECT COUNT(*) FROM subscriptions WHERE status = 'active';
```

### Exit psql
```sql
\q
```

---

## API Testing with cURL

### Register User
```bash
curl -X POST http://localhost:3000/api/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{\"fullName\":\"Test User\",\"email\":\"test@example.com\",\"mobile\":\"1234567890\",\"password\":\"Test@123\"}"
```

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"test@example.com\",\"password\":\"Test@123\"}"
```

### Get User Profile
```bash
curl -X GET http://localhost:3000/api/user/profile ^
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Create Payment Order
```bash
curl -X POST http://localhost:3000/api/payment/create-order ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Bearer YOUR_TOKEN_HERE" ^
  -d "{\"packageName\":\"Basic\",\"amount\":15000}"
```

### Submit Contact Form
```bash
curl -X POST http://localhost:3000/api/contact/submit ^
  -H "Content-Type: application/json" ^
  -d "{\"fullName\":\"John Doe\",\"email\":\"john@example.com\",\"mobile\":\"9876543210\",\"service\":\"Web Design\",\"message\":\"Interested in your services\"}"
```

### Admin - Get Users
```bash
curl -X GET http://localhost:3000/api/admin/users ^
  -H "Authorization: Bearer ADMIN_TOKEN_HERE"
```

---

## npm Commands

### Install Dependencies
```bash
npm install
```

### Start Server (Production)
```bash
npm start
```

### Start Server (Development with auto-reload)
```bash
npm run dev
```

### Update Dependencies
```bash
npm update
```

### Check for Outdated Packages
```bash
npm outdated
```

### Install New Package
```bash
npm install package-name
```

---

## Git Commands

### Initialize Repository
```bash
git init
```

### Add All Files
```bash
git add .
```

### Commit Changes
```bash
git commit -m "Initial commit with backend and database"
```

### Create Branch
```bash
git checkout -b feature/new-feature
```

### Push to GitHub
```bash
git remote add origin https://github.com/yourusername/satans.git
git branch -M main
git push -u origin main
```

---

## Environment Variables Quick Reference

```env
# Server
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://127.0.0.1:5500

# Database
DB_USER=postgres
DB_HOST=localhost
DB_NAME=satans_db
DB_PASSWORD=your_password
DB_PORT=5432

# JWT
JWT_SECRET=your_secret_key_min_32_chars

# Razorpay
RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=your_secret

# Email
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your_app_password

# Admin
ADMIN_EMAIL=satans@gmail.com
ADMIN_PASSWORD=Satans123
```

---

## Troubleshooting Quick Fixes

### Port Already in Use
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:3000 | xargs kill -9
```

### Database Connection Error
```bash
# Check PostgreSQL status
# Windows: Services → PostgreSQL
# Mac: brew services list
# Linux: systemctl status postgresql

# Restart PostgreSQL
# Windows: net stop postgresql-x64-14 && net start postgresql-x64-14
# Mac: brew services restart postgresql
# Linux: sudo systemctl restart postgresql
```

### Cannot Find Module Error
```bash
npm install
```

### Email Not Sending
1. Check Gmail App Password
2. Verify 2FA is enabled
3. Check EMAIL_USER and EMAIL_PASSWORD in .env
4. Look in spam folder

### Razorpay Error
1. Verify RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET
2. Check if using test mode keys (rzp_test_)
3. Ensure account is activated

### CORS Error
1. Check FRONTEND_URL in .env matches your frontend URL
2. Ensure backend is running on port 3000
3. Use Live Server for frontend (not file://)

---

## User Roles

### Regular User Capabilities
- Register and login
- Verify email
- Reset password
- View profile
- Purchase subscriptions
- Download receipts
- Submit contact form

### Admin Capabilities (satans@gmail.com)
- All user capabilities
- View all users
- View all subscriptions
- View all contact submissions
- Receive notifications
- Access admin panel

---

## Payment Testing

### Test Cards (Razorpay Test Mode)

**Success:**
- Card: 4111 1111 1111 1111
- CVV: 123
- Expiry: 12/25

**Failure:**
- Card: 4111 1111 1111 1234
- CVV: 123
- Expiry: 12/25

**3D Secure:**
- Card: 5104 0600 0000 0008
- CVV: 123
- Expiry: 12/25
- OTP: 123456

---

## Database Backup & Restore

### Backup Database
```bash
# Full backup
pg_dump -U postgres satans_db > backup.sql

# Backup with timestamp
pg_dump -U postgres satans_db > backup_$(date +%Y%m%d_%H%M%S).sql
```

### Restore Database
```bash
# Drop existing database
psql -U postgres -c "DROP DATABASE IF EXISTS satans_db;"

# Create new database
psql -U postgres -c "CREATE DATABASE satans_db;"

# Restore from backup
psql -U postgres satans_db < backup.sql
```

### Backup Only Data (No Schema)
```bash
pg_dump -U postgres --data-only satans_db > data_backup.sql
```

### Backup Only Schema
```bash
pg_dump -U postgres --schema-only satans_db > schema_backup.sql
```

---

## Performance Monitoring

### Check Server Status
```bash
curl http://localhost:3000/api/health
```

### Monitor Database Connections
```sql
SELECT * FROM pg_stat_activity WHERE datname = 'satans_db';
```

### Check Table Sizes
```sql
SELECT 
    relname AS table_name,
    pg_size_pretty(pg_total_relation_size(relid)) AS total_size
FROM pg_catalog.pg_statio_user_tables
ORDER BY pg_total_relation_size(relid) DESC;
```

### View Slow Queries
```sql
SELECT pid, now() - query_start as duration, query 
FROM pg_stat_activity 
WHERE state = 'active';
```

---

## Security Checklist

### Before Production
- [ ] Change admin password
- [ ] Generate new JWT_SECRET
- [ ] Use production Razorpay keys
- [ ] Update FRONTEND_URL
- [ ] Enable HTTPS
- [ ] Add rate limiting
- [ ] Set NODE_ENV=production

---

## Email Templates

### Verification Email
```
Subject: Verify Your Email - SatAns

Your verification code is: 123456

Enter this code to verify your email address.

This code expires in 10 minutes.
```

### Password Reset
```
Subject: Password Reset - SatAns

Click the link below to reset your password:
[Reset Link]

This link expires in 1 hour.
```

---

## Useful SQL Queries

### Find User by Email
```sql
SELECT * FROM users WHERE email = 'test@example.com';
```

### Update User Password (Manual)
```sql
-- Generate hash first using bcrypt
UPDATE users 
SET password = '$2a$10$...' 
WHERE email = 'test@example.com';
```

### Activate Subscription Manually
```sql
UPDATE subscriptions 
SET status = 'active', 
    valid_until = NOW() + INTERVAL '30 days'
WHERE user_id = 1;
```

### Mark Email as Verified
```sql
UPDATE users 
SET email_verified = true 
WHERE email = 'test@example.com';
```

### Delete User and Related Data
```sql
-- Foreign keys will cascade delete subscriptions and receipts
DELETE FROM users WHERE email = 'test@example.com';
```

---

## Frontend JavaScript Console Commands

### Check Current User
```javascript
JSON.parse(localStorage.getItem('currentUser'))
```

### Get Auth Token
```javascript
localStorage.getItem('authToken')
```

### Clear All Local Storage
```javascript
localStorage.clear()
```

### Test API Call
```javascript
fetch('http://localhost:3000/api/user/profile', {
    headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
    }
}).then(r => r.json()).then(console.log)
```

---

## Package Management

### Check Installed Versions
```bash
npm list --depth=0
```

### Update All Packages
```bash
npm update
```

### Install Specific Version
```bash
npm install package@1.2.3
```

### Remove Package
```bash
npm uninstall package-name
```

---

## Production Environment URLs

Update these when deploying:

```javascript
// script.js
const API_URL = 'https://your-backend-url.com/api';
```

```env
# .env
FRONTEND_URL=https://your-frontend-url.com
NODE_ENV=production
```

---

## Support Contacts

**Admin Email:** satans@gmail.com  
**Database:** PostgreSQL on localhost:5432  
**Backend:** http://localhost:3000  
**Frontend:** http://127.0.0.1:5500  

---

## Quick Links

- **Razorpay Dashboard:** https://dashboard.razorpay.com/
- **Gmail App Passwords:** https://myaccount.google.com/apppasswords
- **PostgreSQL Docs:** https://www.postgresql.org/docs/
- **Express Docs:** https://expressjs.com/
- **Nodemailer Docs:** https://nodemailer.com/

---

**Last Updated:** 2024
**Version:** 1.0.0
**Status:** ✅ Production Ready
