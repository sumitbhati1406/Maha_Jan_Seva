const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  tokenNo: { type: String, unique: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
  status: {
    type: String,
    enum: ['Pending', 'In Process', 'Done - Completed', 'Rejected', 'Cancelled', 'Refunded'],
    default: 'Pending'
  },
  formData: { type: mongoose.Schema.Types.Mixed, default: {} },
  documents: [{
    name: String,
    url: String,
    type: String,
    uploadedAt: { type: Date, default: Date.now }
  }],
  signature: { type: String, default: '' },
  payment: {
    amount: { type: Number, required: true },
    serviceCharges: { type: Number, default: 0 },
    serviceFee: { type: Number, default: 0 },
    status: { type: String, enum: ['Pending', 'Paid', 'Refunded'], default: 'Pending' },
    transactionId: { type: String },
    paidAt: { type: Date }
  },
  completedFile: { type: String },
  remarks: { type: String },
  adminRemarks: { type: String },
  language: { type: String, enum: ['en', 'mr', 'hi'], default: 'mr' },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  completedAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

applicationSchema.pre('save', async function(next) {
  if (!this.tokenNo) {
    const now = new Date();
    const yy = String(now.getFullYear()).slice(-2);
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const random = Math.floor(1000 + Math.random() * 9000);
    this.tokenNo = `MJS${yy}${mm}${dd}${random}`;
  }
  next();
});

module.exports = mongoose.model('Application', applicationSchema);