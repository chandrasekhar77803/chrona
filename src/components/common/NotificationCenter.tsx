import React, { useState, useRef, useEffect } from 'react';
import { useChrona } from '../../context/ChronaContext';
import {
  Bell,
  CheckCheck,
  Trash2,
  ExternalLink,
  Sparkles,
  Layers,
  ChevronRight
} from 'lucide-react';
import type { ChronaNotification, NotificationPriority } from '../../types/chrona';

export const NotificationCenter: React.FC = () => {
  const {
    notifications,
    unreadNotificationsCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    clearAllNotifications,
    isDemoNotificationMode,
    toggleDemoNotificationMode,
    setActiveSection
  } = useChrona();

  const [isOpen, setIsOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string>('ALL');
  const panelRef = useRef<HTMLDivElement | null>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Compute dynamic distinct source tabs
  const distinctSources = Array.from(new Set(notifications.map(n => n.source))).filter(Boolean);

  const filteredNotifications = notifications.filter(n => {
    if (selectedFilter === 'ALL') return true;
    if (selectedFilter === 'UNREAD') return !n.read;
    if (selectedFilter === 'HIGH') return n.priority === 'HIGH';
    return n.source.toLowerCase() === selectedFilter.toLowerCase();
  });

  const handleNotificationClick = async (notif: ChronaNotification) => {
    if (!notif.read) {
      await markNotificationAsRead(notif.id);
    }

    if (notif.targetSection) {
      setActiveSection(notif.targetSection);
      setIsOpen(false);
    } else if (notif.url) {
      window.open(notif.url, '_blank', 'noopener,noreferrer');
    }
  };

  const getPriorityBadge = (priority: NotificationPriority) => {
    switch (priority) {
      case 'HIGH':
        return (
          <span className="px-1.5 py-0.5 rounded-md bg-rose-950/80 border border-rose-500/50 text-rose-300 text-[10px] font-mono font-bold flex items-center gap-1 shadow-sm shadow-rose-950">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
            HIGH
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="px-1.5 py-0.5 rounded-md bg-amber-950/70 border border-amber-500/40 text-amber-300 text-[10px] font-mono font-bold">
            MEDIUM
          </span>
        );
      default:
        return (
          <span className="px-1.5 py-0.5 rounded-md bg-slate-800/80 border border-slate-700 text-slate-300 text-[10px] font-mono">
            NORMAL
          </span>
        );
    }
  };

  const getSourceBadge = (source: string, isDemo?: boolean) => {
    const s = source.toLowerCase();
    let bg = 'bg-slate-800 text-slate-300 border-slate-700';
    let icon = '⚡';

    if (s.includes('linkedin')) {
      bg = 'bg-sky-950/80 text-sky-300 border-sky-500/40';
      icon = '🔷';
    } else if (s.includes('whatsapp')) {
      bg = 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40';
      icon = '🟢';
    } else if (s.includes('leetcode')) {
      bg = 'bg-amber-950/80 text-amber-300 border-amber-500/40';
      icon = '🟧';
    } else if (s.includes('github')) {
      bg = 'bg-purple-950/80 text-purple-300 border-purple-500/40';
      icon = '🐱';
    } else if (s.includes('hackerrank')) {
      bg = 'bg-teal-950/80 text-teal-300 border-teal-500/40';
      icon = '🟩';
    } else if (s.includes('codechef')) {
      bg = 'bg-orange-950/80 text-orange-300 border-orange-500/40';
      icon = '🟤';
    } else if (s.includes('codeforces')) {
      bg = 'bg-blue-950/80 text-blue-300 border-blue-500/40';
      icon = '🔵';
    } else if (s.includes('gmail')) {
      bg = 'bg-rose-950/80 text-rose-300 border-rose-500/40';
      icon = '🔴';
    } else if (s.includes('calendar') || s.includes('gcalendar')) {
      bg = 'bg-indigo-950/80 text-indigo-300 border-indigo-500/40';
      icon = '📅';
    } else if (s.includes('outlook')) {
      bg = 'bg-cyan-950/80 text-cyan-300 border-cyan-500/40';
      icon = '📧';
    } else if (s.includes('telegram')) {
      bg = 'bg-sky-950/80 text-sky-300 border-sky-500/40';
      icon = '✈️';
    }

    return (
      <div className="flex items-center gap-1">
        <span className={`px-2 py-0.5 rounded-md border text-[10px] font-mono font-bold flex items-center gap-1 ${bg}`}>
          <span>{icon}</span>
          <span>{source}</span>
        </span>
        {isDemo && (
          <span className="px-1.5 py-0.5 rounded bg-purple-950/80 text-purple-300 border border-purple-500/40 text-[9px] font-mono font-bold">
            DEMO
          </span>
        )}
      </div>
    );
  };

  const formatTimeAgo = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      const diffMs = Date.now() - d.getTime();
      const diffSec = Math.floor(diffMs / 1000);
      if (diffSec < 60) return 'Just now';
      const diffMin = Math.floor(diffSec / 60);
      if (diffMin < 60) return `${diffMin}m ago`;
      const diffHr = Math.floor(diffMin / 60);
      if (diffHr < 24) return `${diffHr}h ago`;
      return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    } catch {
      return 'Recently';
    }
  };

  return (
    <div className="relative" ref={panelRef}>
      {/* TRIGGER BUTTON (HEADER BELL) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2 rounded-xl transition-all cursor-pointer border ${
          isOpen
            ? 'bg-indigo-600/30 text-indigo-300 border-indigo-500/50 shadow-md shadow-indigo-500/20'
            : unreadNotificationsCount > 0
            ? 'bg-slate-900 hover:bg-slate-800 text-slate-100 border-slate-700'
            : 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border-slate-800'
        }`}
        title="Chrona Unified Notification Center"
        aria-label="Open Notifications"
      >
        <Bell className="w-4 h-4" />

        {/* UNREAD PING & COUNT BADGE */}
        {unreadNotificationsCount > 0 && (
          <>
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 animate-ping opacity-75" />
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 text-white text-[10px] font-black font-mono flex items-center justify-center border-2 border-slate-950 shadow-sm">
              {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
            </span>
          </>
        )}
      </button>

      {/* DROPDOWN NOTIFICATION CENTER */}
      {isOpen && (
        <div className="absolute right-0 top-12 w-[380px] sm:w-[440px] max-h-[580px] glass-panel rounded-3xl border border-indigo-500/30 bg-slate-950/95 shadow-2xl backdrop-blur-xl z-50 flex flex-col overflow-hidden animate-fadeIn">
          {/* TOP HEADER */}
          <div className="p-4 border-b border-slate-800/80 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white flex items-center gap-2">
                  <span>Notification Center</span>
                  {unreadNotificationsCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 text-[10px] font-mono font-bold">
                      {unreadNotificationsCount} Unread
                    </span>
                  )}
                </h3>
                <p className="text-[10px] font-mono text-slate-400">Live API stream & opportunity events</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {unreadNotificationsCount > 0 && (
                <button
                  onClick={() => markAllNotificationsAsRead()}
                  className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors cursor-pointer"
                  title="Mark all as read"
                >
                  <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={() => clearAllNotifications()}
                  className="p-1.5 rounded-lg bg-slate-900 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 border border-slate-800 transition-colors cursor-pointer"
                  title="Clear all notifications"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* DEMO MODE BANNER & TOGGLE */}
          <div className="px-4 py-2 bg-purple-950/30 border-b border-purple-500/20 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span className="text-[11px] font-mono text-purple-200">
                Demo Notifications Mode
              </span>
            </div>

            <button
              onClick={() => toggleDemoNotificationMode(!isDemoNotificationMode)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer border ${
                isDemoNotificationMode
                  ? 'bg-purple-600 text-white border-purple-400 shadow-sm'
                  : 'bg-slate-900 text-slate-400 hover:text-white border-slate-800'
              }`}
            >
              {isDemoNotificationMode ? 'ENABLED (DEMO DATA)' : 'ENABLE DEMO'}
            </button>
          </div>

          {/* FILTER PILLS */}
          <div className="p-2 border-b border-slate-800/80 bg-slate-950/60 flex items-center gap-1.5 overflow-x-auto text-[11px] font-mono no-scrollbar">
            <button
              onClick={() => setSelectedFilter('ALL')}
              className={`px-2.5 py-1 rounded-lg whitespace-nowrap transition-all cursor-pointer ${
                selectedFilter === 'ALL'
                  ? 'bg-indigo-600 text-white font-bold shadow-sm'
                  : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              All ({notifications.length})
            </button>

            <button
              onClick={() => setSelectedFilter('UNREAD')}
              className={`px-2.5 py-1 rounded-lg whitespace-nowrap transition-all cursor-pointer ${
                selectedFilter === 'UNREAD'
                  ? 'bg-indigo-600 text-white font-bold shadow-sm'
                  : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              Unread ({unreadNotificationsCount})
            </button>

            <button
              onClick={() => setSelectedFilter('HIGH')}
              className={`px-2.5 py-1 rounded-lg whitespace-nowrap transition-all cursor-pointer ${
                selectedFilter === 'HIGH'
                  ? 'bg-rose-600 text-white font-bold shadow-sm'
                  : 'bg-slate-900/80 text-rose-300/80 hover:text-rose-200 hover:bg-slate-800'
              }`}
            >
              High Priority
            </button>

            {distinctSources.map(source => (
              <button
                key={source}
                onClick={() => setSelectedFilter(source)}
                className={`px-2.5 py-1 rounded-lg whitespace-nowrap transition-all cursor-pointer ${
                  selectedFilter.toLowerCase() === source.toLowerCase()
                    ? 'bg-indigo-600 text-white font-bold shadow-sm'
                    : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {source}
              </button>
            ))}
          </div>

          {/* NOTIFICATION LIST */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2.5 max-h-[380px]">
            {filteredNotifications.length === 0 ? (
              <div className="py-10 text-center space-y-2">
                <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500">
                  <Layers className="w-6 h-6" />
                </div>
                <div className="text-xs font-bold text-slate-300">No Notifications</div>
                <p className="text-[11px] font-mono text-slate-500 max-w-[240px] mx-auto">
                  {selectedFilter === 'UNREAD'
                    ? 'All caught up! No unread notifications.'
                    : 'Connect LinkedIn or WhatsApp in Chrona Connect to stream authorized notifications.'}
                </p>
                {!isDemoNotificationMode && (
                  <button
                    onClick={() => toggleDemoNotificationMode(true)}
                    className="mt-2 inline-flex items-center gap-1 text-[11px] font-mono text-indigo-400 hover:text-indigo-300 underline cursor-pointer"
                  >
                    <span>Try Demo Mode with Sample Events</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            ) : (
              filteredNotifications.map(notif => {
                const isUnread = !notif.read;
                const isHigh = notif.priority === 'HIGH';

                return (
                  <div
                    key={notif.id}
                    onClick={() => handleNotificationClick(notif)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative group ${
                      isHigh
                        ? isUnread
                          ? 'bg-gradient-to-r from-rose-950/40 via-slate-900 to-slate-900 border-rose-500/60 shadow-md shadow-rose-950/50 hover:border-rose-400'
                          : 'bg-slate-900/80 border-rose-900/40 hover:border-rose-500/40'
                        : isUnread
                        ? 'bg-slate-900/90 border-indigo-500/50 shadow-md shadow-indigo-500/10 hover:border-indigo-400'
                        : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 opacity-80 hover:opacity-100'
                    }`}
                  >
                    {/* Top Row: Source, Priority, Time, Unread Dot */}
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {getSourceBadge(notif.source, notif.isDemo)}
                        {getPriorityBadge(notif.priority)}
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-slate-400 whitespace-nowrap">
                          {formatTimeAgo(notif.timestamp)}
                        </span>
                        {isUnread && (
                          <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse shrink-0" />
                        )}
                      </div>
                    </div>

                    {/* Title */}
                    <h4 className={`text-xs font-bold leading-snug mb-1 ${isUnread ? 'text-white' : 'text-slate-300'}`}>
                      {notif.title}
                    </h4>

                    {/* Message */}
                    <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed">
                      {notif.message}
                    </p>

                    {/* Action link indicator */}
                    {(notif.url || notif.targetSection) && (
                      <div className="mt-2 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] font-mono text-indigo-400 group-hover:text-indigo-300">
                        <span>{notif.targetSection ? `Navigate to ${notif.targetSection}` : 'Open authorized link'}</span>
                        <ExternalLink className="w-3 h-3" />
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* FOOTER */}
          <div className="p-3 border-t border-slate-800/80 bg-slate-950/90 flex items-center justify-between text-[11px] font-mono">
            <span className="text-slate-400">
              {notifications.length} Total • {unreadNotificationsCount} Unread
            </span>

            <button
              onClick={() => {
                setActiveSection('chrona-connect');
                setIsOpen(false);
              }}
              className="text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1 cursor-pointer"
            >
              <span>Manage Integrations</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
