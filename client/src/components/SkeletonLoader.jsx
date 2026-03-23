import React from "react";

const SkeletonLoader = ({ type }) => {
  if (type === "chatItem") {
    return (
      <div className="flex items-center px-4 py-3 animate-pulse">
        <div className="w-12 h-12 bg-whatsapp-header rounded-full mr-4"></div>
        <div className="flex-1 border-b border-whatsapp-header pb-3">
          <div className="h-4 bg-whatsapp-header rounded w-1/3 mb-2"></div>
          <div className="h-3 bg-whatsapp-header rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  if (type === "message") {
    return (
      <div className="flex flex-col space-y-4 animate-pulse p-4">
        <div className="self-start w-2/3 h-10 bg-whatsapp-received rounded-lg"></div>
        <div className="self-end w-1/2 h-10 bg-whatsapp-sent rounded-lg"></div>
        <div className="self-start w-1/3 h-10 bg-whatsapp-received rounded-lg"></div>
      </div>
    );
  }

  return null;
};

export default SkeletonLoader;
