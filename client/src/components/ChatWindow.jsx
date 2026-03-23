import React, { useState, useEffect, useRef } from "react";
import { MoreVertical, Search, Phone, Video, PhoneCall } from "lucide-react";
import useChatStore from "../store/useChatStore";
import useAuthStore from "../store/useAuthStore";
import API from "../services/api";
import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";
import SkeletonLoader from "./SkeletonLoader";
import useDebounce from "../hooks/useDebounce";

const ChatWindow = () => {
  const { user } = useAuthStore();
  const { selectedChat, socket, onlineUsers, setSelectedChat, messages, setMessages, addMessage, callUser } = useChatStore();

  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const scrollRef = useRef();
  const messageContainerRef = useRef();

  const fetchMessages = async (pageNum) => {
    const token = localStorage.getItem("token") || localStorage.getItem("userInfo");
    if (!selectedChat?._id || !user?._id || !token) return;
    
    // Use a lock to prevent duplicate fetch calls for the same page
    if (isLoadingMessages) return;

    // For Channels, we don't use pagination for now as it's a simple internal array
    if (selectedChat.isChannel) {
      if (pageNum > 1) return; // No pagination for channels yet
      setIsLoadingMessages(true);
      try {
        const { data } = await API.get(`/channels/${selectedChat._id}/messages`);
        const incomingMessages = Array.isArray(data) ? data.map(msg => ({
          ...msg,
          senderId: typeof msg.senderId === 'object' ? msg.senderId._id : msg.senderId
        })) : [];
        setMessages(incomingMessages);
        setHasMore(false);
      } catch (err) {
        console.error("Fetch channel messages error:", err);
      } finally {
        setIsLoadingMessages(false);
      }
      return;
    }

    if (!hasMore) return;
    setIsLoadingMessages(true);
    try {
      const { data } = await API.get(`/messages/${selectedChat._id}/${user._id}?page=${pageNum}&limit=20`);
      const incomingMessages = Array.isArray(data) ? data : [];
      
      if (incomingMessages.length === 0) {
        setHasMore(false);
      } else {
        setMessages(prev => {
          const safePrev = Array.isArray(prev) ? prev : [];
          // Prepend older messages while maintaining deduplication
          return [...incomingMessages, ...safePrev];
        });
        setPage(pageNum + 1);
      }
    } catch (err) {
      console.error("Fetch messages error:", err);
      alert("Error fetching messages. Please try again.");
    } finally {
      setIsLoadingMessages(false);
    }
  };

  useEffect(() => {
    if (selectedChat?._id) {
      setMessages(() => []);
      setPage(1);
      setHasMore(true);
      fetchMessages(1);
    }
  }, [selectedChat?._id, user?._id]);

  useEffect(() => {
    const container = messageContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      // Logic for infinite scroll
      if (container.scrollTop === 0 && !isLoadingMessages && hasMore) {
        const oldScrollHeight = container.scrollHeight;
        fetchMessages(page).then(() => {
          // Maintain scroll position after prepending messages
          requestAnimationFrame(() => {
            if (container) {
              container.scrollTop = container.scrollHeight - oldScrollHeight;
            }
          });
        });
      }
    };
    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [page, isLoadingMessages, hasMore, selectedChat?._id]);

  useEffect(() => {
    if (!socket || !selectedChat?._id) return;

    const handleReceiveMessage = (data) => {
      if (data && (data.senderId === selectedChat._id || (selectedChat.isChannel && data.channelId === selectedChat._id))) {
        setMessages((prev) => {
          const safePrev = Array.isArray(prev) ? prev : [];
          if (safePrev.some(msg => msg?._id === data._id)) return safePrev;
          return [...safePrev, data];
        });
        
        if (!selectedChat.isChannel) {
          socket.emit("mark_seen", {
            messageId: data._id,
            senderId: data.senderId,
            receiverId: user?._id,
          });
        }
      }
    };

    const handleReceiveChannelMessage = (data) => {
      if (selectedChat.isChannel && data.channelId === selectedChat._id) {
        setMessages((prev) => {
          const safePrev = Array.isArray(prev) ? prev : [];
          if (safePrev.some(msg => msg?._id === data._id)) return safePrev;
          return [...safePrev, data];
        });
      }
    };

    const handleDisplayTyping = (data) => {
      if (data && data.senderId === selectedChat._id) {
        setIsTyping(true);
        setTimeout(() => setIsTyping(false), 3000);
      }
    };

    const handleMessageSeen = (data) => {
      if (!data?.messageId) return;
      setMessages((prev) =>
        (Array.isArray(prev) ? prev : []).map((msg) =>
          msg?._id === data.messageId ? { ...msg, status: "seen" } : msg
        )
      );
    };

    socket.off("receive_message", handleReceiveMessage);
    socket.off("receive_channel_message", handleReceiveChannelMessage);
    socket.off("display_typing", handleDisplayTyping);
    socket.off("message_seen", handleMessageSeen);

    socket.on("receive_message", handleReceiveMessage);
    socket.on("receive_channel_message", handleReceiveChannelMessage);
    socket.on("display_typing", handleDisplayTyping);
    socket.on("message_seen", handleMessageSeen);

    return () => {
      socket.off("receive_message", handleReceiveMessage);
      socket.off("receive_channel_message", handleReceiveChannelMessage);
      socket.off("display_typing", handleDisplayTyping);
      socket.off("message_seen", handleMessageSeen);
    };
  }, [socket, selectedChat?._id, user?._id]);

  useEffect(() => {
    if (messages.length > 0 && page === 2) { // Only scroll on initial load
      requestAnimationFrame(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
      });
    }
  }, [messages.length, page]);

  const handleSend = async (message, type = "text") => {
    if (!selectedChat?._id || !user?._id) return;
    
    const optimisticMessage = {
      _id: `temp-${Date.now()}`,
      senderId: user._id,
      receiverId: selectedChat._id,
      message: message || "",
      type,
      status: "sending",
      createdAt: new Date().toISOString(),
    };

    setMessages(prev => [...(Array.isArray(prev) ? prev : []), optimisticMessage]);

    try {
      const endpoint = selectedChat.isChannel 
        ? `/channels/${selectedChat._id}/messages` 
        : "/messages";
      
      const payload = selectedChat.isChannel
        ? { message, type }
        : { senderId: user._id, receiverId: selectedChat._id, message, type };

      const { data } = await API.post(endpoint, payload);
      
      if (data?._id) {
        const normalizedData = {
          ...data,
          senderId: typeof data.senderId === 'object' ? data.senderId._id : data.senderId
        };
        setMessages(prev => 
          (Array.isArray(prev) ? prev : []).map(msg => 
            msg._id === optimisticMessage._id ? normalizedData : msg
          )
        );
        if (!selectedChat.isChannel) {
          socket.emit("send_message", normalizedData);
        } else {
          // Channel real-time messages could be implemented here with a room join
          socket.emit("channel_message", { ...normalizedData, channelId: selectedChat._id });
        }
      }
    } catch (err) {
      console.error("Send message error:", err);
      alert("Error sending message. Please try again.");
      setMessages(prev => (Array.isArray(prev) ? prev : []).filter(msg => msg._id !== optimisticMessage._id));
    }
  };

  const handleTyping = () => {
    if (socket && selectedChat?._id && user?._id) {
      socket.emit("typing", { senderId: user._id, receiverId: selectedChat._id });
    }
  };

  const filteredMessages = (Array.isArray(messages) ? messages : []).filter(msg => {
    const msgText = msg?.message || "";
    return msgText.toLowerCase().includes((debouncedSearchTerm || "").toLowerCase());
  });

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

  const isOnline = onlineUsers.includes(selectedChat?._id);

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0b141a]">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-whatsapp-header h-[60px]">
        <div className="flex items-center">
          <img
            src={selectedChat?.avatar}
            alt={selectedChat?.username}
            className="w-10 h-10 rounded-full mr-4"
          />
          <div>
            <h3 className="text-white text-sm font-medium">
              {selectedChat?.username}
            </h3>
            <p className="text-whatsapp-gray text-xs">
              {isTyping ? "typing..." : isOnline ? "online" : "offline"}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-6 text-whatsapp-gray relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-whatsapp-gray" />
            <input 
              type="text"
              placeholder="Search..."
              className="bg-whatsapp-sidebar rounded-lg pl-10 pr-4 py-1.5 text-sm text-white focus:outline-none w-48 transition-all duration-300 focus:w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Video className="w-5 h-5 cursor-pointer hover:text-white" onClick={() => callUser(selectedChat._id)} />
          <Phone className="w-5 h-5 cursor-pointer hover:text-white" onClick={() => callUser(selectedChat._id)} />
          <div className="w-[1px] h-6 bg-whatsapp-sidebar mx-2"></div>
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
      <div ref={messageContainerRef} className="flex-1 overflow-y-auto p-4 space-y-2 bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-repeat">
        {isLoadingMessages && <div className="text-center text-white">Loading...</div>}
        {!isLoadingMessages && filteredMessages.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-whatsapp-gray">
              <p>No messages yet</p>
              <p className="text-xs">Send a message to start the conversation</p>
            </div>
          </div>
        )}
        {(Array.isArray(filteredMessages) ? filteredMessages : []).map((msg, index) => (
          <MessageBubble
            key={msg?._id || index}
            message={msg}
            isOwn={msg?.senderId === user?._id}
            searchTerm={debouncedSearchTerm}
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
