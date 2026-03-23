import React, { useEffect, useRef, useState } from "react";
import { Phone, PhoneOff, Video, VideoOff, Mic, MicOff } from "lucide-react";
import useChatStore from "../store/useChatStore";
import useAuthStore from "../store/useAuthStore";

const CallModal = () => {
  const { user } = useAuthStore();
  const { call, answerCall, leaveCall, callAccepted, callEnded, stream, myVideo, userVideo, connectionRef } = useChatStore();
  
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  const toggleMute = () => {
    if (stream) {
      stream.getAudioTracks()[0].enabled = isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (stream) {
      stream.getVideoTracks()[0].enabled = isVideoOff;
      setIsVideoOff(!isVideoOff);
    }
  };

  if (!call?.isReceivingCall && !callAccepted && !callEnded) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-whatsapp-header w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl flex flex-col h-[80vh]">
        {/* Header */}
        <div className="p-4 flex items-center justify-between border-b border-whatsapp-sidebar/30">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-whatsapp-green flex items-center justify-center">
              <Phone className="text-whatsapp-dark w-5 h-5" />
            </div>
            <div>
              <h3 className="text-white font-medium">{call?.name || "Incoming Call"}</h3>
              <p className="text-whatsapp-gray text-xs">
                {callEnded ? "Call Ended" : callAccepted ? "Connecting..." : "Ringing..."}
              </p>
            </div>
          </div>
        </div>

        {/* Video Area */}
        <div className="flex-1 relative bg-black flex items-center justify-center">
          {/* Remote Video */}
          {callAccepted && !callEnded ? (
            <video playsInline ref={userVideo} autoPlay className="w-full h-full object-cover" />
          ) : (
            <div className="flex flex-col items-center">
              <img src={call?.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=Call"} className="w-32 h-32 rounded-full mb-4 animate-pulse" />
              <p className="text-white text-lg">
                {callEnded ? "Call Ended" : `${call?.name || "Someone"} is calling...`}
              </p>
            </div>
          )}

          {/* Local Video Preview */}
          {stream && !callEnded && (
            <div className="absolute bottom-4 right-4 w-32 h-48 bg-whatsapp-sidebar rounded-lg overflow-hidden border-2 border-whatsapp-green shadow-lg">
              <video playsInline muted ref={myVideo} autoPlay className="w-full h-full object-cover" />
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="p-6 bg-whatsapp-sidebar flex items-center justify-center space-x-6">
          {callEnded ? (
             <div className="text-white font-medium">Closing...</div>
          ) : call?.isReceivingCall && !callAccepted ? (
            <>
              <button 
                onClick={answerCall}
                className="w-14 h-14 rounded-full bg-whatsapp-green flex items-center justify-center hover:brightness-110 transition shadow-lg"
              >
                <Phone className="text-whatsapp-dark w-6 h-6" />
              </button>
              <button 
                onClick={leaveCall}
                className="w-14 h-14 rounded-full bg-red-500 flex items-center justify-center hover:brightness-110 transition shadow-lg"
              >
                <PhoneOff className="text-white w-6 h-6" />
              </button>
            </>
          ) : (
            <>
              <button 
                onClick={toggleMute}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition shadow-lg ${isMuted ? 'bg-red-500 text-white' : 'bg-whatsapp-header text-whatsapp-gray hover:text-white'}`}
              >
                {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
              <button 
                onClick={toggleVideo}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition shadow-lg ${isVideoOff ? 'bg-red-500 text-white' : 'bg-whatsapp-header text-whatsapp-gray hover:text-white'}`}
              >
                {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
              </button>
              <button 
                onClick={leaveCall}
                className="w-14 h-14 rounded-full bg-red-500 flex items-center justify-center hover:brightness-110 transition shadow-lg"
              >
                <PhoneOff className="text-white w-6 h-6" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CallModal;
