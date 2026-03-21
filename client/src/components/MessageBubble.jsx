import React from "react";
import { Check, CheckCheck } from "lucide-react";

const MessageBubble = ({ message, isOwn }) => {
  const time = new Date(message.createdAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"} mb-1`}>
      <div
        className={`relative max-w-[65%] px-3 py-1.5 rounded-lg text-sm shadow-sm ${
          isOwn
            ? "bg-whatsapp-sent text-white rounded-tr-none"
            : "bg-whatsapp-received text-white rounded-tl-none"
        }`}
      >
        <p className="pr-12">{message.message}</p>
        <div className="absolute bottom-1 right-2 flex items-center space-x-1">
          <span className="text-[10px] text-whatsapp-light opacity-70">
            {time}
          </span>
          {isOwn && (
            <div className="text-whatsapp-light opacity-70">
              {message.status === "seen" ? (
                <CheckCheck className="w-3 h-3 text-blue-400" />
              ) : message.status === "delivered" ? (
                <CheckCheck className="w-3 h-3" />
              ) : (
                <Check className="w-3 h-3" />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
