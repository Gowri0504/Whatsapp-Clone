import React, { useState, useRef } from "react";
import { Smile, Paperclip, Mic, Send } from "lucide-react";
import EmojiPicker from "emoji-picker-react";

const MessageInput = ({ onSend, onTyping }) => {
  const [message, setMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const typingTimeoutRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim()) {
      onSend(message);
      setMessage("");
      setShowEmojiPicker(false);
    }
  };

  const handleChange = (e) => {
    setMessage(e.target.value);
    onTyping();

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      // Logic for stop typing if needed
    }, 2000);
  };

  const onEmojiClick = (emojiData) => {
    setMessage((prev) => prev + emojiData.emoji);
  };

  return (
    <div className="relative bg-whatsapp-header p-2 flex items-center space-x-2">
      {showEmojiPicker && (
        <div className="absolute bottom-16 left-4 z-50">
          <EmojiPicker
            onEmojiClick={onEmojiClick}
            theme="dark"
            width={300}
            height={400}
          />
        </div>
      )}

      <button
        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
        className="text-whatsapp-gray hover:text-white p-2"
      >
        <Smile className="w-6 h-6" />
      </button>
      <button className="text-whatsapp-gray hover:text-white p-2">
        <Paperclip className="w-6 h-6" />
      </button>

      <form onSubmit={handleSubmit} className="flex-1">
        <input
          type="text"
          placeholder="Type a message"
          className="w-full bg-whatsapp-sidebar border-none text-white rounded-lg px-4 py-2 focus:outline-none"
          value={message}
          onChange={handleChange}
        />
      </form>

      {message.trim() ? (
        <button
          onClick={handleSubmit}
          className="text-whatsapp-gray hover:text-white p-2"
        >
          <Send className="w-6 h-6" />
        </button>
      ) : (
        <button className="text-whatsapp-gray hover:text-white p-2">
          <Mic className="w-6 h-6" />
        </button>
      )}
    </div>
  );
};

export default MessageInput;
