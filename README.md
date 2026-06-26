# 🏥 MediCare Connect - Backend API

MediCare Connect Backend is a secure RESTful API built with Node.js, Express.js, MongoDB, and JWT Authentication. It powers the MediCare Connect healthcare platform by handling authentication, doctor management, appointments, payments, prescriptions, and administrative operations.

---

# 🌐 Live API

**Backend API:** https://your-backend-url.onrender.com

---

# 🔗 Repository

**Server Repository:** https://github.com/YOUR_USERNAME/medicare-connect-server

**Client Repository:** https://github.com/YOUR_USERNAME/medicare-connect-client

---

# 🚀 Features

- JWT Authentication
- Better Auth Integration
- Google OAuth Login
- Role-Based Authorization
- Doctor Management
- Appointment Management
- Review Management
- Prescription Management
- Stripe Payment Integration
- Payment Webhook
- Admin Management
- Search, Sorting & Pagination
- MongoDB Database
- Secure REST API
- Helmet Security
- Rate Limiter
- CORS Protection
- Environment Variable Support

---

# 🛠️ Technology Stack

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- Better Auth
- Stripe
- bcryptjs
- Helmet
- Express Rate Limit
- CORS
- dotenv

---

# 📂 Folder Structure

```
src/
│
├── config/
├── controllers/
├── middlewares/
├── models/
├── routes/
├── utils/
├── services/
├── app.js
└── server.js
```

---

# ⚙️ Installation

Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/medicare-connect-server.git
```

Install dependencies

```bash
npm install
```

Run development server

```bash
npm run dev
```

Run production

```bash
npm start
```

---

# 🔑 Environment Variables

Create a `.env` file and configure the following:

```env
PORT=5000

NODE_ENV=development

MONGODB_URI=

JWT_SECRET=

JWT_EXPIRES_IN=7d

BETTER_AUTH_SECRET=

BETTER_AUTH_URL=

GOOGLE_CLIENT_ID=

GOOGLE_CLIENT_SECRET=

STRIPE_SECRET_KEY=

STRIPE_WEBHOOK_SECRET=

CLIENT_URL=
```

---

# 📡 API Endpoints

## Authentication

- POST `/api/auth/register`
- POST `/api/auth/login`
- POST `/api/auth/google`

## Doctors

- GET `/api/doctors`
- GET `/api/doctors/:id`
- POST `/api/doctors`
- PATCH `/api/doctors/:id`

## Appointments

- GET `/api/appointments`
- POST `/api/appointments`
- PATCH `/api/appointments/:id`
- DELETE `/api/appointments/:id`

## Reviews

- GET `/api/reviews`
- POST `/api/reviews`
- PATCH `/api/reviews/:id`
- DELETE `/api/reviews/:id`

## Prescriptions

- GET `/api/prescriptions`
- POST `/api/prescriptions`
- PATCH `/api/prescriptions/:id`

## Payments

- POST `/api/payments/create-payment-intent`
- POST `/api/payments/webhook`

---

# 🔒 Security

- JWT Authentication
- Better Auth
- Google OAuth
- Password Hashing (bcryptjs)
- Helmet
- CORS
- Express Rate Limit
- Protected Routes
- Role-Based Access
- Environment Variables

---

# 🚀 Deployment

## Frontend

- Vercel

## Backend

- Render

## Database

- MongoDB Atlas

---

# 👨‍💻 Author

Developed by **YOUR NAME**
