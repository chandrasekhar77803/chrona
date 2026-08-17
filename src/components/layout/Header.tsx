import React, { useState, useRef, useEffect } from 'react';
import { useChrona } from '../../context/ChronaContext';
import { useAuth } from '../../context/AuthContext';
import { HelpCircle, Zap, User, Settings, LogOut, RefreshCw, ChevronDown, CheckCircle2, Globe } from 'lucide-react';

export const Header: React.FC = () => {
  const {
    studentProfile,
    openWhyRationale,
    toggleFocusBubble,
    isFocusBubbleActive,
    setActiveSection,
    activeSmartestAction,
    completeSmartestAction,
    currentLanguage,
    changeLanguage
  } = useChrona();
  const { currentUser, logout, switchAccount } = useAuth();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleWhyClick = () => {
    openWhyRationale(activeSmartestAction.rationale);
  };

  return (
    <header className="h-16 fixed top-0 right-0 left-64 glass-panel border-b border-slate-800/60 z-20 px-6 flex items-center justify-between">
      {/* Smartest Next Action Banner & Action Trigger */}
      <div className="flex items-center gap-3 bg-gradient-to-r from-indigo-950/60 via-purple-950/40 to-slate-900 px-3.5 py-1.5 rounded-full border border-indigo-500/30">
        <div className="flex items-center gap-2">
          <div className="relative flex items-center justify-center">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 animate-ping absolute" />
            <span className="w-2 h-2 rounded-full bg-indigo-500" />
          </div>
          <span className="text-xs font-bold text-indigo-300 font-mono tracking-tight uppercase">Smartest Next Action</span>
        </div>

        <span className="text-xs text-slate-200 font-semibold hidden md:inline">
          {activeSmartestAction.actionText} → <span className="text-emerald-400 font-mono">{activeSmartestAction.boostText}</span>
        </span>

        {/* Complete Action Button */}
        <button
          onClick={completeSmartestAction}
          className="flex items-center gap-1 text-[11px] font-bold text-emerald-300 hover:text-white bg-emerald-500/20 hover:bg-emerald-500/30 px-2.5 py-0.5 rounded-full border border-emerald-500/40 transition-colors cursor-pointer"
          title="Click to complete this action & advance to next AI recommendation"
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>Complete Action</span>
        </button>

        {/* Why Rationale Button */}
        <button
          onClick={handleWhyClick}
          className="flex items-center gap-1 text-[11px] font-bold text-purple-300 hover:text-purple-100 bg-purple-500/20 hover:bg-purple-500/30 px-2 py-0.5 rounded-full border border-purple-500/40 transition-colors cursor-pointer"
        >
          <HelpCircle className="w-3 h-3" />
          <span>Why?</span>
        </button>
      </div>

      {/* Action Controls & Top Right User Profile Menu */}
      <div className="flex items-center gap-3">
        {/* GLOBAL MULTILINGUAL LANGUAGE SELECTOR */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-indigo-300">
          <Globe className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
          <select
            value={currentLanguage}
            onChange={e => changeLanguage(e.target.value)}
            className="bg-transparent font-bold cursor-pointer focus:outline-none text-white text-xs"
            title="Choose Platform Language"
          >
            <option value="English" className="bg-slate-950 text-white">🌐 English</option>
            <option value="Telugu" className="bg-slate-950 text-white">🌐 Telugu (తెలుగు)</option>
            <option value="Hindi" className="bg-slate-950 text-white">🌐 Hindi (हिंदी)</option>
            <option value="Tamil" className="bg-slate-950 text-white">🌐 Tamil (தமிழ்)</option>
            <option value="Kannada" className="bg-slate-950 text-white">🌐 Kannada (కన్నడ)</option>
            <option value="Malayalam" className="bg-slate-950 text-white">🌐 Malayalam (മലയാളം)</option>
            <option value="Marathi" className="bg-slate-950 text-white">🌐 Marathi (मराठी)</option>
            <option value="Bengali" className="bg-slate-950 text-white">🌐 Bengali (বাংলা)</option>
            <option value="Gujarati" className="bg-slate-950 text-white">🌐 Gujarati (ગુજરાતી)</option>
            <option value="Punjabi" className="bg-slate-950 text-white">🌐 Punjabi (ਪੰਜਾਬੀ)</option>
          </select>
        </div>

        {/* Focus Bubble Mode Quick Launch */}
        <button
          onClick={() => toggleFocusBubble(!isFocusBubbleActive)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
            isFocusBubbleActive
              ? 'bg-purple-600 text-white border-purple-400 shadow-md shadow-purple-500/30'
              : 'bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-700'
          }`}
        >
          <Zap className={`w-3.5 h-3.5 ${isFocusBubbleActive ? 'text-amber-300 fill-amber-300' : 'text-purple-400'}`} />
          <span>Focus Bubble</span>
        </button>

        {/* TOP-RIGHT USER AVATAR DROPDOWN MENU */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 p-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800 transition-all cursor-pointer"
          >
            <img
              src={studentProfile.avatar || currentUser?.avatar}
              alt={currentUser?.name}
              className="w-7 h-7 rounded-lg object-cover border border-indigo-500/40"
            />
            <span className="text-xs font-bold text-slate-200 hidden md:inline max-w-[100px] truncate">
              {currentUser?.name}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {/* Dropdown Card */}
          {isDropdownOpen && (
            <div className="absolute right-0 top-12 w-56 glass-panel rounded-2xl border border-indigo-500/40 p-2 shadow-2xl bg-slate-950/95 animate-fadeIn z-50">
              {/* User Account Info Header */}
              <div className="p-2.5 mb-1 border-b border-slate-800">
                <div className="text-xs font-bold text-white truncate">{currentUser?.name}</div>
                <div className="text-[10px] text-slate-400 truncate">{currentUser?.email}</div>
                <div className="text-[10px] text-indigo-400 font-mono font-semibold mt-1">
                  Target: {studentProfile.dreamCompany}
                </div>
              </div>

              {/* Menu Items */}
              <div className="space-y-1">
                <button
                  onClick={() => {
                    setActiveSection('profile');
                    setIsDropdownOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-900 transition-colors"
                >
                  <User className="w-4 h-4 text-indigo-400" />
                  <span>My Profile</span>
                </button>

                <button
                  onClick={() => {
                    setActiveSection('settings');
                    setIsDropdownOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-900 transition-colors"
                >
                  <Settings className="w-4 h-4 text-purple-400" />
                  <span>Settings</span>
                </button>

                <button
                  onClick={() => {
                    setIsDropdownOpen(false);
                    switchAccount();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-amber-300 hover:bg-amber-950/40 transition-colors"
                >
                  <RefreshCw className="w-4 h-4 text-amber-400" />
                  <span>Switch Account</span>
                </button>

                <button
                  onClick={() => {
                    setIsDropdownOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-950/40 transition-colors border-t border-slate-800/80 mt-1 pt-2"
                >
                  <LogOut className="w-4 h-4 text-rose-400" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
