# 💕 HeartSync - Dating App

A full-stack dating app built with Next.js, Node.js, MongoDB, and Socket.io.

## Project Structure

```
dating-app/
├── frontend/        # Next.js + Tailwind CSS
└── backend/         # Node.js + Express + MongoDB
```

## Prerequisites

- Node.js v18+
- MongoDB (local or Atlas)
- AWS account (for S3 photo uploads)

---

## 🚀 Getting Started

### 1. Backend Setup

```bash
cd backend
npm install
```

Edit `.env` with your MongoDB URI, JWT secret, and AWS credentials.

```bash
npm run dev
```

Backend runs on http://localhost:5000

---

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on http://localhost:3000

---

## 🔑 Features

- ✅ User registration & login (JWT auth)
- ✅ Profile setup with photos, bio, interests
- ✅ Swipe left/right with drag gestures
- ✅ Super like
- ✅ Match system (mutual likes)
- ✅ Real-time chat with Socket.io
- ✅ Typing indicators
- ✅ Photo upload to AWS S3
- ✅ Rate limiting & security headers
- ✅ Responsive dark UI

---

## 🌐 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login |
| GET | /api/auth/me | Get current user |
| PUT | /api/users/profile | Update profile |
| POST | /api/users/upload-photo | Upload photo to S3 |
| GET | /api/matches/discover | Get profiles to swipe |
| POST | /api/matches/swipe | Swipe left or right |
| POST | /api/matches/superlike | Super like a profile |
| GET | /api/matches | Get all matches |
| GET | /api/messages/:matchId | Get messages |
| POST | /api/messages/:matchId | Send message |

---

## ☁️ AWS Services Used

- **S3** - Profile photo storage
- **EC2 / Elastic Beanstalk** - App hosting (production)
- **RDS / DocumentDB** - Database (production)
- **CloudFront** - CDN for photos

---

## 🛡️ Security Features

- Password hashing with bcrypt
- JWT authentication
- Rate limiting (100 req/15min)
- Helmet.js security headers
- Input validation with express-validator
- File type & size validation for uploads

---

## 📦 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, React 18, Tailwind CSS |
| Animations | Framer Motion |
| Backend | Node.js, Express |
| Database | MongoDB + Mongoose |
| Real-time | Socket.io |
| Auth | JWT + bcrypt |
| Storage | AWS S3 |
| Icons | React Icons |
