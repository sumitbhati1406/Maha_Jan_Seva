const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['credit', 'debit', 'refund'], required: true },
  amount: { type: Number, required: true },
  balance: { type: Number, required: true }, // balance after transaction
  prevBalance: { type: Number, required: true },
  description: { type: String },
  serviceName: { type: String },
  serviceCharges: { type: Number, default: 0 },
  serviceFee: { type: Number, default: 0 },
  paymentMode: { type: String, enum: ['UPI', 'Cash', 'Wallet', 'Razorpay', 'QR'], default: 'UPI' },
  transactionId: { type: String },
  orderId: { type: String },
  paymentSignature: { type: String },
  application: { type: mongoose.Schema.Types.ObjectId, ref: 'Application' },
  status: { type: String, enum: ['pending', 'success', 'failed'], default: 'success' },
  upiRef: { type: String },
  remark: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);
