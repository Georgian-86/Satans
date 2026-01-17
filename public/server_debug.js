const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const path = require('path');
require('dotenv').config();

// DEBUG: Log environment variables on startup (remove in production)
console.log('Environment Check:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('DB_HOST:', process.env.DB_HOST ? 'SET' : 'NOT SET');
console.log('DB_USER:', process.env.DB_USER ? 'SET' : 'NOT SET');
console.log('DB_NAME:', process.env.DB_NAME ? 'SET' : 'NOT SET');
console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? 'SET' : 'NOT SET');
console.log('DB_PORT:', process.env.DB_PORT || 'NOT SET');

const pool = require('./config/database');
