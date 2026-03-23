import { create } from "zustand";
import { io } from "socket.io-client";
import Peer from "simple-peer";

const ICE_SERVERS = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
];

const useChatStore = create((set, get) => ({
  selectedChat: null,
  chats: [],
  onlineUsers: [],
  socket: null,
  messages: [],
  isLoadingMessages: false,

  // Call State
  call: {
    isReceivingCall: false,
    from: null,
    name: "",
    avatar: "",
    signal: null,
  },
  callAccepted: false,
  callEnded: false,
  stream: null,
  myVideo: { current: null },
  userVideo: { current: null },
  connectionRef: { current: null },

  setSocket: (socket) => {
    set({ socket });
    if (socket) {
      socket.on("incoming_call", ({ from, name, avatar, signal }) => {
        set({ 
          call: { isReceivingCall: true, from, name, avatar, signal } 
        });
      });
      socket.on("call_ended", () => {
        const { stream, connectionRef } = get();
        if (connectionRef.current) connectionRef.current.destroy();
        if (stream) stream.getTracks().forEach(track => track.stop());
        set({ 
          call: { isReceivingCall: false, from: null, name: "", avatar: "", signal: null },
          callAccepted: false,
          callEnded: true,
          stream: null
        });
        setTimeout(() => set({ callEnded: false }), 3000);
      });
    }
  },

  // Call Actions
  callUser: async (id) => {
    const { socket, userVideo, myVideo } = get();
    const currentUser = JSON.parse(localStorage.getItem("userInfo"));
    
    if (!currentUser) return console.error("User not found");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      set({ stream });
      if (myVideo.current) myVideo.current.srcObject = stream;

      const peer = new Peer({
        initiator: true,
        trickle: false,
        stream,
        config: { iceServers: ICE_SERVERS }
      });

      peer.on("signal", (data) => {
        socket.emit("call_user", {
          userToCall: id,
          signalData: data,
          from: currentUser._id,
          name: currentUser.username,
          avatar: currentUser.avatar
        });
      });

      peer.on("stream", (currentStream) => {
        if (userVideo.current) userVideo.current.srcObject = currentStream;
      });

      peer.on("connect", () => console.log("Peer connected"));
      peer.on("error", (err) => {
        console.error("Peer error:", err);
        get().leaveCall();
      });
      peer.on("close", () => get().leaveCall());

      socket.off("call_accepted");
      socket.on("call_accepted", (signal) => {
        set({ callAccepted: true });
        if (peer && !peer.destroyed) {
          peer.signal(signal);
        }
      });

      set({ connectionRef: { current: peer } });
    } catch (err) {
      console.error("Failed to get local stream", err);
      alert("Call failed: Could not access camera/microphone");
    }
  },

  answerCall: async () => {
    const { socket, call, userVideo, myVideo } = get();
    if (!call.signal) return;
    set({ callAccepted: true });

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      set({ stream });
      if (myVideo.current) myVideo.current.srcObject = stream;

      const peer = new Peer({
        initiator: false,
        trickle: false,
        stream,
        config: { iceServers: ICE_SERVERS }
      });

      peer.on("signal", (data) => {
        socket.emit("answer_call", { signal: data, to: call.from });
      });

      peer.on("stream", (currentStream) => {
        if (userVideo.current) userVideo.current.srcObject = currentStream;
      });

      peer.on("connect", () => console.log("Peer connected"));
      peer.on("error", (err) => {
        console.error("Peer error:", err);
        get().leaveCall();
      });
      peer.on("close", () => get().leaveCall());

      peer.signal(call.signal);
      set({ connectionRef: { current: peer } });
    } catch (err) {
      console.error("Failed to answer call", err);
      alert("Failed to answer call: Could not access camera/microphone");
      get().leaveCall();
    }
  },

  leaveCall: () => {
    const { socket, call, connectionRef, stream, selectedChat } = get();
    
    if (connectionRef?.current) {
      connectionRef.current.destroy();
      connectionRef.current = null;
    }
    if (stream) {
      stream.getTracks().forEach(track => {
        track.stop();
        track.enabled = false;
      });
    }
    
    const targetId = call?.from || selectedChat?._id;
    if (targetId && socket) {
      socket.emit("end_call", { to: targetId });
    }
    
    set({ 
      call: { isReceivingCall: false, from: null, name: "", avatar: "", signal: null },
      callAccepted: false,
      callEnded: true,
      stream: null
    });
    
    setTimeout(() => set({ callEnded: false }), 3000);
  },

  setSelectedChat: (chat) => set({ selectedChat: chat, messages: [] }),
  setChats: (chats) => set({ chats: Array.isArray(chats) ? chats : [] }),
  setOnlineUsers: (users) => set({ onlineUsers: Array.isArray(users) ? users : [] }),
  setMessages: (input) =>
    set((state) => {
      const currentMessages = Array.isArray(state.messages) ? state.messages : [];
      const newMessages = typeof input === "function" ? input(currentMessages) : input;
      const validatedMessages = Array.isArray(newMessages) ? newMessages : [];
      
      // Use Map for O(1) deduplication and maintaining order
      const messageMap = new Map();
      validatedMessages.forEach(msg => {
        if (msg?._id) {
          messageMap.set(msg._id, msg);
        } else {
          // For optimistic messages without _id, use a temp key
          const tempId = msg.tempId || `temp-${Date.now()}-${Math.random()}`;
          messageMap.set(tempId, msg);
        }
      });

      return { messages: Array.from(messageMap.values()) };
    }),
  
  // Optimistic Message Update
  addMessage: (message) => set((state) => {
    if (!message?._id) return state;
    const safeMessages = Array.isArray(state.messages) ? state.messages : [];
    if (safeMessages.some(msg => msg._id === message._id)) return state;
    return { messages: [...safeMessages, message] };
  }),

  initSocket: (userId) => {
    const { socket: existingSocket } = get();
    if (existingSocket) return;

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

    get().setSocket(socket);
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
