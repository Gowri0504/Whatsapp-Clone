import React, { useState, useEffect } from "react";
import { Search, MessageSquare, MoreVertical, LogOut, X, User } from "lucide-react";
import { useChat } from "../context/ChatContext";
import API from "../services/api";

const Sidebar = () => {
  const { user, setUser, logout, setSelectedChat, selectedChat, onlineUsers, setChats, chats } = useChat();
  const [search, setSearch] = useState("");
  const [allUsers, setAllUsers] = useState([]);
  const [showProfile, setShowProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    username: user?.username || "",
    avatar: user?.avatar || "",
  });

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const { data } = await API.put("/users/profile", profileData);
      setUser(data);
      localStorage.setItem("userInfo", JSON.stringify(data));
      setShowProfile(false);
    } catch (err) {
      console.error(err);
    }
  };

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
      {/* Profile Header */}
      <div className="flex items-center justify-between p-4 bg-whatsapp-header h-[60px]">
        <img
          src={user?.avatar}
          alt="Profile"
          className="w-10 h-10 rounded-full cursor-pointer"
          onClick={() => setShowProfile(true)}
        />
        <div className="flex items-center space-x-4 text-whatsapp-gray">
          <MessageSquare className="w-6 h-6 cursor-pointer" />
          <MoreVertical className="w-6 h-6 cursor-pointer" />
          <LogOut className="w-6 h-6 cursor-pointer" onClick={logout} />
        </div>
      </div>

      {/* Profile Modal */}
      {showProfile && (
        <div className="absolute inset-0 bg-whatsapp-sidebar z-50 flex flex-col">
          <div className="bg-whatsapp-header h-[110px] flex items-end p-4 text-white">
            <div className="flex items-center mb-2">
              <X
                className="w-6 h-6 cursor-pointer mr-6"
                onClick={() => setShowProfile(false)}
              />
              <span className="text-lg font-medium">Profile</span>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto bg-whatsapp-dark p-6 flex flex-col items-center">
            <div className="relative group mb-8">
              <img
                src={profileData.avatar}
                alt="Profile"
                className="w-48 h-48 rounded-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white text-xs uppercase text-center p-4">
                <User className="w-8 h-8 mb-2" />
                Change Profile Photo
              </div>
            </div>

            <form onSubmit={handleUpdateProfile} className="w-full space-y-8">
              <div>
                <label className="block text-whatsapp-green text-sm mb-4">
                  Your Name
                </label>
                <input
                  type="text"
                  className="w-full bg-transparent border-b border-whatsapp-gray/30 focus:border-whatsapp-green outline-none text-white pb-1"
                  value={profileData.username}
                  onChange={(e) =>
                    setProfileData({ ...profileData, username: e.target.value })
                  }
                />
                <p className="text-whatsapp-gray text-xs mt-4 leading-relaxed">
                  This is not your username or pin. This name will be visible to
                  your WhatsApp contacts.
                </p>
              </div>

              <div>
                <label className="block text-whatsapp-green text-sm mb-4">
                  Avatar URL
                </label>
                <input
                  type="text"
                  className="w-full bg-transparent border-b border-whatsapp-gray/30 focus:border-whatsapp-green outline-none text-white pb-1"
                  value={profileData.avatar}
                  onChange={(e) =>
                    setProfileData({ ...profileData, avatar: e.target.value })
                  }
                />
              </div>

              <button
                type="submit"
                className="w-full bg-whatsapp-green text-whatsapp-dark font-bold py-3 rounded shadow-md hover:bg-opacity-90 transition"
              >
                Save Profile
              </button>
            </form>
          </div>
        </div>
      )}

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
