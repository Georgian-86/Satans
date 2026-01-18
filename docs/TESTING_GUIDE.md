# 🧪 Testing Guide

## Complete Testing Checklist for SatAns Website

---

## Prerequisites for Testing

- [ ] PostgreSQL database created and schema imported
- [ ] Backend server running on port 3000
- [ ] Frontend served (Live Server or HTTP server)
- [ ] `.env` file configured with all credentials
- [ ] Razorpay test mode keys configured
- [ ] Gmail SMTP configured

---

## 1. Backend API Testing

### 1.1 User Registration
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"fullName\":\"Test User\",\"email\":\"testuser@example.com\",\"mobile\":\"9876543210\",\"password\":\"Test@123\"}"
```

**Expected Response:**
```json
{
  "message": "Registration successful! Please check your email for verification code.",
  "userId": 1
}
```

**Verify:**
- [ ] Check email for verification code
- [ ] Check database: `SELECT * FROM users WHERE email='testuser@example.com';`
- [ ] Verify password is hashed
- [ ] Verify email_verified is false

---

### 1.2 Email Verification
```bash
curl -X POST http://localhost:3000/api/auth/verify-email \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"testuser@example.com\",\"code\":\"123456\"}"
```

**Expected Response:**
```json
{
  "message": "Email verified successfully!",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "fullName": "Test User",
    "email": "testuser@example.com",
    "emailVerified": true
  }
}
```

**Verify:**
- [ ] Database updated: `email_verified = true`
- [ ] JWT token received
- [ ] Verification code cleared

---

### 1.3 User Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"testuser@example.com\",\"password\":\"Test@123\"}"
```

**Expected Response:**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "fullName": "Test User",
    "email": "testuser@example.com"
  }
}
```

**Verify:**
- [ ] Valid JWT token received
- [ ] User data returned
- [ ] Token can be decoded at jwt.io

---

### 1.4 Get User Profile (Protected)
```bash
curl -X GET http://localhost:3000/api/user/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Expected Response:**
```json
{
  "id": 1,
  "fullName": "Test User",
  "email": "testuser@example.com",
  "mobile": "9876543210",
  "emailVerified": true,
  "subscriptionStatus": "inactive",
  "subscription": null
}
```

**Verify:**
- [ ] Without token: 401 Unauthorized
- [ ] With invalid token: 403 Forbidden
- [ ] With valid token: User data returned

---

### 1.5 Create Payment Order
```bash
curl -X POST http://localhost:3000/api/payment/create-order \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d "{\"packageName\":\"Basic\",\"amount\":15000}"
```

**Expected Response:**
```json
{
  "orderId": "order_xxxxxxxxxxxxx",
  "amount": 1500000,
  "currency": "INR",
  "keyId": "rzp_test_xxxxxxxxxxxxx"
}
```

**Verify:**
- [ ] Order created on Razorpay
- [ ] Amount in paise (15000 * 100)
- [ ] Key ID returned

---

### 1.6 Admin Login
```bash
curl -X POST http://localhost:3000/api/auth/admin-login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"satans@gmail.com\",\"password\":\"Satans123\"}"
```

**Expected Response:**
```json
{
  "message": "Admin login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "admin": {
    "email": "satans@gmail.com"
  }
}
```

**Verify:**
- [ ] Admin token received
- [ ] Wrong credentials rejected

---

### 1.7 Get All Users (Admin)
```bash
curl -X GET http://localhost:3000/api/admin/users \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

**Expected Response:**
```json
[
  {
    "id": 1,
    "full_name": "Test User",
    "email": "testuser@example.com",
    "mobile": "9876543210",
    "email_verified": true,
    "subscription_status": "inactive",
    "created_at": "2024-01-01T00:00:00.000Z"
  }
]
```

**Verify:**
- [ ] All users listed
- [ ] User token cannot access: 403 Forbidden

---

### 1.8 Submit Contact Form
```bash
curl -X POST http://localhost:3000/api/contact/submit \
  -H "Content-Type: application/json" \
  -d "{\"fullName\":\"John Doe\",\"email\":\"john@example.com\",\"mobile\":\"1234567890\",\"service\":\"Web Design\",\"message\":\"Interested in services\"}"
```

**Expected Response:**
```json
{
  "message": "Contact form submitted successfully!",
  "submissionId": 1
}
```

**Verify:**
- [ ] Data stored in database
- [ ] Status is 'pending'

---

## 2. Frontend User Interface Testing

### 2.1 Homepage
- [ ] Website loads without errors
- [ ] All sections visible (Hero, Services, Portfolio, Packages, Contact)
- [ ] Navigation menu works
- [ ] Smooth scrolling to sections
- [ ] Hamburger menu works on mobile
- [ ] All images load correctly
- [ ] Animations play smoothly

### 2.2 Login Modal
**Steps:**
1. Click "Login / Register" button
2. Enter email: testuser@example.com
3. Enter password: Test@123
4. Click "Login"

**Verify:**
- [ ] Modal opens correctly
- [ ] Form validation works
- [ ] Login successful message
- [ ] Modal closes
- [ ] Dashboard modal opens
- [ ] User menu appears in navbar
- [ ] Login button changes to user menu

### 2.3 Registration Modal
**Steps:**
1. Click "Login / Register"
2. Click "Sign Up" tab
3. Fill all fields:
   - Name: New User
   - Email: newuser@example.com
   - Mobile: 9999999999
   - Password: NewUser@123
4. Click "Register"

**Verify:**
- [ ] All fields required
- [ ] Email format validated
- [ ] Password strength validated (8+ chars, uppercase, number, special)
- [ ] Mobile number validated
- [ ] Registration successful
- [ ] Verification modal opens
- [ ] Verification email received

### 2.4 Email Verification
**Steps:**
1. Check email for code
2. Enter 6-digit code
3. Click "Verify"

**Verify:**
- [ ] Code format validated (6 digits)
- [ ] Correct code accepted
- [ ] Wrong code rejected
- [ ] Resend code works
- [ ] Success message shown
- [ ] Dashboard opens
- [ ] User is logged in

### 2.5 User Dashboard
**Steps:**
1. Login as verified user
2. Check dashboard content

**Verify:**
- [ ] User name displayed
- [ ] Email displayed
- [ ] Mobile displayed
- [ ] Subscription status shown
- [ ] "No Active Subscription" if none
- [ ] "View Packages" button works
- [ ] "Edit Profile" placeholder visible
- [ ] Logout button works

### 2.6 Payment Flow
**Steps:**
1. Login as user
2. Navigate to Packages section
3. Click "Get Started" on any package
4. Select "Pay with Razorpay"
5. Complete payment with test card

**Test Card Details:**
- Card: 4111 1111 1111 1111
- CVV: 123
- Expiry: 12/25

**Verify:**
- [ ] Payment modal opens
- [ ] Package details correct
- [ ] GST calculated (18%)
- [ ] Total amount correct
- [ ] Razorpay checkout opens
- [ ] Test card accepted
- [ ] Payment processes
- [ ] Success modal shows
- [ ] Receipt displayed
- [ ] Transaction ID shown
- [ ] Download receipt works
- [ ] Dashboard shows active subscription

### 2.7 Payment Receipt
**Steps:**
1. After successful payment
2. View receipt in success modal
3. Click "Download Receipt"

**Verify:**
- [ ] Receipt contains transaction ID
- [ ] Package name correct
- [ ] Amount correct
- [ ] Date shown
- [ ] User details included
- [ ] File downloads as .txt

### 2.8 Forgot Password
**Steps:**
1. Click "Login / Register"
2. Click "Forgot Password?"
3. Enter email
4. Click "Reset Password"

**Verify:**
- [ ] Email validated
- [ ] Reset email sent
- [ ] Success message shown
- [ ] Email contains reset link

### 2.9 Contact Form
**Steps:**
1. Navigate to Contact section
2. Fill form:
   - Name: Contact Test
   - Email: contact@test.com
   - Phone: 8888888888
   - Service: Web Design
   - Message: Test message
3. Click "Send Message"

**Verify:**
- [ ] All fields required
- [ ] Email validated
- [ ] Phone validated
- [ ] Success message shown
- [ ] Form resets
- [ ] Data in database

### 2.10 Admin Panel
**Steps:**
1. Click "Admin Login"
2. Email: satans@gmail.com
3. Password: Satans123
4. Click "Login"

**Verify:**
- [ ] Admin modal opens
- [ ] 4 tabs visible (Users, Subscriptions, Contacts, Packages)
- [ ] All tabs switch correctly

**Users Tab:**
- [ ] All users listed
- [ ] User details shown (name, email, mobile)
- [ ] Verification status badge
- [ ] Subscription status badge
- [ ] Registration date shown

**Subscriptions Tab:**
- [ ] All active subscriptions listed
- [ ] User details shown
- [ ] Package name shown
- [ ] Amount shown
- [ ] Start date shown
- [ ] Valid until date shown
- [ ] Transaction ID shown

**Contacts Tab:**
- [ ] All contact submissions listed
- [ ] Contact details shown
- [ ] Service requested shown
- [ ] Message shown
- [ ] Submission time shown
- [ ] Status badge shown

**Packages Tab:**
- [ ] All packages listed
- [ ] Package details shown
- [ ] Features listed
- [ ] Prices shown

---

## 3. Database Testing

### 3.1 User Table
```sql
-- Check user creation
SELECT * FROM users WHERE email = 'testuser@example.com';

-- Verify password is hashed
-- Should see: $2a$10$...

-- Check email verification
SELECT email_verified FROM users WHERE email = 'testuser@example.com';
-- Should be: true
```

### 3.2 Subscriptions Table
```sql
-- Check subscription creation
SELECT * FROM subscriptions WHERE user_id = 1;

-- Check active subscription view
SELECT * FROM active_subscriptions_view WHERE email = 'testuser@example.com';
```

### 3.3 Payment Receipts
```sql
-- Check receipt creation
SELECT * FROM payment_receipts ORDER BY created_at DESC;

-- Verify transaction ID is unique
SELECT transaction_id, COUNT(*) 
FROM payment_receipts 
GROUP BY transaction_id 
HAVING COUNT(*) > 1;
-- Should return 0 rows
```

### 3.4 Contact Submissions
```sql
-- Check contact submissions
SELECT * FROM contact_submissions ORDER BY submitted_at DESC;

-- Check pending contacts
SELECT COUNT(*) FROM contact_submissions WHERE status = 'pending';
```

### 3.5 Foreign Key Constraints
```sql
-- Try to create subscription with invalid user_id (should fail)
INSERT INTO subscriptions (user_id, package_name, amount, status) 
VALUES (999999, 'Test', 10000, 'active');
-- Should error: violates foreign key constraint

-- Try to delete user with subscriptions (should cascade)
DELETE FROM users WHERE id = 1;
-- Should also delete related subscriptions and receipts
```

---

## 4. Security Testing

### 4.1 Authentication
- [ ] Cannot access protected routes without token
- [ ] Invalid token rejected
- [ ] Expired token rejected
- [ ] Admin routes require admin token
- [ ] User token cannot access admin routes

### 4.2 Password Security
- [ ] Passwords stored as hashes
- [ ] Cannot login with wrong password
- [ ] Password strength enforced

### 4.3 SQL Injection
```bash
# Try SQL injection in login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"admin' OR '1'='1\",\"password\":\"anything\"}"

# Should fail with: Invalid credentials
```

### 4.4 XSS Protection
**Steps:**
1. Try entering `<script>alert('XSS')</script>` in contact form
2. Check admin panel

**Verify:**
- [ ] Script not executed
- [ ] Input sanitized/escaped

### 4.5 Payment Security
- [ ] Server verifies Razorpay signature
- [ ] Cannot create order with negative amount
- [ ] Cannot verify payment without valid signature

---

## 5. Email Testing

### 5.1 Registration Email
**Verify:**
- [ ] Email received within 1 minute
- [ ] Contains 6-digit code
- [ ] Code expires after 10 minutes
- [ ] Resend code generates new code

### 5.2 Password Reset Email
**Verify:**
- [ ] Email received
- [ ] Contains reset link
- [ ] Link expires after 1 hour

### 5.3 Payment Confirmation
**Verify:**
- [ ] Email sent after successful payment
- [ ] Contains transaction details
- [ ] Contains receipt

---

## 6. Performance Testing

### 6.1 Load Time
- [ ] Homepage loads < 2 seconds
- [ ] API responses < 500ms
- [ ] Database queries optimized with indexes

### 6.2 Concurrent Users
```bash
# Run 10 concurrent login requests
for i in {1..10}; do
  curl -X POST http://localhost:3000/api/auth/login \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"test@example.com\",\"password\":\"Test@123\"}" &
done
wait
```

**Verify:**
- [ ] All requests succeed
- [ ] No connection pool errors

---

## 7. Mobile Responsiveness

### Test on Different Screens:
- [ ] Mobile (375px)
- [ ] Tablet (768px)
- [ ] Desktop (1920px)

**Verify:**
- [ ] All sections adapt to screen size
- [ ] Modals work on mobile
- [ ] Forms usable on mobile
- [ ] Navigation menu collapses
- [ ] Hamburger menu works
- [ ] Touch events work

---

## 8. Browser Compatibility

### Test on Browsers:
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge

**Verify:**
- [ ] All features work
- [ ] Animations smooth
- [ ] No console errors

---

## 9. Error Handling

### 9.1 Network Errors
**Steps:**
1. Stop backend server
2. Try to login from frontend

**Verify:**
- [ ] Error message shown
- [ ] No crash
- [ ] User can retry

### 9.2 Invalid Data
**Steps:**
1. Try registering with invalid email format
2. Try empty form submission

**Verify:**
- [ ] Validation errors shown
- [ ] Clear error messages
- [ ] Form highlights problematic fields

### 9.3 Payment Failure
**Steps:**
1. Use test card: 4111 1111 1111 1234 (failure card)
2. Complete payment flow

**Verify:**
- [ ] Payment fails
- [ ] Error modal shown
- [ ] User can retry
- [ ] No subscription created

---

## 10. Edge Cases

### 10.1 Duplicate Registration
**Steps:**
1. Register with email: test@example.com
2. Try registering again with same email

**Verify:**
- [ ] Error: "Email already registered"
- [ ] Database integrity maintained

### 10.2 Expired Subscription
```sql
-- Manually expire a subscription
UPDATE subscriptions 
SET valid_until = NOW() - INTERVAL '1 day', 
    status = 'expired'
WHERE user_id = 1;
```

**Verify:**
- [ ] Dashboard shows "Expired"
- [ ] User can purchase new subscription

### 10.3 Multiple Subscriptions
**Steps:**
1. Purchase subscription
2. Try purchasing another while first is active

**Verify:**
- [ ] Can purchase (current implementation)
- [ ] All subscriptions tracked
- [ ] Most recent shown in dashboard

---

## 11. Production Readiness

### 11.1 Environment Variables
- [ ] All required variables in `.env`
- [ ] No hardcoded secrets in code
- [ ] `.env` in `.gitignore`

### 11.2 Error Logging
- [ ] Errors logged to console
- [ ] Production: Use proper logging service (Sentry)

### 11.3 Database Backups
```bash
# Create backup
pg_dump -U postgres satans_db > backup_$(date +%Y%m%d).sql

# Test restore
psql -U postgres -d satans_db_test < backup_20240101.sql
```

- [ ] Backup script works
- [ ] Restore successful

### 11.4 SSL/HTTPS
- [ ] Production uses HTTPS
- [ ] Certificate valid
- [ ] No mixed content warnings

---

## 12. Final Checklist

### Before Launch:
- [ ] All tests passed
- [ ] No console errors
- [ ] No database errors
- [ ] Email delivery working
- [ ] Payments processing
- [ ] Admin panel functional
- [ ] Documentation complete
- [ ] Security reviewed
- [ ] Performance optimized
- [ ] Backups configured
- [ ] Monitoring set up

---

## Testing Results Template

```
Test Date: _______________
Tester: _______________

Frontend Tests: ___/30 Passed
Backend Tests: ___/15 Passed
Database Tests: ___/5 Passed
Security Tests: ___/5 Passed
Email Tests: ___/3 Passed

Total: ___/58 Tests Passed

Issues Found:
1. _________________________
2. _________________________
3. _________________________

Critical Issues: ___
Major Issues: ___
Minor Issues: ___

Status: ☐ Ready for Production  ☐ Needs Fixes

Notes:
_______________________________
_______________________________
_______________________________
```

---

## 🎉 Test Complete!

If all tests pass, your application is ready for production deployment!

**Next Steps:**
1. Review DEPLOYMENT_CHECKLIST.md
2. Set up production environment
3. Deploy and monitor
4. Collect user feedback
