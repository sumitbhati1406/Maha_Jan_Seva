import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema({
  name: {
    en: { type: String, required: true },
    mr: { type: String, required: true },
    hi: { type: String, required: true }
  },
  description: {
    en: { type: String },
    mr: { type: String },
    hi: { type: String }
  },
  category: {
    type: String,
    enum: ['GST', 'PAN', 'Gazette', 'Aadhaar', 'Passport', 'ITR', 'Certificate', 'Registration', 'Other'],
    required: true
  },
  price: { type: Number, required: true },
  priceMax: { type: Number }, // for range pricing
  isOnCall: { type: Boolean, default: false },
  image: { type: String, default: '' },
  icon: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
  isNew: { type: Boolean, default: true },
  processingDays: { type: Number, default: 7 },
  requiredDocuments: [{
    name: { type: String },
    description: { type: String },
    isRequired: { type: Boolean, default: true }
  }],
  steps: [{
    order: Number,
    title: String,
    description: String
  }],
  serviceCode: { type: String, unique: true },
  totalApplications: { type: Number, default: 0 },
  order: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model('Service', serviceSchema);
