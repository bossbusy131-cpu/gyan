import React, { useState, useEffect } from 'react';
import { 
  Radio, 
  Users, 
  Calendar, 
  Clock, 
  Play, 
  Settings, 
  Key, 
  RefreshCw, 
  Flame, 
  Sparkles, 
  ShieldCheck, 
  Check, 
  GraduationCap,
  ExternalLink
} from 'lucide-react';
import { liveStreamService, LiveStreamItem } from '../services/liveStreamService';
import { LivePlayerModal } from './LivePlayerModal';

interface LiveClassesViewProps {
  onSelectStream?: (stream: LiveStreamItem) => void;
}

export const LiveClassesView: React.FC<LiveClassesViewProps> = () => {
  const [liveStreams, setLiveStreams] = useState<LiveStreamItem[]>([]);
  const [upcomingStreams, setUpcomingStreams] = useState<LiveStreamItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStream, setSelectedStream] = useState<LiveStreamItem | null>(null);
  
  // Custom API key & stream modal
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState(() => liveStreamService.getApiKey());
  const [customTitle, setCustomTitle] = useState('');
  const [customTeacher, setCustomTeacher] = useState('Prince Sir');
  const [customAssetId, setCustomAssetId] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const fetchStreams = async () => {
    setLoading(true);
    try {
      const data = await liveStreamService.fetchLiveStreams();
      setLiveStreams(data.live);
      setUpcomingStreams(data.upcoming);
    } catch (err) {
      console.warn('Failed to fetch live streams', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStreams();

    // Auto-poll every 45s for fresh live status
    const interval = setInterval(fetchStreams, 45000);
    return () => clearInterval(interval);
  }, []);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    liveStreamService.setApiKey(apiKeyInput);

    if (customTitle.trim()) {
      liveStreamService.setCustomLiveStream({
        title: customTitle.trim(),
        teacherName: customTeacher.trim(),
        tpAssetId: customAssetId.trim() || undefined,
        status: 'live',
        subject: 'Special Board Class',
        batchName: 'TargetBoard Live',
      });
    }

    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      setShowSettingsModal(false);
      fetchStreams();
    }, 800);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 animate-in fade-in duration-200">
      
      {/* Live Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-red-600 via-rose-600 to-indigo-700 p-6 md:p-8 text-white shadow-xl">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold uppercase tracking-wider mb-3">
            <span className="w-2 h-2 rounded-full bg-white animate-ping" />
            <span>TargetBoard Live Classes</span>
          </div>

          <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight">
            Live Interactive Broadcasts
          </h1>
          <p className="mt-2 text-sm text-red-100/90 leading-relaxed">
            Join live classroom sessions with Prince Sir, Anurag Sir and top educators. Real-time doubts, live chat, and board exam tips.
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              onClick={() => fetchStreams()}
              disabled={loading}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white/20 hover:bg-white/30 backdrop-blur-md text-white border border-white/20 transition-all flex items-center gap-2 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Live Status</span>
            </button>

            <button
              onClick={() => setShowSettingsModal(true)}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-black/30 hover:bg-black/40 backdrop-blur-md text-white border border-white/10 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Key className="w-3.5 h-3.5 text-amber-300" />
              <span>API Key & Stream Settings</span>
            </button>
          </div>
        </div>

        {/* Decorative circle */}
        <div className="absolute -right-12 -bottom-12 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
      </div>

      {/* 1. Live Now Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600"></span>
            </span>
            <h2 className="font-display font-bold text-lg text-slate-900 dark:text-white">
              Live Now ({liveStreams.length})
            </h2>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Auto-synced with TargetBoard
          </span>
        </div>

        {liveStreams.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {liveStreams.map(stream => (
              <div
                key={stream.id}
                onClick={() => setSelectedStream(stream)}
                className="group bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-red-500/80 rounded-2xl p-5 shadow-sm hover:shadow-xl hover:shadow-red-500/5 transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-50 dark:bg-red-950/70 border border-red-200 dark:border-red-800 text-[10px] font-bold text-red-600 dark:text-red-400 uppercase">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
                      <span>Broadcasting</span>
                    </span>

                    <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                      <Users className="w-3.5 h-3.5 text-emerald-500" />
                      <span>{stream.viewersCount.toLocaleString()} watching</span>
                    </div>
                  </div>

                  <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                    {stream.batchName} · {stream.subject}
                  </span>

                  <h3 className="font-display font-bold text-base text-slate-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors mt-1 line-clamp-2 leading-snug">
                    {stream.title}
                  </h3>

                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2">
                    {stream.description || 'Live interactive session for board preparation.'}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                      {stream.teacherName.charAt(0)}
                    </div>
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                      {stream.teacherName}
                    </span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedStream(stream);
                    }}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-red-600 hover:bg-red-500 text-white flex items-center gap-1.5 shadow-md shadow-red-600/20 transition-all cursor-pointer"
                  >
                    <Play className="w-3 h-3 fill-white" />
                    <span>Join Live</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            <Radio className="w-10 h-10 text-slate-400 mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              No live class active right now
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Live sessions typically run in morning (7:00 AM - 11:00 AM) and evening (4:00 PM - 9:00 PM IST). Check upcoming sessions below.
            </p>
          </div>
        )}
      </div>

      {/* 2. Upcoming Live Classes Section */}
      <div className="space-y-3 pt-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-blue-500" />
          <h2 className="font-display font-bold text-lg text-slate-900 dark:text-white">
            Upcoming Live Schedule ({upcomingStreams.length})
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {upcomingStreams.map(stream => (
            <div
              key={stream.id}
              className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 sm:p-5 flex items-center justify-between gap-4"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-800 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{stream.scheduledAt || 'Scheduled'}</span>
                  </span>
                  <span className="text-xs text-slate-400 truncate">
                    {stream.subject}
                  </span>
                </div>

                <h4 className="font-semibold text-sm text-slate-900 dark:text-white truncate">
                  {stream.title}
                </h4>

                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Educator: {stream.teacherName} · {stream.batchName}
                </p>
              </div>

              <button
                onClick={() => setSelectedStream(stream)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 shrink-0 transition-colors"
              >
                Details
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Settings Modal (API Key & Stream Link) */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 font-bold text-base text-slate-900 dark:text-white">
                <Key className="w-5 h-5 text-blue-600" />
                <span>TargetBoard Live API Settings</span>
              </div>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  TargetBoard API Bearer Token / API Key
                </label>
                <input
                  type="text"
                  value={apiKeyInput}
                  onChange={e => setApiKeyInput(e.target.value)}
                  placeholder="Paste TargetBoard Token / API Key here..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 font-mono focus:outline-none focus:border-blue-500"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Leave blank to auto-use your logged-in student account session.
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-3">
                <span className="font-semibold text-slate-700 dark:text-slate-300 block">
                  Broadcast Direct Stream / Asset ID (Optional):
                </span>

                <div>
                  <label className="block text-slate-500 mb-1">Live Class Title</label>
                  <input
                    type="text"
                    value={customTitle}
                    onChange={e => setCustomTitle(e.target.value)}
                    placeholder="e.g. 12th Physics Special Live Session"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-500 mb-1">Teacher Name</label>
                    <input
                      type="text"
                      value={customTeacher}
                      onChange={e => setCustomTeacher(e.target.value)}
                      placeholder="Prince Sir"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 mb-1">TPStream Asset ID</label>
                    <input
                      type="text"
                      value={customAssetId}
                      onChange={e => setCustomAssetId(e.target.value)}
                      placeholder="e.g. B8qhf9zP4c7"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
                    />
                  </div>
                </div>
              </div>

              {saveSuccess && (
                <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 font-semibold text-center flex items-center justify-center gap-1.5">
                  <Check className="w-4 h-4" />
                  <span>Settings Saved Successfully!</span>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSettingsModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-sm"
                >
                  Save & Apply
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* Live Stream Player Modal */}
      {selectedStream && (
        <LivePlayerModal
          stream={selectedStream}
          onClose={() => setSelectedStream(null)}
        />
      )}

    </div>
  );
};
