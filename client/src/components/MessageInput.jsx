import React, { useState, useRef, useEffect, memo } from "react";
import { Smile, Paperclip, Mic, Send } from "lucide-react";
import EmojiPicker from "emoji-picker-react";
import API from "../services/api";

const MessageInput = ({ onSend, onTyping }) => {
  const [message, setMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const inputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [emojiPickerRef]);

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
    const { selectionStart, selectionEnd } = inputRef.current;
    const text = message.slice(0, selectionStart) + emojiData.emoji + message.slice(selectionEnd);
    setMessage(text);
    inputRef.current.focus();
    inputRef.current.selectionStart = inputRef.current.selectionEnd = selectionStart + emojiData.emoji.length;
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    setIsUploading(true);
    try {
      const { data } = await API.post("/messages/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      onSend(data.url, file.type.startsWith('image') ? 'image' : 'audio');
    } catch (err) {
      console.error("File upload failed:", err);
      alert("File upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="relative bg-whatsapp-header p-2 flex items-center space-x-2">
      {showEmojiPicker && (
        <div className="absolute bottom-16 left-4 z-50" ref={emojiPickerRef}>
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
      <button 
        className="text-whatsapp-gray hover:text-white p-2"
        onClick={() => fileInputRef.current.click()}
        disabled={isUploading}
      >
        {isUploading ? <div className="w-6 h-6 border-t-2 border-whatsapp-green rounded-full animate-spin"></div> : <Paperclip className="w-6 h-6" />}
      </button>
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        className="hidden" 
        accept="image/*,audio/*"
      />

      <form onSubmit={handleSubmit} className="flex-1">
        <label htmlFor="message-input" className="sr-only">Type a message</label>
        <input
          id="message-input"
          name="message-input"
          type="text"
          placeholder="Type a message"
          className="w-full bg-whatsapp-sidebar border-none text-white rounded-lg px-4 py-2 focus:outline-none"
          value={message}
          onChange={handleChange}
          ref={inputRef}
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

export default memo(MessageInput);
