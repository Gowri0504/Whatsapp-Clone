import React, { useState, useEffect, useRef } from "react";
import { MoreVertical, Search, Phone, Video } from "lucide-react";
import useChatStore from "../store/useChatStore";
import useAuthStore from "../store/useAuthStore";
import API from "../services/api";
import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";
import SkeletonLoader from "./SkeletonLoader";

const ChatWindow = () => {
  const { user } = useAuthStore();
  const { selectedChat, socket, onlineUsers, setSelectedChat, messages, setMessages, addMessage } = useChatStore();

  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const scrollRef = useRef();

  useEffect(() => {
    if (selectedChat) {
      const fetchMessages = async () => {
        setIsLoadingMessages(true);
        try {
          const { data } = await API.get(`/messages/${selectedChat._id}/${user._id}`);
          setMessages(data);
        } catch (err) {
          console.error(err);
        } finally {
          setIsLoadingMessages(false);
        }
      };
      fetchMessages();
    }
  }, [selectedChat, user._id, setMessages]);

  useEffect(() => {
    if (socket) {
      socket.on("receive_message", (data) => {
        if (selectedChat && data.senderId === selectedChat._id) {
          setMessages((prev) => [...prev, data]);
          // Mark as seen if chat is open
          socket.emit("mark_seen", {
            messageId: data._id,
            senderId: data.senderId,
            receiverId: user._id,
          });
        }
      });

      socket.on("display_typing", (data) => {
        if (selectedChat && data.senderId === selectedChat._id) {
          setIsTyping(true);
          setTimeout(() => setIsTyping(false), 3000);
        }
      });

      socket.on("message_seen", (data) => {
        setMessages((prev) =>
          prev.map((msg) =>
            msg._id === data.messageId ? { ...msg, status: "seen" } : msg
          )
        );
      });

      return () => {
        socket.off("receive_message");
        socket.off("display_typing");
        socket.off("message_seen");
      };
    }
  }, [socket, selectedChat]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (message) => {
    const optimisticMessage = {
      _id: Date.now().toString(),
      senderId: user._id,
      receiverId: selectedChat._id,
      message,
      status: "sent",
      createdAt: new Date().toISOString(),
    };

    addMessage(optimisticMessage);

    try {
      const { data } = await API.post("/messages", {
        senderId: user._id,
        receiverId: selectedChat._id,
        message,
      });
      // Replace optimistic message with actual data if needed, or just update status
      socket.emit("send_message", data);
    } catch (err) {
      console.error(err);
      // Remove optimistic message on error if desired
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
        <div className="flex items-center space-x-6 text-whatsapp-gray relative">
          <Video className="w-5 h-5 cursor-pointer hover:text-white" />
          <Phone className="w-5 h-5 cursor-pointer hover:text-white" />
          <div className="w-[1px] h-6 bg-whatsapp-sidebar mx-2"></div>
          <Search className="w-5 h-5 cursor-pointer hover:text-white" />
          <div className="relative">
            <MoreVertical 
              className="w-5 h-5 cursor-pointer hover:text-white" 
              onClick={() => setShowMenu(!showMenu)}
            />
            {showMenu && (
              <div className="absolute right-0 top-8 w-48 bg-whatsapp-header shadow-xl rounded-lg py-2 z-[60]">
                {[
                  { label: "Contact info", onClick: () => setShowMenu(false) },
                  { label: "Select messages", onClick: () => setShowMenu(false) },
                  { label: "Close chat", onClick: () => { setSelectedChat(null); setShowMenu(false); } },
                  { label: "Mute notifications", onClick: () => setShowMenu(false) },
                  { label: "Disappearing messages", onClick: () => setShowMenu(false) },
                  { label: "Clear chat", onClick: () => { setMessages([]); setShowMenu(false); } },
                  { label: "Delete chat", onClick: () => { setSelectedChat(null); setShowMenu(false); } },
                ].map((item, i) => (
                  <div 
                    key={i} 
                    className="px-4 py-2 hover:bg-whatsapp-sidebar cursor-pointer text-whatsapp-light text-sm"
                    onClick={item.onClick}
                  >
                    {item.label}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-repeat">
        {isLoadingMessages ? (
          <SkeletonLoader type="message" />
        ) : (
          messages.map((msg, index) => (
            <MessageBubble
              key={msg._id || index}
              message={msg}
              isOwn={msg.senderId === user._id}
            />
          ))
        )}
        <div ref={scrollRef}></div>
      </div>

      {/* Input */}
      <MessageInput onSend={handleSend} onTyping={handleTyping} />
    </div>
  );
};

export default ChatWindow;
