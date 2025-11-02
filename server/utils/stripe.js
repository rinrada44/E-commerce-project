require('dotenv').config(); // Load environment variables from .env file
const Stripe = require('stripe');

let stripeInstance;

function initializeStripe() {
  // Return cached instance if available
  if (stripeInstance) return stripeInstance;

  const stripeSecretKey = process.env.STRIPE_SECRET_KEY?.trim();

  if (!stripeSecretKey) {
    console.error('Stripe secret key not found in environment variables');
    throw new Error('Stripe secret key is missing');
  }

  // Validate secret key format
  if (!/^sk_(live|test)_/.test(stripeSecretKey)) {
    throw new Error('Invalid Stripe secret key format');
  }

  // Initialize and cache Stripe instance
  stripeInstance = new Stripe(stripeSecretKey, {
    apiVersion: '2022-11-15', // เลือกเวอร์ชันล่าสุดตาม Stripe docs
  });

  return stripeInstance;
}

module.exports = initializeStripe;
