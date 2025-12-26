# SatAns Backend Setup Guide

## Prerequisites

1. **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
2. **PostgreSQL** (v12 or higher) - [Download](https://www.postgresql.org/download/)
3. **Razorpay Account** - [Sign up](https://razorpay.com/)

## Installation Steps

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup PostgreSQL Database

```bash
# Login to PostgreSQL
psql -U postgres

# Create database and tables
\i database.sql

# Or run directly
npm run setup-db
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` and add your credentials:

```env
# Database
DB_USER=postgres
DB_HOST=localhost
DB_NAME=satans_db
DB_PASSWORD=your_postgres_password
DB_PORT=5432

# Razorpay (Get from Razorpay Dashboard)
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_secret

# Email (Gmail App Password)
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-16-digit-app-password

# JWT Secret
JWT_SECRET=your-random-secret-key-here
```

### 4. Get Razorpay Credentials

1. Go to [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. Navigate to Settings → API Keys
3. Generate Test/Live keys
4. Copy **Key ID** and **Key Secret** to `.env`

### 5. Setup Gmail for Emails

1. Enable 2-Factor Authentication on Gmail
2. Go to [App Passwords](https://myaccount.google.com/apppasswords)
3. Generate app password for "Mail"
4. Copy 16-digit password to `.env`

### 6. Start the Server

```bash
# Development mode (auto-restart)
npm run dev

# Production mode
npm start
```

Server will run on: `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/verify-email` - Verify email with code
- `POST /api/auth/resend-code` - Resend verification code
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/admin-login` - Admin login

### User
- `GET /api/user/profile` - Get user profile (requires auth)

### Payment
- `POST /api/payment/create-order` - Create Razorpay order
- `POST /api/payment/verify` - Verify payment and activate subscription
- `GET /api/payment/receipt/:transactionId` - Get receipt

### Contact
- `POST /api/contact/submit` - Submit contact form

### Admin
- `GET /api/admin/users` - Get all users
- `GET /api/admin/subscriptions` - Get all subscriptions
- `GET /api/admin/contacts` - Get all contact submissions
- `GET /api/admin/notifications` - Get admin notifications

## Database Schema

### Tables
1. **users** - User accounts
2. **subscriptions** - Active subscriptions
3. **payment_receipts** - Payment records
4. **contact_submissions** - Contact form data
5. **admin_notifications** - Admin notifications

## Testing Razorpay Integration

### Test Cards
- **Success**: 4111 1111 1111 1111
- **Failure**: 4111 1111 1111 1112

Any CVV, future expiry date

## Security Notes

⚠️ **IMPORTANT FOR PRODUCTION:**

1. Change `JWT_SECRET` to a strong random string
2. Use HTTPS only
3. Enable Razorpay webhook verification
4. Set up proper CORS origins
5. Use environment-specific configs
6. Enable rate limiting
7. Add input validation
8. Use prepared statements (already implemented)
9. Enable PostgreSQL SSL
10. Regular security audits

## Admin Credentials

- **Email**: satans@gmail.com
- **Password**: Satans123

## Troubleshooting

### Database Connection Issues
```bash
# Check PostgreSQL is running
pg_isready

# Reset database
dropdb satans_db
createdb satans_db
psql -U postgres -d satans_db -f database.sql
```

### Port Already in Use
```bash
# Change PORT in .env file
PORT=3001
```

### Email Not Sending
- Verify Gmail app password
- Check 2FA is enabled
- Allow less secure app access if needed

## Support

For issues, contact: satans@gmail.com
