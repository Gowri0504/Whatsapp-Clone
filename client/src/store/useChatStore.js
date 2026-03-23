import { create } from "zustand";
import { io } from "socket.io-client";

const useChatStore = create((set, get) => ({
  selectedChat: null,
  chats: [],
  onlineUsers: [],
  socket: null,
  messages: [],
  isLoadingMessages: false,

  setSelectedChat: (chat) => set({ selectedChat: chat, messages: [] }),
  setChats: (chats) => set({ chats }),
  setOnlineUsers: (users) => set({ onlineUsers: users }),
  setMessages: (messages) => {
    if (Array.isArray(messages)) {
      set({ messages });
    } else {
      console.error("setMessages received a non-array value:", messages);
      set({ messages: [] }); // Fallback to empty array
    }
  },
  
  // Optimistic Message Update
  addMessage: (message) => set((state) => ({ 
    messages: [...state.messages, message] 
  })),

  initSocket: (userId) => {
    const socket = io("http://localhost:5000");
    socket.emit("join", userId);
    
    socket.on("getOnlineUsers", (users) => {
      set({ onlineUsers: users });
    });

    socket.on("receive_message", (data) => {
      const { selectedChat } = get();
      if (selectedChat && (data.senderId === selectedChat._id || data.chatId === selectedChat._id)) {
        set((state) => ({ messages: [...state.messages, data] }));
      }
    });

    socket.on("message_seen", (data) => {
      set((state) => ({
        messages: state.messages.map((msg) =>
          msg._id === data.messageId ? { ...msg, status: "seen" } : msg
        ),
      }));
    });

    set({ socket });
  },

  disconnectSocket: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      set({ socket: null });
    }
  },
}));

export default useChatStore;
