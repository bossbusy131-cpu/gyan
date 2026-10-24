import React, { useState, useEffect } from 'react';
import { 
  X, 
  Maximize2, 
  Minimize2, 
  Users, 
  Send, 
  MessageSquare, 
  Sparkles, 
  Radio, 
  Flame,
  ShieldCheck,
  CheckCircle,
  ExternalLink
} from 'lucide-react';
import { LiveStreamItem } from '../services/liveStreamService';
import { authService } from '../services/authService';

interface LivePlayerModalProps {
  stream: LiveStreamItem | null;
  onClose: () => void;
}

interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  time: string;
  isTeacher?: boolean;
}

export const LivePlayerModal: React.FC<LivePlayerModalProps> = ({
  stream,
  onClose,
}) => {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { id: '1', sender: 'Prince Sir (Target Board)', text: 'Namaste bachho! Sabhi students live join kar lijiye. Aaj Chapter 1 ka sabse imp topic padhenge.', time: 'Just now', isTeacher: true },
    { id: '2', sender: 'Aman Kumar (12th)', text: 'Present Sir! Audio aur video dono ekdum clear hai.', time: '1m ago' },
    { id: '3', sender: 'Pooja Sharma', text: 'Sir kal ka test bahut accha gaya tha, thank you!', time: 'Just now' },
    { id: '4', sender: 'Rohan Gupta', text: 'Formula sheet PDF kab upload hoga sir?', time: 'Just now' },
  ]);
  const [newChatText, setNewChatText] = useState('');
  const [showChatMobile, setShowChatMobile] = useState(false);
  
  const getInitialStreamUrl = (streamItem: LiveStreamItem | null): string | null => {
    if (!streamItem) return null;
    if (streamItem.tpAssetId) {
      return `https://app.tpstreams.com/embed/kuepke/${encodeURIComponent(streamItem.tpAssetId)}/?autoplay=1`;
    }
    if (streamItem.youtubeId) {
      let ytId = streamItem.youtubeId.trim();
      if (ytId.includes('v=')) {
        ytId = ytId.split('v=')[1]?.split('&')[0] || ytId;
      } else if (ytId.includes('youtu.be/')) {
        ytId = ytId.split('youtu.be/')[1]?.split('?')[0] || ytId;
      } else if (ytId.includes('live/')) {
        ytId = ytId.split('live/')[1]?.split('?')[0] || ytId;
      }
      return `https://www.youtube-nocookie.com/embed/${encodeURIComponent(ytId)}?autoplay=1&rel=0`;
    }
    if (streamItem.hlsUrl) return streamItem.hlsUrl;
    return `https://targetboard.co.in/dashboard/live?stream=${encodeURIComponent(streamItem.id)}`;
  };

  const [directPlayerUrl, setDirectPlayerUrl] = useState<string | null>(() => getInitialStreamUrl(stream));

  useEffect(() => {
    if (!stream) return;

    let cancelled = false;
    // Set fallback first
    if (stream.tpAssetId) {
      setDirectPlayerUrl(`https://app.tpstreams.com/embed/kuepke/${encodeURIComponent(stream.tpAssetId)}/?autoplay=1`);
      // Try to fetch access token
      authService.fetchVideoToken(stream.tpAssetId).then(token => {
        if (!cancelled && token) {
          setDirectPlayerUrl(`https://app.tpstreams.com/embed/kuepke/${encodeURIComponent(stream.tpAssetId!)}/?access_token=${token}&autoplay=1`);
        }
      }).catch(() => {});
    } else if (stream.youtubeId) {
      let ytId = stream.youtubeId.trim();
      if (ytId.includes('v=')) {
        ytId = ytId.split('v=')[1]?.split('&')[0] || ytId;
      } else if (ytId.includes('youtu.be/')) {
        ytId = ytId.split('youtu.be/')[1]?.split('?')[0] || ytId;
      } else if (ytId.includes('live/')) {
        ytId = ytId.split('live/')[1]?.split('?')[0] || ytId;
      }
      setDirectPlayerUrl(`https://www.youtube-nocookie.com/embed/${encodeURIComponent(ytId)}?autoplay=1&rel=0`);
    } else if (stream.hlsUrl) {
      setDirectPlayerUrl(stream.hlsUrl);
    } else {
      setDirectPlayerUrl(`https://targetboard.co.in/dashboard/live?stream=${encodeURIComponent(stream.id)}`);
    }

    return () => {
      cancelled = true;
    };
  }, [stream]);

  if (!stream) return null;

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChatText.trim()) return;

    const user = authService.getStoredUser();
    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: user?.fullName || 'Student',
      text: newChatText.trim(),
      time: 'Just now',
    };

    setChatMessages(prev => [...prev, newMsg]);
    setNewChatText('');
  };

  return (
    <div className={`fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center ${
      isFullScreen ? 'p-0' : 'p-2 sm:p-4 md:p-6'
    } overflow-y-auto animate-in fade-in duration-200`}>
      <div className={`relative w-full ${
        isFullScreen 
          ? 'w-screen h-screen max-w-none max-h-none rounded-none border-0'
          : 'max-w-6xl rounded-3xl border border-slate-800 max-h-[96vh]'
      } bg-slate-950 shadow-2xl overflow-hidden flex flex-col my-auto transition-all`}>
        
        {/* Top Live Bar */}
        <div className="p-3 sm:p-4 bg-slate-900 border-b border-slate-800/80 flex items-center justify-between gap-3 shrink-0">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-bold tracking-wider uppercase animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                <span>LIVE NOW</span>
              </span>

              <span className="text-xs text-blue-400 font-semibold truncate">
                {stream.batchName}
              </span>

              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-md">
                <Users className="w-3 h-3 text-emerald-400" />
                <span>{stream.viewersCount.toLocaleString()} watching</span>
              </span>
            </div>

            <h2 className="text-sm sm:text-base font-bold text-white truncate mt-1 leading-snug">
              {stream.title}
            </h2>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Mobile Chat Toggle */}
            <button
              onClick={() => setShowChatMobile(!showChatMobile)}
              className="md:hidden p-2 rounded-xl text-slate-300 hover:text-white bg-slate-800"
              title="Toggle Live Chat"
            >
              <MessageSquare className="w-4 h-4 text-blue-400" />
            </button>

            {/* Fullscreen Toggle */}
            <button
              onClick={() => setIsFullScreen(!isFullScreen)}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title={isFullScreen ? 'Exit Full Screen' : 'Full Screen'}
            >
              {isFullScreen ? (
                <Minimize2 className="w-4 h-4 text-blue-400" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Center Live Stage + Chat Layout */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-black min-h-[350px] sm:min-h-[500px]">
          
          {/* Main Live Video Player Stage */}
          <div className="flex-1 flex flex-col justify-center bg-black relative">
            {directPlayerUrl ? (
              <iframe
                src={directPlayerUrl}
                title={stream.title}
                className="w-full h-full min-h-[300px] sm:min-h-[460px] md:min-h-[520px] border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div className="w-full h-full min-h-[300px] sm:min-h-[460px] md:min-h-[520px] flex flex-col items-center justify-center text-slate-400 bg-black space-y-3">
                <Radio className="w-10 h-10 text-red-500 animate-pulse" />
                <span className="text-xs font-medium">Connecting to TargetBoard Live Stream...</span>
              </div>
            )}

            {/* Bottom Stream Info Bar */}
            <div className="p-3 bg-slate-950 border-t border-slate-900 flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-200">{stream.teacherName}</span>
                <span>·</span>
                <span className="text-blue-400">{stream.subject}</span>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-400">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>TargetBoard API Live Sync</span>
              </div>
            </div>
          </div>

          {/* Live Chat & Doubts Drawer */}
          <div className={`${
            showChatMobile ? 'flex' : 'hidden md:flex'
          } w-full md:w-80 lg:w-96 bg-slate-900 border-t md:border-t-0 md:border-l border-slate-800 flex-col h-72 md:h-auto shrink-0`}>
            
            <div className="p-3 border-b border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 font-semibold text-white">
                <MessageSquare className="w-4 h-4 text-blue-400" />
                <span>Live Class Doubts & Chat</span>
              </div>
              <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Active</span>
              </span>
            </div>

            {/* Messages Feed */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2.5 text-xs">
              {chatMessages.map(msg => (
                <div 
                  key={msg.id}
                  className={`p-2.5 rounded-xl ${
                    msg.isTeacher 
                      ? 'bg-blue-950/80 border border-blue-800/80' 
                      : 'bg-slate-950/70 border border-slate-800/60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-0.5">
                    <span className={`font-semibold ${
                      msg.isTeacher ? 'text-amber-300 flex items-center gap-1' : 'text-blue-400'
                    }`}>
                      {msg.sender}
                      {msg.isTeacher && <Flame className="w-3 h-3 text-amber-400" />}
                    </span>
                    <span className="text-[10px] text-slate-500">{msg.time}</span>
                  </div>
                  <p className="text-slate-200 leading-relaxed text-[11px] sm:text-xs">
                    {msg.text}
                  </p>
                </div>
              ))}
            </div>

            {/* Chat Send Form */}
            <form onSubmit={handleSendMessage} className="p-2.5 border-t border-slate-800 flex gap-2">
              <input
                type="text"
                value={newChatText}
                onChange={e => setNewChatText(e.target.value)}
                placeholder="Ask doubt to teacher..."
                className="flex-1 px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                disabled={!newChatText.trim()}
                className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

        </div>

      </div>
    </div>
  );
};
