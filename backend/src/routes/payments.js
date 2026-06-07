const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const Razorpay = require('razorpay');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const { protect } = require('../middleware/auth');

let razorpay;
try {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
  });
} catch (e) {
  console.log('Razorpay not configured');
}

// @POST /api/payments/create-order - Create Razorpay order
router.post('/create-order', protect, async (req, res) => {
  try {
    const { amount } = req.body;
    if (!razorpay) return res.status(400).json({ success: false, message: 'Payment gateway not configured' });

    const options = {
      amount: Math.round(amount * 100), // in paise
      currency: 'INR',
      receipt: `mjs_${Date.now()}`,
      notes: { userId: req.user._id.toString(), userName: req.user.name }
    };
    const order = await razorpay.orders.create(options);
    res.json({ success: true, order, keyId: process.env.RAZORPAY_KEY_ID });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @POST /api/payments/verify - Verify Razorpay payment & credit wallet
router.post('/verify', protect, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, amount } = req.body;

    // Verify signature
    const expectedSig = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSig !== razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Payment verification failed' });
    }

    // Credit wallet
    const user = await User.findById(req.user._id);
    const prevBalance = user.walletBalance;
    user.walletBalance += Number(amount);
    await user.save();

    await Transaction.create({
      user: req.user._id, type: 'credit',
      amount: Number(amount), prevBalance, balance: user.walletBalance,
      description: 'Wallet Recharge via Razorpay',
      paymentMode: 'Razorpay',
      transactionId: razorpay_payment_id,
      orderId: razorpay_order_id,
      paymentSignature: razorpay_signature,
      status: 'success'
    });

    res.json({ success: true, message: 'Wallet recharged successfully', newBalance: user.walletBalance });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @POST /api/payments/upi-verify - Manual UPI verification (admin confirms)
router.post('/upi-initiate', protect, async (req, res) => {
  try {
    const { amount, mobile } = req.body;
    const orderId = `UPI${Date.now()}`;
    
    // Generate UPI deep link
    const upiId = process.env.UPI_ID || 'mahajanseva@upi';
    const upiName = process.env.UPI_NAME || 'MahaJanSeva';
    const upiLink = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(upiName)}&am=${amount}&cu=INR&tn=${encodeURIComponent('Wallet Recharge MahaJanSeva')}&tr=${orderId}`;
    
    // Create pending transaction
    const user = await User.findById(req.user._id);
    await Transaction.create({
      user: req.user._id, type: 'credit',
      amount: Number(amount), prevBalance: user.walletBalance, balance: user.walletBalance,
      description: 'Wallet Recharge via UPI (Pending)',
      paymentMode: 'UPI', orderId, status: 'pending',
      remark: `Mobile: ${mobile}`
    });

    res.json({ success: true, orderId, upiLink, upiId, amount });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @POST /api/payments/upi-confirm - Admin confirm UPI payment
router.post('/upi-confirm', protect, async (req, res) => {
  try {
    const { orderId, upiRef } = req.body;
    const txn = await Transaction.findOne({ orderId, status: 'pending' });
    if (!txn) return res.status(404).json({ success: false, message: 'Transaction not found' });

    const user = await User.findById(txn.user);
    const prevBalance = user.walletBalance;
    user.walletBalance += txn.amount;
    await user.save();

    txn.status = 'success';
    txn.balance = user.walletBalance;
    txn.prevBalance = prevBalance;
    txn.upiRef = upiRef;
    txn.description = 'Wallet Recharge via UPI';
    await txn.save();

    res.json({ success: true, message: 'UPI payment confirmed, wallet credited', newBalance: user.walletBalance });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
