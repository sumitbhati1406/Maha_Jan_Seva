import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  phone: { type: String, required: true },
  password: { type: String, required: true, minlength: 6, select: false },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  avatar: { type: String, default: '' },
  walletBalance: { type: Number, default: 0 },
  address: {
    street: String,
    city: String,
    district: String,
    state: { type: String, default: 'Maharashtra' },
    pincode: String
  },
  aadhaar: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
  isVerified: { type: Boolean, default: false },
  otp: { type: String },
  otpExpiry: { type: Date },
  preferredLanguage: { type: String, enum: ['en', 'mr', 'hi'], default: 'mr' },
  lastLogin: { type: Date },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Hash password before save
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Virtual for full address
userSchema.virtual('fullAddress').get(function() {
  const a = this.address;
  return [a.street, a.city, a.district, a.state, a.pincode].filter(Boolean).join(', ');
});

export default mongoose.model('User', userSchema);
