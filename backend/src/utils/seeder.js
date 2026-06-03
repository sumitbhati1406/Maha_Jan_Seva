require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Service = require('../models/Service');

const services = [
  { name: { en: 'GST Zero(Nil) Monthly Return', mr: 'GST झिरो फायलिंग', hi: 'GST जीरो फाइलिंग' }, category: 'GST', price: 250, serviceCode: 'GST001', isNew: true, order: 1, description: { en: 'File GST nil return for zero sales month', mr: 'शून्य विक्री महिन्यासाठी GST निल रिटर्न', hi: 'शून्य बिक्री महीने के लिए GST निल रिटर्न' }, requiredDocuments: [{ name: 'GST Username & Password', isRequired: true }, { name: 'Previous Month Return', isRequired: false }] },
  { name: { en: 'GST Filing below 20 Sale Bills', mr: 'GST फायलिंग 20 सेल्स बिलापर्यंत', hi: 'GST फाइलिंग 20 बिल तक' }, category: 'GST', price: 350, serviceCode: 'GST002', isNew: true, order: 2, requiredDocuments: [{ name: 'GST Username & Password', isRequired: true }, { name: 'All Sales Bills', isRequired: true }, { name: 'Purchase Bills', isRequired: true }] },
  { name: { en: 'GST Filing below 50 Sale Bills', mr: 'GST फायलिंग 50 सेल्स बिलापर्यंत', hi: 'GST फाइलिंग 50 बिल तक' }, category: 'GST', price: 500, serviceCode: 'GST003', isNew: true, order: 3 },
  { name: { en: 'GST Filing 51+ Sale Bills', mr: 'GST फायलिंग 51+ सेल्स बिल', hi: 'GST फाइलिंग 51+ बिल' }, category: 'GST', price: 0, isOnCall: true, serviceCode: 'GST004', isNew: true, order: 4 },
  { name: { en: 'NSDL PAN Card (New)', mr: 'NSDL पॅन कार्ड (नवीन)', hi: 'NSDL पैन कार्ड (नया)' }, category: 'PAN', price: 107, serviceCode: 'PAN001', isNew: false, order: 10, requiredDocuments: [{ name: 'Aadhaar Card', isRequired: true }, { name: 'Birth Certificate / 10th Marksheet', isRequired: true }, { name: 'Passport Size Photo', isRequired: true }, { name: 'Signature (on white paper)', isRequired: true }] },
  { name: { en: 'PAN Card Correction', mr: 'पॅन कार्ड दुरुस्ती', hi: 'पैन कार्ड सुधार' }, category: 'PAN', price: 107, serviceCode: 'PAN002', isNew: false, order: 11 },
  { name: { en: 'Gazette Name Change', mr: 'गॅझेट नाव बदल', hi: 'गजट नाम परिवर्तन' }, category: 'Gazette', price: 849, serviceCode: 'GAZ001', isNew: false, order: 20, requiredDocuments: [{ name: 'Aadhaar Card', isRequired: true }, { name: 'Old Name Proof', isRequired: true }, { name: 'Passport Size Photo', isRequired: true }, { name: 'Affidavit', isRequired: false }] },
  { name: { en: 'Gazette Birth Date Change', mr: 'गॅझेट जन्मतारीख बदल', hi: 'गजट जन्मतिथि परिवर्तन' }, category: 'Gazette', price: 849, priceMax: 1648, serviceCode: 'GAZ002', isNew: true, order: 21 },
  { name: { en: 'Aadhaar Reprint', mr: 'आधार रिप्रिंट', hi: 'आधार रिप्रिंट' }, category: 'Aadhaar', price: 75, serviceCode: 'AAD001', isNew: true, order: 30 },
  { name: { en: 'Lost Aadhaar Card', mr: 'हरवलेले आधार कार्ड', hi: 'खोया आधार कार्ड' }, category: 'Aadhaar', price: 0, isOnCall: true, serviceCode: 'AAD002', isNew: true, order: 31 },
  { name: { en: 'Passport Renewal', mr: 'पासपोर्ट नूतनीकरण', hi: 'पासपोर्ट नवीनीकरण' }, category: 'Passport', price: 1750, serviceCode: 'PASS001', isNew: true, order: 40, requiredDocuments: [{ name: 'Old Passport', isRequired: true }, { name: 'Aadhaar Card', isRequired: true }, { name: 'Passport Size Photo (6 nos)', isRequired: true }] },
  { name: { en: 'EPF Claim', mr: 'EPF दावा', hi: 'EPF दावा' }, category: 'Registration', price: 299, serviceCode: 'EPF001', isNew: true, order: 50 },
  { name: { en: 'INCOMETAX Filing Salaried', mr: 'आयकर फायलिंग पगारदार', hi: 'आयकर फाइलिंग वेतनभोगी' }, category: 'ITR', price: 450, serviceCode: 'ITR001', isNew: true, order: 60 },
  { name: { en: 'ITR Filing Business', mr: 'ITR फायलिंग बिझनेस', hi: 'ITR फाइलिंग व्यवसाय' }, category: 'ITR', price: 699, serviceCode: 'ITR002', isNew: true, order: 61 },
  { name: { en: 'Caste Certificate', mr: 'जात प्रमाणपत्र', hi: 'जाति प्रमाण पत्र' }, category: 'Certificate', price: 299, serviceCode: 'CERT001', isNew: true, order: 70 },
  { name: { en: 'Caste Validity Certificate', mr: 'जात वैधता प्रमाणपत्र', hi: 'जाति वैधता प्रमाण पत्र' }, category: 'Certificate', price: 249, serviceCode: 'CERT002', isNew: true, order: 71 },
  { name: { en: 'Domicile Certificate', mr: 'अधिवास प्रमाणपत्र', hi: 'निवास प्रमाण पत्र' }, category: 'Certificate', price: 199, serviceCode: 'CERT003', isNew: true, order: 72 },
  { name: { en: 'Maratha Caste Certificate', mr: 'मराठा जात प्रमाणपत्र', hi: 'मराठा जाति प्रमाण पत्र' }, category: 'Certificate', price: 349, serviceCode: 'CERT004', isNew: true, order: 73 },
  { name: { en: 'Nursing Registration', mr: 'नर्सिंग रजिस्ट्रेशन', hi: 'नर्सिंग पंजीकरण' }, category: 'Registration', price: 649, serviceCode: 'REG001', isNew: true, order: 80 },
  { name: { en: 'Divyaang Card (Disability)', mr: 'दिव्यांग कार्ड', hi: 'दिव्यांग कार्ड' }, category: 'Certificate', price: 149, serviceCode: 'CERT005', isNew: true, order: 81 },
  { name: { en: 'Pharmacist Registration', mr: 'फार्मसिस्ट रजिस्ट्रेशन', hi: 'फार्मासिस्ट पंजीकरण' }, category: 'Registration', price: 0, isOnCall: true, serviceCode: 'REG002', isNew: true, order: 82 },
  { name: { en: 'Shop Act License Renewal', mr: 'शॉप ऍक्ट लायसन्स रिन्युअल', hi: 'शॉप एक्ट लाइसेंस नवीनीकरण' }, category: 'Registration', price: 499, serviceCode: 'REG003', isNew: true, order: 90 },
  { name: { en: 'Udyog Aadhaar Update', mr: 'उद्योग आधार अपडेट', hi: 'उद्योग आधार अपडेट' }, category: 'Registration', price: 299, serviceCode: 'REG004', isNew: true, order: 91 }
];

async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Create admin
    const adminExists = await User.findOne({ email: process.env.ADMIN_EMAIL || 'admin@mahajanseva.com' });
    if (!adminExists) {
      await User.create({
        name: process.env.ADMIN_NAME || 'Super Admin',
        email: process.env.ADMIN_EMAIL || 'admin@mahajanseva.com',
        phone: '9999999999',
        password: process.env.ADMIN_PASSWORD || 'Admin@123456',
        role: 'admin',
        walletBalance: 10000,
        isActive: true,
        isVerified: true
      });
      console.log('✅ Admin user created');
      console.log(`   Email: ${process.env.ADMIN_EMAIL || 'admin@mahajanseva.com'}`);
      console.log(`   Password: ${process.env.ADMIN_PASSWORD || 'Admin@123456'}`);
    }

    // Seed services
    await Service.deleteMany({});
    await Service.insertMany(services);
    console.log(`✅ ${services.length} services seeded`);

    console.log('🌱 Database seeded successfully!');
  } catch (err) {
    console.error('Seeder error:', err);
    throw err;
  }
}

// Run directly: node seeder.js
if (require.main === module) {
  seedDatabase().then(() => process.exit(0)).catch(() => process.exit(1));
}

module.exports = { seedDatabase };
