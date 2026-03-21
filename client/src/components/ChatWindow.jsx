import React, { useState, useEffect, useRef } from "react";
import { MoreVertical, Search, Phone, Video } from "lucide-react";
import { useChat } from "../context/ChatContext";
import API from "../services/api";
import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";

const ChatWindow = () => {
  const { user, selectedChat, socket, onlineUsers } = useChat();
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef();

  useEffect(() => {
    if (selectedChat) {
      const fetchMessages = async () => {
        try {
          const { data } = await API.get(`/messages/${selectedChat._id}/${user._id}`);
          setMessages(data);
        } catch (err) {
          console.error(err);
        }
      };
      fetchMessages();
    }
  }, [selectedChat, user._id]);

  useEffect(() => {
    if (socket) {
      socket.on("receive_message", (data) => {
        if (selectedChat && data.senderId === selectedChat._id) {
          setMessages((prev) => [...prev, data]);
        }
      });

      socket.on("display_typing", (data) => {
        if (selectedChat && data.senderId === selectedChat._id) {
          setIsTyping(true);
          setTimeout(() => setIsTyping(false), 3000);
        }
      });

      return () => {
        socket.off("receive_message");
        socket.off("display_typing");
      };
    }
  }, [socket, selectedChat]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (message) => {
    const messageData = {
      senderId: user._id,
      receiverId: selectedChat._id,
      message,
    };

    try {
      const { data } = await API.post("/messages", messageData);
      setMessages((prev) => [...prev, data]);
      socket.emit("send_message", data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleTyping = () => {
    socket.emit("typing", { senderId: user._id, receiverId: selectedChat._id });
  };

  if (!selectedChat) {
    return (
      <div className="flex-1 bg-whatsapp-dark flex flex-col items-center justify-center border-b-[6px] border-whatsapp-green">
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
          alt="WhatsApp"
          className="w-32 h-32 opacity-20 mb-8"
        />
        <h2 className="text-whatsapp-light text-2xl font-light">WhatsApp Web Clone</h2>
        <p className="text-whatsapp-gray text-sm mt-2">
          Send and receive messages without keeping your phone online.
        </p>
      </div>
    );
  }

  const isOnline = onlineUsers.includes(selectedChat._id);

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0b141a]">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-whatsapp-header h-[60px]">
        <div className="flex items-center">
          <img
            src={selectedChat.avatar}
            alt={selectedChat.username}
            className="w-10 h-10 rounded-full mr-4"
          />
          <div>
            <h3 className="text-white text-sm font-medium">
              {selectedChat.username}
            </h3>
            <p className="text-whatsapp-gray text-xs">
              {isTyping ? "typing..." : isOnline ? "online" : "offline"}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-6 text-whatsapp-gray">
          <Video className="w-5 h-5 cursor-pointer" />
          <Phone className="w-5 h-5 cursor-pointer" />
          <div className="w-[1px] h-6 bg-whatsapp-sidebar mx-2"></div>
          <Search className="w-5 h-5 cursor-pointer" />
          <MoreVertical className="w-5 h-5 cursor-pointer" />
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-repeat">
        {messages.map((msg, index) => (
          <MessageBubble
            key={msg._id || index}
            message={msg}
            isOwn={msg.senderId === user._id}
          />
        ))}
        <div ref={scrollRef}></div>
      </div>

      {/* Input */}
      <MessageInput onSend={handleSend} onTyping={handleTyping} />
    </div>
  );
};

export default ChatWindow;
