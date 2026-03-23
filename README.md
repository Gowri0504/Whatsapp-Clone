# 🟢 WhatsApp Web Clone - Production Ready

A high-performance, feature-complete WhatsApp Web clone built with the **MERN Stack**, **Socket.IO**, and **Redis**. This project is designed for scalability and provides a zero-latency messaging experience with an authentic WhatsApp UI.

---

## 🚀 Key Features

- **Real-time Messaging**: Instant message delivery using Socket.IO with fallback mechanisms.
- **File & Image Sharing**: Integrated Cloudinary support for uploading and previewing media.
- **Presence & Status**: Real-time online/offline status tracking and "Last Seen" timestamps.
- **Typing Indicators**: Live "typing..." feedback for a more interactive experience.
- **Advanced Search**: Debounced search for filtering contacts and searching within message histories.
- **Message Pagination**: Infinite scroll for efficient loading of large chat histories (20 messages per page).
- **Emoji Support**: Integrated emoji picker for expressive communication.
- **Optimistic UI**: Messages appear instantly before server confirmation for a lag-free feel.
- **Group Chats**: Create and manage multi-user conversations with custom group info.
- **Status Stories**: 24-hour disappearing status updates similar to the original app.

---

## 🛠️ Tech Stack

- **Frontend**: [React.js](https://reactjs.org/) (Vite), [Tailwind CSS](https://tailwindcss.com/), [Zustand](https://zustand-demo.pmnd.rs/), [Lucide React](https://lucide.dev/)
- **Backend**: [Node.js](https://nodejs.org/), [Express.js](https://expressjs.com/), [Socket.IO](https://socket.io/)
- **Database**: [MongoDB](https://www.mongodb.com/) (Mongoose)
- **Real-time/Scaling**: [Redis](https://redis.io/) (Architecture-ready for horizontal scaling)
- **Storage**: [Cloudinary](https://cloudinary.com/) (via Multer)
- **Auth**: [JWT](https://jwt.io/) (JSON Web Tokens)

---

## 📂 Project Structure

```text
WhatsApp-Clone/
├── client/                # Frontend React Application
│   ├── src/
│   │   ├── components/    # Modular UI Components (Chat, Sidebar, etc.)
│   │   ├── hooks/         # Custom React Hooks (useDebounce, etc.)
│   │   ├── services/      # API Services & Axios Config
│   │   ├── store/         # Zustand State Management
│   │   └── assets/        # Static images and icons
├── server/                # Backend Node.js API
│   ├── config/            # DB & Middleware configurations
│   ├── controllers/       # Business logic for routes
│   ├── middleware/        # Authentication & Error handling
│   ├── models/            # Mongoose Schemas (User, Message, Chat)
│   ├── routes/            # API Endpoints
│   └── public/            # Static file uploads (Local fallback)
└── TESTING.md             # Detailed step-by-step testing guide
```

---

## ⚙️ Local Setup Instructions

### 1. Prerequisites
- **Node.js** (v18 or higher)
- **MongoDB** (Local instance or Atlas URI)
- **Redis** (Optional: required only for multi-instance scaling)

### 2. Backend Configuration
1. Navigate to the server directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables:
   - Create a `.env` file based on `.env.example`.
   - Add your `MONGO_URI`, `JWT_SECRET`, and `CLOUDINARY` credentials.
4. Start the server:
   ```bash
   npm start
   ```
   *Note: The server will automatically seed two demo users (Alice & Bob) if the database is empty.*

### 3. Frontend Configuration
1. Navigate to the client directory:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🔒 Environment Variables (`server/.env`)

| Variable | Description | Default |
| :--- | :--- | :--- |
| `PORT` | Backend server port | `5000` |
| `MONGO_URI` | MongoDB Connection String | `REQUIRED` |
| `JWT_SECRET` | Secret key for JWT signing | `REQUIRED` |
| `REDIS_URL` | Redis Connection URL | `redis://localhost:6379` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary Cloud Name | `OPTIONAL` |
| `CLOUDINARY_API_KEY` | Cloudinary API Key | `OPTIONAL` |
| `CLOUDINARY_API_SECRET` | Cloudinary API Secret | `OPTIONAL` |

---

## 📸 Screenshots

*(Add your screenshots here for visual demonstration)*
- **Chat Interface**: Clean, authentic dark mode layout.
- **Sidebar Search**: Dynamic filtering of contacts.
- **File Sharing**: Seamless image/audio previews in chat.

---

## 🧪 Testing

For a detailed walkthrough of all features and how to verify them, please refer to the [TESTING.md](TESTING.md) file in the root directory.
