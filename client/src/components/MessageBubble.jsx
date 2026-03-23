import React, { memo } from "react";
import { Check, CheckCheck, Clock } from "lucide-react";

const MessageBubble = ({ message, isOwn, searchTerm }) => {
  const time = new Date(message.createdAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const isImage = message?.type === "image";
  const isAudio = message?.type === "audio";

  const getHighlightedText = (text, highlight) => {
    if (!text) return "";
    if (!highlight?.trim()) {
      return <span>{text}</span>;
    }
    const regex = new RegExp(`(${highlight})`, 'gi');
    const parts = text.split(regex);
    return (
      <span>
        {parts.map((part, i) =>
          regex.test(part) ? (
            <strong key={i} className="bg-yellow-300 text-black">
              {part}
            </strong>
          ) : (
            part
          )
        )}
      </span>
    );
  };

  return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"} mb-1`}>
      <div
        className={`relative max-w-[65%] px-3 py-1.5 rounded-lg text-sm shadow-sm ${
          isOwn
            ? "bg-whatsapp-sent text-white rounded-tr-none"
            : "bg-whatsapp-received text-white rounded-tl-none"
        } ${isImage || isAudio ? "p-1" : ""}`}
      >
        {isImage ? (
          <img src={message.message} alt="Shared content" className="rounded-md max-w-xs" />
        ) : isAudio ? (
          <audio controls src={message.message} className="w-full"></audio>
        ) : (
          <p className="pr-12">{getHighlightedText(message.message, searchTerm)}</p>
        )}
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
              ) : message.status === "sent" ? (
                <Check className="w-3 h-3" />
              ) : (
                <Clock className="w-3 h-3 animate-spin" />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default memo(MessageBubble);
