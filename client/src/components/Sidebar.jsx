import React, { useState, useEffect } from "react";
import { Search, MessageSquare, MoreVertical, LogOut } from "lucide-react";
import { useChat } from "../context/ChatContext";
import API from "../services/api";

const Sidebar = () => {
  const { user, logout, setSelectedChat, selectedChat, onlineUsers, setChats, chats } = useChat();
  const [search, setSearch] = useState("");
  const [allUsers, setAllUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data } = await API.get("/users");
        setAllUsers(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    const fetchChats = async () => {
      if (user) {
        try {
          const { data } = await API.get(`/chats/${user._id}`);
          setChats(data);
        } catch (err) {
          console.error(err);
        }
      }
    };
    fetchChats();
  }, [user, setChats]);

  const filteredUsers = allUsers.filter((u) =>
    u.username.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col w-[30%] h-full bg-whatsapp-sidebar border-r border-whatsapp-header">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-whatsapp-header h-[60px]">
        <img
          src={user?.avatar}
          alt="Profile"
          className="w-10 h-10 rounded-full cursor-pointer"
        />
        <div className="flex items-center space-x-4 text-whatsapp-gray">
          <MessageSquare className="w-6 h-6 cursor-pointer" />
          <MoreVertical className="w-6 h-6 cursor-pointer" />
          <LogOut className="w-6 h-6 cursor-pointer" onClick={logout} />
        </div>
      </div>

      {/* Search */}
      <div className="p-2 bg-whatsapp-sidebar">
        <div className="flex items-center bg-whatsapp-header rounded-lg px-3 py-1.5">
          <Search className="w-5 h-5 text-whatsapp-gray mr-3" />
          <input
            type="text"
            placeholder="Search or start new chat"
            className="bg-transparent border-none outline-none text-white text-sm w-full"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {search ? (
          <div>
            <p className="px-4 py-2 text-whatsapp-green text-sm uppercase font-semibold">
              Users
            </p>
            {filteredUsers.map((u) => (
              <div
                key={u._id}
                onClick={() => setSelectedChat(u)}
                className="flex items-center px-4 py-3 cursor-pointer hover:bg-whatsapp-header transition duration-200"
              >
                <img
                  src={u.avatar}
                  alt={u.username}
                  className="w-12 h-12 rounded-full mr-4"
                />
                <div className="flex-1 border-b border-whatsapp-header pb-3">
                  <div className="flex justify-between">
                    <h3 className="text-white font-medium">{u.username}</h3>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          chats.map((chat) => {
            const otherParticipant = chat.participants.find(
              (p) => p._id !== user._id
            );
            const isOnline = onlineUsers.includes(otherParticipant?._id);

            return (
              <div
                key={chat._id}
                onClick={() => setSelectedChat(otherParticipant)}
                className={`flex items-center px-4 py-3 cursor-pointer hover:bg-whatsapp-header transition duration-200 ${
                  selectedChat?._id === otherParticipant?._id
                    ? "bg-whatsapp-header"
                    : ""
                }`}
              >
                <div className="relative">
                  <img
                    src={otherParticipant?.avatar}
                    alt={otherParticipant?.username}
                    className="w-12 h-12 rounded-full mr-4"
                  />
                  {isOnline && (
                    <div className="absolute bottom-1 right-4 w-3 h-3 bg-whatsapp-green rounded-full border-2 border-whatsapp-sidebar"></div>
                  )}
                </div>
                <div className="flex-1 border-b border-whatsapp-header pb-3">
                  <div className="flex justify-between items-baseline">
                    <h3 className="text-white font-medium">
                      {otherParticipant?.username}
                    </h3>
                    <span className="text-whatsapp-gray text-xs">
                      {chat.lastMessage
                        ? new Date(chat.lastMessage.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : ""}
                    </span>
                  </div>
                  <p className="text-whatsapp-gray text-sm truncate">
                    {chat.lastMessage?.message || "No messages yet"}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Sidebar;
