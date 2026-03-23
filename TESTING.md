# Testing Documentation

This document provides step-by-step instructions for testing the MERN WhatsApp Web clone.

## 1. Start the backend server

Navigate to the `server` directory and run the following command:

```bash
npm start
```

## 2. Start the frontend development server

Navigate to the `client` directory and run the following command:

```bash
npm run dev
```

## 3. Login with two different users

Open two separate browser windows or tabs and navigate to the application. Register and log in with two different user accounts.

## 4. Test messaging

- Select a user from the sidebar to start a chat.
- Send and receive text messages.
- Verify that the messages are displayed correctly in the chat window.

## 5. Test real-time updates

- With both users logged in, send messages back and forth.
- Verify that the messages appear in real-time without needing to refresh the page.

## 6. Test typing indicator

- While one user is typing, verify that the other user sees a "typing..." indicator.

## 7. Test file upload

- Click the paperclip icon to upload an image or audio file.
- Verify that the file is uploaded and displayed correctly in the chat window.
- Test with invalid file types to ensure they are rejected.

## 8. Test emoji picker

- Click the emoji icon to open the emoji picker.
- Select an emoji and verify that it is inserted into the message input.
- Verify that the emoji is displayed correctly in the sent message.

## 9. Test search

- Use the search bar in the sidebar to filter users.
- Use the search bar in the chat window to search for messages.
- Verify that the search results are accurate and that the matched text is highlighted.

## 10. Test pagination

- In a chat with a long history, scroll to the top of the message list.
- Verify that older messages are loaded automatically.

## 11. Test error handling

- Try to send an empty message.
- Try to upload a file that is too large or has an invalid file type.
- Verify that appropriate error messages are displayed.
