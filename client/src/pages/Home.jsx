import React from "react";
import Sidebar from "../components/Sidebar";
import ChatWindow from "../components/ChatWindow";

const Home = () => {
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
