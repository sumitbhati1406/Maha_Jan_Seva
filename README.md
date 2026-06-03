# 🏛️ MahaJanSeva — महाजन सेवा Portal

A full-stack MERN application for Maharashtra government services (GST, PAN, Gazette, Aadhaar, Passport, ITR, Certificates, and more), with multilingual support (English / मराठी / हिंदी), AI chatbot, UPI & Razorpay payments, admin panel, and real-time chat.

---

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + Tailwind CSS |
| Backend | Node.js + Express.js |
| Database | MongoDB Atlas (Mongoose) |
| Auth | JWT (JSON Web Tokens) |
| Payments | Razorpay + UPI QR |
| File Upload | Cloudinary |
| Real-time | Socket.IO |
| AI Chatbot | Anthropic Claude API |
| State | Zustand |
| Animation | Framer Motion |

---

## 📁 Project Structure

```
MahaJanSeva/
├── backend/
│   ├── src/
│   │   ├── models/         # MongoDB schemas
│   │   ├── routes/         # API endpoints
│   │   ├── middleware/      # Auth middleware
│   │   └── utils/          # Seeder & helpers
│   ├── .env.example
│   └── package.json
└── frontend/
    ├── src/
    │   ├── pages/
    │   │   ├── user/       # User panel pages
    │   │   └── admin/      # Admin panel pages
    │   ├── components/     # Shared components
    │   ├── context/        # Zustand stores
    │   └── utils/          # API client
    ├── .env.example
    └── package.json
```

---

## ⚙️ Setup Instructions

### 1. Clone / Extract the project

### 2. Backend Setup

```bash
cd backend
cp .env.example .env
# Fill in all values in .env (see below)
npm install
npm run seed       # Creates admin user + seeds 23 services
npm run dev        # Start dev server on port 5000
```

### 3. Frontend Setup

```bash
cd frontend
cp .env.example .env
# Fill in VITE_ variables
npm install
npm run dev        # Start on port 5173
```

---

## 🔑 Environment Variables

### Backend `.env`

```env
PORT=5000
NODE_ENV=development

# MongoDB Atlas Cluster URI
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster0.xxxxx.mongodb.net/mahajanseva

# JWT
JWT_SECRET=your_long_random_secret_here
JWT_EXPIRE=30d

# Razorpay (from razorpay.com dashboard)
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_secret_here

# UPI (your UPI ID for QR payments)
UPI_ID=yourname@upi
UPI_NAME=MahaJanSeva

# Cloudinary (cloudinary.com → dashboard)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email (Gmail App Password)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your@gmail.com
EMAIL_PASS=your_app_password

# Admin Credentials (created by seeder)
ADMIN_EMAIL=admin@mahajanseva.com
ADMIN_PASSWORD=Admin@123456
ADMIN_NAME=Super Admin

# Anthropic API (for AI chatbot)
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxxxxxxx

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173
```

### Frontend `.env`

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
VITE_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxxxxx
VITE_APP_NAME=MahaJanSeva
VITE_UPI_ID=yourname@upi
VITE_UPI_NAME=MahaJanSeva
```

---

## 🔐 Default Admin Credentials

After running `npm run seed`:

- **Email:** admin@mahajanseva.com  
- **Password:** Admin@123456

> ⚠️ Change these immediately after first login!

---

## 📱 Features

### User Panel
- Register/Login with JWT auth
- Browse 23+ government services (GST, PAN, Gazette, Passport, ITR, Certificates, etc.)
- Submit applications with document uploads & signature capture
- Wallet system with Razorpay & UPI recharge
- Ledger / transaction history
- Application tracking with status updates
- AI chatbot (Claude-powered) for service queries
- Live chat with admin support
- Multilingual: English, मराठी, हिंदी
- Profile management

### Admin Panel
- Dashboard with stats + revenue charts
- Manage all applications (update status, upload completed docs)
- User management (view, activate/deactivate, credit wallet)
- Service management (add, edit, toggle active)
- All transactions view
- Live chat with users

---

## 🛠️ API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register user |
| POST | /api/auth/login | Login |
| GET | /api/auth/me | Get logged-in user |
| GET | /api/services | List services |
| POST | /api/services | Create service (admin) |
| POST | /api/applications | Submit application |
| GET | /api/applications/my | User's applications |
| PUT | /api/applications/:id/status | Update status (admin) |
| POST | /api/payments/create-order | Razorpay order |
| POST | /api/payments/verify | Verify & credit wallet |
| POST | /api/payments/upi-initiate | UPI QR payment |
| GET | /api/wallet/transactions | Transaction history |
| POST | /api/chat/ai | AI chatbot |
| GET | /api/admin/dashboard | Admin stats |
| GET | /api/admin/users | All users |

---

## 📦 Build for Production

```bash
# Backend
cd backend
npm start

# Frontend
cd frontend
npm run build
# Serve dist/ with nginx or any static host
```

---

## 🌐 Deployment Tips

- **MongoDB Atlas**: Use a cluster, whitelist your server IP
- **Backend**: Deploy to Railway, Render, or any Node host
- **Frontend**: Deploy to Vercel, Netlify, or serve via nginx
- **Set NODE_ENV=production** in backend env
- Update `FRONTEND_URL` in backend env to your production domain
- Update `VITE_API_URL` in frontend env to your backend URL

---

## 📞 Support Contact

- **Email:** support@mahajanseva.com
- **Phone:** +91 98765 43210

---

*Built with ❤️ for Maharashtra citizens*
