import React, { useEffect } from "react";
import Sidebar from "../components/Sidebar";
import ChatWindow from "../components/ChatWindow";
import useChatStore from "../store/useChatStore";
import useAuthStore from "../store/useAuthStore";

const Home = () => {
  const { user } = useAuthStore();
  const { initSocket, disconnectSocket } = useChatStore();

  useEffect(() => {
    if (user?._id) {
      initSocket(user._id);
    }
    return () => disconnectSocket();
  }, [user?._id, initSocket, disconnectSocket]);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-whatsapp-dark">
      <div className="flex w-full h-full max-w-[1600px] mx-auto shadow-2xl">
        <Sidebar />
        <ChatWindow />
      </div>
    </div>
  );
};

export default Home;
