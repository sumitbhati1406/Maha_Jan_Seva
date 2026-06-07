const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Application = require('../models/Application');
const Service = require('../models/Service');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const { protect, adminOnly } = require('../middleware/auth');

// @GET /api/applications/my
router.get('/my', protect, async (req, res) => {
  try {
    const applications = await Application.find({ user: req.user._id })
      .populate('service', 'name category image')
      .sort({ createdAt: -1 });
    res.json({ success: true, applications });
  } catch (err) {
    console.error('MY APPLICATIONS ERROR:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

// @POST /api/applications
router.post('/', protect, async (req, res) => {
  try {
    const { serviceId, formData, documents, signature, language } = req.body;

    const service = await Service.findById(serviceId);
    if (!service) return res.status(404).json({ success: false, message: 'Service not found' });

    const user = await User.findById(req.user._id);
    const totalAmount = service.price || 0;

    // On Call / Free - skip wallet
    if (service.isOnCall || totalAmount === 0) {
      const app = await Application.create({
        user: req.user._id,
        service: serviceId,
        formData: formData || {},
        documents: documents || [],
        signature: signature || '',
        language: language || 'mr',
        payment: { amount: 0, serviceCharges: 0, serviceFee: 0, status: 'Paid', paidAt: new Date() }
      });
      await Service.findByIdAndUpdate(serviceId, { $inc: { totalApplications: 1 } });
      const populated = await Application.findById(app._id).populate('service', 'name category image');
      req.io?.to('admin_room').emit('new_application', { application: populated });
      return res.status(201).json({ success: true, message: 'Application submitted successfully', application: populated });
    }

    // Check wallet
    if (user.walletBalance < totalAmount) {
      return res.status(400).json({ success: false, message: 'Insufficient wallet balance. Please recharge.' });
    }

    // Create application first
    const prevBalance = user.walletBalance;
    const app = await Application.create({
      user: req.user._id,
      service: serviceId,
      formData: formData || {},
      documents: documents || [],
      signature: signature || '',
      language: language || 'mr',
      payment: {
        amount: totalAmount,
        serviceCharges: Math.round(totalAmount * 0.7),
        serviceFee: Math.round(totalAmount * 0.3),
        status: 'Paid',
        paidAt: new Date()
      }
    });

    // Then deduct wallet
    user.walletBalance -= totalAmount;
    await user.save();

    // Record transaction
    await Transaction.create({
      user: req.user._id,
      type: 'debit',
      amount: totalAmount,
      prevBalance,
      balance: user.walletBalance,
      description: `Service: ${service.name.en}`,
      serviceName: service.name.en,
      serviceCharges: Math.round(totalAmount * 0.7),
      serviceFee: Math.round(totalAmount * 0.3),
      paymentMode: 'Wallet',
      application: app._id
    });

    await Service.findByIdAndUpdate(serviceId, { $inc: { totalApplications: 1 } });

    const populated = await Application.findById(app._id).populate('service', 'name category image');
    req.io?.to('admin_room').emit('new_application', { application: populated });

    res.status(201).json({ success: true, message: 'Application submitted successfully', application: populated });
  } catch (err) {
    console.error('APPLICATION ERROR:', err.message);
    console.error('STACK:', err.stack);
    res.status(500).json({ success: false, message: err.message });
  }
});

// @GET /api/applications/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const app = await Application.findById(req.params.id)
      .populate('service')
      .populate('user', 'name email phone');
    if (!app) return res.status(404).json({ success: false, message: 'Application not found' });
    if (app.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    res.json({ success: true, application: app });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @PUT /api/applications/:id/status - Admin
router.put('/:id/status', protect, adminOnly, async (req, res) => {
  try {
    const { status, adminRemarks, completedFile } = req.body;
    const app = await Application.findByIdAndUpdate(req.params.id,
      { status, adminRemarks, completedFile, ...(status === 'Done - Completed' ? { completedAt: new Date() } : {}) },
      { new: true }
    ).populate('user', 'name email phone').populate('service', 'name');

    if (status === 'Refunded') {
      const user = await User.findById(app.user._id);
      const prevBalance = user.walletBalance;
      user.walletBalance += app.payment.amount;
      await user.save();
      await Transaction.create({
        user: app.user._id, type: 'refund',
        amount: app.payment.amount, prevBalance, balance: user.walletBalance,
        description: `Refund: ${app.service.name.en}`, paymentMode: 'Wallet',
        application: app._id
      });
    }

    req.io?.to(app.user._id.toString()).emit('application_updated', { application: app });
    res.json({ success: true, message: 'Status updated', application: app });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @GET /api/applications - Admin all
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const { status, page = 1, limit = 20, search } = req.query;
    let query = {};
    if (status) query.status = status;
    if (search) query.$or = [{ tokenNo: { $regex: search, $options: 'i' } }];
    const total = await Application.countDocuments(query);
    const applications = await Application.find(query)
      .populate('user', 'name email phone')
      .populate('service', 'name category')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    res.json({ success: true, applications, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
