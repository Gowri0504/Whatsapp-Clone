# WhatsApp Web Clone - FAANG Level Implementation

A production-grade, horizontally scalable WhatsApp Web clone built with the MERN stack, Socket.IO, and Redis. This project demonstrates high-level system design, performance optimizations, and clean architecture.

## 🚀 System Architecture
- **Horizontal Scaling**: Uses Redis Pub/Sub to synchronize Socket.IO events across multiple server instances.
- **Optimistic UI**: Messages are rendered instantly on the sender's screen before the database confirms persistence.
- **Persistence**: MongoDB with optimized compound indexes for fast message retrieval.
- **State Management**: Zustand for high-performance, boilerplate-free global state.
- **File Storage**: Cloudinary integration for scalable image and file sharing.

## 🛠️ Technology Stack
- **Frontend**: React (Vite), Tailwind CSS, Zustand, Socket.IO Client.
- **Backend**: Node.js, Express, Socket.IO, Mongoose.
- **Caching/Scaling**: Redis (Architecture-ready).
- **Storage**: Cloudinary (Multer).
- **Auth**: JWT with HTTP-only tokens.

## ✨ Advanced Features
- **Real-time Messaging**: Instant delivery via WebSockets.
- **Optimistic UI**: Zero-latency messaging experience.
- **Message Status**: Sent (✔), Delivered (✔✔), Seen (✔✔ blue).
- **Presence Tracking**: Real-time online/offline status and "Last Seen".
- **Typing Indicators**: Live "typing..." feedback.
- **Group Chats**: Create and manage multi-user conversations.
- **Status Updates**: 24-hour disappearing stories.
- **Infinite Scroll**: Efficient message pagination (20 per page).

## 📦 Project Structure
```text
whatsapp-clone/
├── server/
│   ├── controllers/   # Business logic
│   ├── models/        # Database schemas with indexes
│   ├── routes/        # API endpoints
│   ├── sockets/       # Socket.IO event handlers
│   ├── config/        # Environment and DB config
│   └── middleware/    # Auth and error handling
└── client/
    ├── src/
    │   ├── components/# Modular UI components
    │   ├── store/     # Zustand state stores
    │   ├── services/  # API services (Axios)
    │   └── pages/     # Routed views
```

## ⚙️ Setup Instructions

### 1. Prerequisites
- Node.js (v18+)
- MongoDB (Running locally or Atlas)
- Redis (Optional, for scaling)

### 2. Backend Setup
```bash
cd server
npm install
cp .env.example .env # Add your MongoDB and Cloudinary credentials
npm run dev
```

### 3. Frontend Setup
```bash
cd client
npm install
npm run dev
```

## 🔒 Environment Variables

Create a `.env` file in the `server` directory and add the following variables:

```
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
REDIS_URL=your_redis_url
```

## 📈 Performance & Scalability
- **Database Indexing**: Compound indexes on `chatId` and `createdAt`.
- **Zustand Store**: Prevents unnecessary re-renders compared to Context API.
- **Message Pagination**: Prevents browser memory issues with large histories.
- **Socket Rooms**: Efficient message broadcasting limited to active participants.
