import React, { useState, useEffect } from "react";
import { 
  Search, 
  MessageSquare, 
  MoreVertical, 
  LogOut, 
  X, 
  User, 
  CircleDashed, 
  Users2, 
  Settings, 
  MessageCircle,
  Plus
} from "lucide-react";
import { useChat } from "../context/ChatContext";
import API from "../services/api";

const Sidebar = () => {
  const { user, setUser, logout, setSelectedChat, selectedChat, onlineUsers, setChats, chats } = useChat();
  const [search, setSearch] = useState("");
  const [allUsers, setAllUsers] = useState([]);
  const [showProfile, setShowProfile] = useState(false);
  const [showNewChat, setShowNewChat] = useState(false);
  const [showNewGroup, setShowNewGroup] = useState(false);
  const [showStatusUpload, setShowStatusUpload] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [statusImage, setStatusUploadImage] = useState("");
  const [statusCaption, setStatusCaption] = useState("");
  const [activeTab, setActiveTab] = useState("chats");
  const [statuses, setStatuses] = useState([]);
  const [profileData, setProfileData] = useState({
    username: user?.username || "",
    avatar: user?.avatar || "",
  });

  const navItems = [
    { id: "chats", icon: MessageCircle, label: "Chats" },
    { id: "status", icon: CircleDashed, label: "Status" },
    { id: "channels", icon: MessageSquare, label: "Channels" },
    { id: "communities", icon: Users2, label: "Communities" },
    { id: "settings", icon: Settings, label: "Settings" },
  ];

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

  const startNewChat = (otherUser) => {
    setSelectedChat(otherUser);
    setShowNewChat(false);
    setActiveTab("chats");
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!groupName || selectedUsers.length < 2) {
      alert("Group name and at least 2 users are required");
      return;
    }
    try {
      const { data } = await API.post("/chats/group", {
        name: groupName,
        users: JSON.stringify(selectedUsers.map((u) => u._id)),
      });
      setChats([data, ...chats]);
      setShowNewGroup(false);
      setGroupName("");
      setSelectedUsers([]);
    } catch (err) {
      console.error(err);
    }
  };

  const toggleSelectUser = (u) => {
    if (selectedUsers.some((user) => user._id === u._id)) {
      setSelectedUsers(selectedUsers.filter((user) => user._id !== u._id));
    } else {
      setSelectedUsers([...selectedUsers, u]);
    }
  };

  const handleUploadStatus = async (e) => {
    e.preventDefault();
    if (!statusImage) return;
    try {
      const { data } = await API.post("/status", {
        imageUrl: statusImage,
        caption: statusCaption,
      });
      setStatuses([data, ...statuses]);
      setShowStatusUpload(false);
      setStatusUploadImage("");
      setStatusCaption("");
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const fetchStatuses = async () => {
      try {
        const { data } = await API.get("/status");
        setStatuses(data);
      } catch (err) {
        console.error(err);
      }
    };
    if (activeTab === "status") fetchStatuses();
  }, [activeTab]);

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
    <div className="flex w-[40%] min-w-[350px] max-w-[500px] h-full bg-whatsapp-sidebar border-r border-whatsapp-header relative">
      {/* Left-most WhatsApp Navigation Sidebar */}
      <div className="flex flex-col items-center py-4 justify-between w-[64px] h-full bg-whatsapp-header border-r border-whatsapp-sidebar/30">
        <div className="flex flex-col space-y-4 w-full">
          {navItems.map((item) => (
            <div
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`relative flex items-center justify-center py-2 cursor-pointer group`}
            >
              <item.icon 
                className={`w-6 h-6 transition-colors ${
                  activeTab === item.id ? "text-whatsapp-green" : "text-whatsapp-gray group-hover:text-white"
                }`} 
              />
              {activeTab === item.id && (
                <div className="absolute left-0 w-[3px] h-8 bg-whatsapp-green rounded-r-full" />
              )}
            </div>
          ))}
        </div>
        
        <div className="flex flex-col space-y-4 mb-2">
           <img
            src={user?.avatar}
            alt="Profile"
            className="w-8 h-8 rounded-full cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => setShowProfile(true)}
          />
          <LogOut 
            className="w-6 h-6 text-whatsapp-gray cursor-pointer hover:text-white transition-colors" 
            onClick={logout} 
          />
        </div>
      </div>

      {/* New Chat Modal/Drawer */}
      {showNewChat && (
        <div className="absolute inset-0 bg-whatsapp-sidebar z-50 flex flex-col">
          <div className="bg-whatsapp-header h-[110px] flex items-end p-4 text-white">
            <div className="flex items-center mb-2">
              <X
                className="w-6 h-6 cursor-pointer mr-6"
                onClick={() => setShowNewChat(false)}
              />
              <span className="text-lg font-medium">New Chat</span>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto bg-whatsapp-dark">
            <div className="p-4">
               <div className="flex items-center bg-whatsapp-header rounded-lg px-3 py-1.5">
                <label htmlFor="new-chat-search" className="sr-only">Search contacts</label>
                <Search className="w-5 h-5 text-whatsapp-gray mr-3" />
                <input
                  id="new-chat-search"
                  name="new-chat-search"
                  type="text"
                  placeholder="Search name or email"
                  className="bg-transparent border-none outline-none text-white text-sm w-full"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
            
            <p className="px-6 py-4 text-whatsapp-green text-sm uppercase font-semibold">
              Contacts on WhatsApp
            </p>
            {filteredUsers.map((u) => (
              <div
                key={u._id}
                onClick={() => startNewChat(u)}
                className="flex items-center px-6 py-3 cursor-pointer hover:bg-whatsapp-header transition duration-200"
              >
                <img
                  src={u.avatar}
                  alt={u.username}
                  className="w-12 h-12 rounded-full mr-4"
                />
                <div className="flex-1 border-b border-whatsapp-header pb-3">
                  <h3 className="text-white font-medium">{u.username}</h3>
                  <p className="text-whatsapp-gray text-xs">Available</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Sidebar Content */}
      <div className="flex-1 flex flex-col h-full bg-whatsapp-sidebar">
        {/* Header */}
        <div className="flex items-center justify-between p-4 h-[60px]">
          <h1 className="text-xl font-bold text-white capitalize">{activeTab}</h1>
          <div className="flex items-center space-x-4 text-whatsapp-gray relative">
            <MessageSquare 
              className="w-5 h-5 cursor-pointer hover:text-white" 
              onClick={() => setShowNewChat(true)}
            />
            <div className="relative">
              <MoreVertical 
                className="w-5 h-5 cursor-pointer hover:text-white" 
                onClick={() => setShowMenu(!showMenu)}
              />
              {showMenu && (
                <div className="absolute right-0 top-8 w-48 bg-whatsapp-header shadow-xl rounded-lg py-2 z-[60]">
                  {[
                    { label: "New group", onClick: () => { setShowNewGroup(true); setShowMenu(false); } },
                    { label: "New community", onClick: () => { setActiveTab("communities"); setShowMenu(false); } },
                    { label: "Starred messages", onClick: () => setShowMenu(false) },
                    { label: "Select chats", onClick: () => setShowMenu(false) },
                    { label: "Settings", onClick: () => { setActiveTab("settings"); setShowMenu(false); } },
                    { label: "Log out", onClick: logout },
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

        {/* New Group Modal */}
        {showNewGroup && (
          <div className="absolute inset-0 bg-whatsapp-sidebar z-50 flex flex-col">
            <div className="bg-whatsapp-header h-[110px] flex items-end p-4 text-white">
              <div className="flex items-center mb-2">
                <X
                  className="w-6 h-6 cursor-pointer mr-6"
                  onClick={() => setShowNewGroup(false)}
                />
                <span className="text-lg font-medium">New Group</span>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto bg-whatsapp-dark">
              <div className="p-6">
                <label htmlFor="group-name" className="block text-whatsapp-green text-sm mb-2">Group Name</label>
                <input
                  id="group-name"
                  name="group-name"
                  type="text"
                  placeholder="Enter group name"
                  className="w-full bg-transparent border-b border-whatsapp-green outline-none text-white pb-2 mb-8"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                />
                
                <p className="text-whatsapp-green text-sm uppercase font-semibold mb-4">
                  Add members
                </p>
                {allUsers.map((u) => (
                  <div
                    key={u._id}
                    onClick={() => toggleSelectUser(u)}
                    className={`flex items-center px-4 py-3 cursor-pointer hover:bg-whatsapp-header transition duration-200 ${
                      selectedUsers.some(user => user._id === u._id) ? "bg-whatsapp-header" : ""
                    }`}
                  >
                    <img src={u.avatar} className="w-10 h-10 rounded-full mr-4" />
                    <div className="flex-1 border-b border-whatsapp-header pb-3 flex justify-between items-center">
                      <h3 className="text-white font-medium">{u.username}</h3>
                      {selectedUsers.some(user => user._id === u._id) && (
                        <div className="w-5 h-5 bg-whatsapp-green rounded-full flex items-center justify-center">
                          <Plus className="w-3 h-3 text-whatsapp-dark rotate-45" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-6 bg-whatsapp-header">
              <button
                onClick={handleCreateGroup}
                className="w-full bg-whatsapp-green text-whatsapp-dark font-bold py-3 rounded shadow-md hover:bg-opacity-90 transition"
              >
                Create Group
              </button>
            </div>
          </div>
        )}

        {/* Status Upload Modal */}
        {showStatusUpload && (
          <div className="absolute inset-0 bg-whatsapp-sidebar z-50 flex flex-col">
            <div className="bg-whatsapp-header h-[110px] flex items-end p-4 text-white">
              <div className="flex items-center mb-2">
                <X
                  className="w-6 h-6 cursor-pointer mr-6"
                  onClick={() => setShowStatusUpload(false)}
                />
                <span className="text-lg font-medium">Add Status</span>
              </div>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center bg-whatsapp-dark p-6">
              {statusImage ? (
                <img src={statusImage} className="max-h-[300px] rounded-lg mb-6" />
              ) : (
                <div className="w-48 h-48 bg-whatsapp-header rounded-lg flex flex-center mb-6">
                   <Plus className="w-12 h-12 text-whatsapp-gray" />
                </div>
              )}
              <label htmlFor="status-image-url" className="block text-whatsapp-green text-sm mb-2">Image URL</label>
              <input
                id="status-image-url"
                name="status-image-url"
                type="text"
                placeholder="Paste Image URL"
                className="w-full bg-whatsapp-sidebar border-none text-white rounded p-3 mb-4"
                value={statusImage}
                onChange={(e) => setStatusUploadImage(e.target.value)}
              />
              <label htmlFor="status-caption" className="block text-whatsapp-green text-sm mb-2">Caption</label>
              <input
                id="status-caption"
                name="status-caption"
                type="text"
                placeholder="Add a caption..."
                className="w-full bg-transparent border-b border-whatsapp-gray focus:border-whatsapp-green outline-none text-white pb-2"
                value={statusCaption}
                onChange={(e) => setStatusCaption(e.target.value)}
              />
            </div>
            <div className="p-6 bg-whatsapp-header">
              <button
                onClick={handleUploadStatus}
                className="w-full bg-whatsapp-green text-whatsapp-dark font-bold py-3 rounded shadow-md hover:bg-opacity-90 transition"
              >
                Post Status
              </button>
            </div>
          </div>
        )}

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
                <label htmlFor="profile-username" className="block text-whatsapp-green text-sm mb-4">
                  Your Name
                </label>
                <input
                  id="profile-username"
                  name="profile-username"
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
                <label htmlFor="profile-avatar" className="block text-whatsapp-green text-sm mb-4">
                  Avatar URL
                </label>
                <input
                  id="profile-avatar"
                  name="profile-avatar"
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
          <label htmlFor="sidebar-search" className="sr-only">Search chats</label>
          <Search className="w-5 h-5 text-whatsapp-gray mr-3" />
          <input
            id="sidebar-search"
            name="sidebar-search"
            type="text"
            placeholder="Search or start new chat"
            className="bg-transparent border-none outline-none text-white text-sm w-full"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto relative">
        {activeTab === "chats" ? (
          search ? (
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
            <>
              {chats.map((chat) => {
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
              })}
              
              {/* Floating New Chat Button */}
              <div 
                className="absolute bottom-6 right-6 w-14 h-14 bg-whatsapp-green rounded-xl flex items-center justify-center cursor-pointer shadow-lg hover:brightness-110 transition-all z-10"
                onClick={() => setShowNewChat(true)}
              >
                <Plus className="w-7 h-7 text-whatsapp-dark" />
              </div>
            </>
          )
        ) : activeTab === "status" ? (
          <div className="flex flex-col h-full bg-whatsapp-sidebar">
             <div className="flex items-center px-4 py-4 cursor-pointer hover:bg-whatsapp-header">
                <div className="relative">
                  <img src={user?.avatar} className="w-12 h-12 rounded-full mr-4" />
                  <div className="absolute bottom-0 right-4 bg-whatsapp-green rounded-full p-0.5 border-2 border-whatsapp-sidebar">
                    <Plus className="w-3 h-3 text-white" />
                  </div>
                </div>
                <div>
                  <h3 className="text-white font-medium">My Status</h3>
                  <p className="text-whatsapp-gray text-xs">Tap to add status update</p>
                </div>
             </div>
             <p className="px-4 py-4 text-whatsapp-gray text-sm uppercase font-semibold">Recent updates</p>
             <div className="flex flex-col items-center justify-center mt-10 text-whatsapp-gray px-8 text-center">
                <CircleDashed className="w-16 h-16 mb-4 opacity-20" />
                <p className="text-sm">No status updates yet.</p>
             </div>
          </div>
        ) : activeTab === "settings" ? (
          <div className="flex flex-col h-full bg-whatsapp-sidebar">
             {[
               { icon: User, label: "Account", sub: "Security, privacy" },
               { icon: MessageCircle, label: "Chats", sub: "Theme, wallpapers" },
               { icon: CircleDashed, label: "Notifications", sub: "Message, group" },
               { icon: Settings, label: "Help", sub: "Help center, contact us" }
             ].map((item, i) => (
                <div key={i} className="flex items-center px-6 py-4 cursor-pointer hover:bg-whatsapp-header border-b border-whatsapp-header/30">
                   <item.icon className="w-6 h-6 text-whatsapp-gray mr-6" />
                   <div>
                      <h3 className="text-white font-medium">{item.label}</h3>
                      <p className="text-whatsapp-gray text-xs">{item.sub}</p>
                   </div>
                </div>
             ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-whatsapp-gray px-8 text-center">
            <h3 className="text-lg font-medium text-white mb-2">{activeTab} coming soon</h3>
            <p className="text-sm">We're working hard to bring the {activeTab} experience to you.</p>
          </div>
        )}
      </div>
    </div>
  </div>
);
};

export default Sidebar;
