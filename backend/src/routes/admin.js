const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Application = require('../models/Application');
const Transaction = require('../models/Transaction');
const Service = require('../models/Service');
const { protect, adminOnly } = require('../middleware/auth');

// All admin routes require admin auth
router.use(protect, adminOnly);

// @GET /api/admin/dashboard - Stats
router.get('/dashboard', async (req, res) => {
  try {
    const [totalUsers, totalApplications, pendingApplications, completedApplications] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      Application.countDocuments(),
      Application.countDocuments({ status: 'Pending' }),
      Application.countDocuments({ status: 'Done - Completed' })
    ]);

    const revenueAgg = await Transaction.aggregate([
      { $match: { type: 'debit', status: 'success' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalRevenue = revenueAgg[0]?.total || 0;

    const recentApplications = await Application.find()
      .populate('user', 'name email')
      .populate('service', 'name')
      .sort({ createdAt: -1 }).limit(10);

    const monthlyStats = await Application.aggregate([
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          count: { $sum: 1 },
          revenue: { $sum: '$payment.amount' }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 6 }
    ]);

    res.json({
      success: true,
      stats: { totalUsers, totalApplications, pendingApplications, completedApplications, totalRevenue },
      recentApplications,
      monthlyStats: monthlyStats.reverse()
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @GET /api/admin/users
router.get('/users', async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    let query = { role: 'user' };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }
    const total = await User.countDocuments(query);
    const users = await User.find(query).sort({ createdAt: -1 })
      .skip((page - 1) * limit).limit(Number(limit));
    res.json({ success: true, users, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @PUT /api/admin/users/:id/toggle
router.put('/users/:id/toggle', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    user.isActive = !user.isActive;
    await user.save();
    res.json({ success: true, message: `User ${user.isActive ? 'activated' : 'deactivated'}`, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @GET /api/admin/transactions
router.get('/transactions', async (req, res) => {
  try {
    const { page = 1, limit = 30 } = req.query;
    const total = await Transaction.countDocuments();
    const transactions = await Transaction.find()
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit).limit(Number(limit));
    res.json({ success: true, transactions, total });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
