# 🧪 Final Test Script & Verification Guide

Follow these steps to verify that the WhatsApp Web Clone is fully functional and ready for production.

---

## 1. Environment Setup
- Ensure MongoDB is running.
- Ensure the backend `.env` is configured correctly.
- Start the backend: `cd server && npm start`.
- Start the frontend: `cd client && npm run dev`.

## 2. Multi-User Simulation (Real-time Test)
1. **Open Two Browser Windows**: 
   - Window A: [http://localhost:5173](http://localhost:5173)
   - Window B: [http://localhost:5173](http://localhost:5173) (Incognito or different browser recommended).
2. **Login/Register**:
   - Window A: Login as `alice@example.com` (Password: `password123`).
   - Window B: Login as `bob@example.com` (Password: `password123`).
   *Note: These demo users are auto-created if they don't exist.*

## 3. Real-time Messaging & Presence
- **Online Status**: Verify that Alice sees Bob as "online" and vice versa.
- **Send Message**: Send a message from Alice to Bob. It should appear instantly in Bob's window without a refresh.
- **Typing Indicator**: Start typing in Alice's window; verify that Bob sees "typing..." in the chat header.
- **Read Receipts**: Verify that the checkmarks turn blue when the message is viewed.

## 4. Media & Expressive Features
- **File Upload**: 
  - Click the **Paperclip icon** in Alice's chat.
  - Upload an image or audio file.
  - Verify that a loading spinner appears, and the media renders correctly in both chat bubbles once uploaded.
- **Emoji Picker**:
  - Click the **Smile icon**.
  - Select multiple emojis and insert them into the text.
  - Verify they render correctly in the sent message.

## 5. Search & Discovery
- **Sidebar Search**: Type "Bob" in Alice's sidebar search. Verify that the contact list filters dynamically (Debounced 300ms).
- **Message Search**: 
  - Open the search bar in the chat header.
  - Search for a specific word sent previously.
  - Verify that the message history is filtered and the matched text is highlighted.

## 6. Pagination & History
- **Scroll Pagination**: 
  - If the chat has more than 20 messages, scroll to the top.
  - Verify that a "Loading..." indicator appears and older messages are appended smoothly without duplicating or losing scroll position.

## 7. Error Handling & Edge Cases
- **Invalid Upload**: Try uploading a `.pdf` or a very large file. Verify that a user-friendly error message appears.
- **Empty Message**: Try clicking send with no text. Verify that no empty message is sent.
- **Offline Mode**: Briefly stop the backend server. Verify that the app handles the disconnection gracefully.
