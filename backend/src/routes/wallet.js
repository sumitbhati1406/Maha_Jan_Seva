const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const { protect, adminOnly } = require('../middleware/auth');

// @GET /api/wallet/balance
router.get('/balance', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('walletBalance');
    res.json({ success: true, balance: user.walletBalance });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @GET /api/wallet/transactions - User's transactions
router.get('/transactions', protect, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const total = await Transaction.countDocuments({ user: req.user._id });
    const transactions = await Transaction.find({ user: req.user._id })
      .populate('application', 'tokenNo')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    res.json({ success: true, transactions, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @POST /api/wallet/admin-credit - Admin manually credit wallet
router.post('/admin-credit', protect, adminOnly, async (req, res) => {
  try {
    const { userId, amount, remark } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const prevBalance = user.walletBalance;
    user.walletBalance += Number(amount);
    await user.save();

    await Transaction.create({
      user: userId, type: 'credit',
      amount: Number(amount), prevBalance, balance: user.walletBalance,
      description: remark || 'Admin credit', paymentMode: 'Cash', status: 'success'
    });

    res.json({ success: true, message: 'Wallet credited', newBalance: user.walletBalance });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
