import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useChrona } from '../../context/ChronaContext';
import {
  saveLanguageSettingsToFirestore,
  getUserLanguageSettingsFromFirestore,
  type FirestoreLanguageSettings
} from '../../services/firebaseService';
import { Settings as SettingsIcon, Sun, Moon, Bell, Brain, Globe, CheckCircle2, Code, Zap, RefreshCw } from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { theme, toggleTheme, openProductTour, currentLanguage, changeLanguage, studentProfile, updateStudentProfile, syncLeetCodeStats } = useChrona();
  const { currentUser } = useAuth();

  const [prefLang, setPrefLang] = useState<string>(currentLanguage || 'English');
  const [speechLang, setSpeechLang] = useState<string>('en-US');
  const [autoDetect, setAutoDetect] = useState<boolean>(true);
  const [bilingual, setBilingual] = useState<boolean>(false);
  const [isSaved, setIsSaved] = useState<boolean>(false);

  // LeetCode Integration State
  const [leetcodeInput, setLeetcodeInput] = useState<string>(studentProfile.leetcodeUsername || '');
  const [isSyncingLeetCode, setIsSyncingLeetCode] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const handleSyncLeetCode = async () => {
    if (!leetcodeInput.trim()) return;
    setIsSyncingLeetCode(true);
    try {
      const { readinessIncreased } = await syncLeetCodeStats(leetcodeInput.trim());
      if (readinessIncreased) {
        setToastMsg("LeetCode Sync Complete: +1.2% Placement Readiness!");
        setTimeout(() => setToastMsg(null), 4000);
      } else {
        setToastMsg("🟢 LeetCode Stats Synchronized Successfully!");
        setTimeout(() => setToastMsg(null), 3000);
      }
    } catch (err) {
      console.error('Error syncing LeetCode account:', err);
      setToastMsg("⚠️ Error syncing LeetCode profile. Please check username.");
      setTimeout(() => setToastMsg(null), 3000);
    } finally {
      setIsSyncingLeetCode(false);
    }
  };

  const handleDisconnectLeetCode = () => {
    updateStudentProfile({ leetcodeUsername: undefined, leetcodeStats: undefined });
    setLeetcodeInput('');
    setToastMsg("Disconnected LeetCode Account.");
    setTimeout(() => setToastMsg(null), 3000);
  };

  useEffect(() => {
    setPrefLang(currentLanguage);
  }, [currentLanguage]);

  useEffect(() => {
    const loadLangSettings = async () => {
      if (!currentUser) return;
      const data = await getUserLanguageSettingsFromFirestore(currentUser.id);
      if (data) {
        setPrefLang(data.preferredLanguage);
        setSpeechLang(data.speechLanguageCode);
        setAutoDetect(data.autoLanguageDetect);
        setBilingual(data.bilingualMode);
      }
    };

    loadLangSettings();
  }, [currentUser]);

  const handleSaveLanguageSettings = async () => {
    if (!currentUser) return;
    await changeLanguage(prefLang);
    const settings: FirestoreLanguageSettings = {
      preferredLanguage: prefLang,
      speechLanguageCode: speechLang,
      outputLanguage: bilingual ? `${prefLang} + English (Bilingual)` : prefLang,
      autoLanguageDetect: autoDetect,
      bilingualMode: bilingual,
      updatedAt: new Date().toISOString()
    };

    await saveLanguageSettingsToFirestore(currentUser.id, settings);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div id="tab-settings" className="space-y-8 animate-fadeIn pb-12">
      <div className="glass-panel p-6 rounded-2xl border border-indigo-500/30 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-purple-950/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
            <SettingsIcon className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-white">System Settings & Preferences</h1>
            <p className="text-xs text-slate-300">Customize AI tuning, theme, notification intervals & privacy controls</p>
          </div>
        </div>
      </div>

      <div className="max-w-3xl space-y-6">
        {/* LEETCODE INTEGRATION SETTINGS CARD */}
        <div id="leetcode-integration-card" className="glass-panel p-6 rounded-2xl border border-amber-500/30 bg-slate-950/90 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <div className="text-sm font-bold text-white flex items-center gap-2">
                <Code className="w-4 h-4 text-amber-400" />
                <span>LeetCode Integration & Automatic Stats Sync</span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">Link your LeetCode username to verify DSA practice, auto-complete daily missions, and boost Placement Readiness.</p>
            </div>
            {toastMsg && (
              <span className="text-xs font-mono text-emerald-400 font-bold flex items-center gap-1 animate-pulse">
                <CheckCircle2 className="w-3.5 h-3.5" /> {toastMsg}
              </span>
            )}
          </div>

          {/* INPUT FORM */}
          <div className="space-y-3">
            <label htmlFor="leetcode-username-input" className="text-xs font-mono text-slate-300 block font-semibold">
              LeetCode Profile Username
            </label>
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <input
                id="leetcode-username-input"
                type="text"
                value={leetcodeInput}
                onChange={e => setLeetcodeInput(e.target.value)}
                placeholder="Enter LeetCode Username (e.g., alex_vance)"
                className="w-full sm:flex-1 p-3 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono text-xs focus:outline-none focus:border-amber-500/50 transition-colors"
              />
              <button
                id="btn-sync-leetcode"
                onClick={handleSyncLeetCode}
                disabled={isSyncingLeetCode || !leetcodeInput.trim()}
                className="btn-primary w-full sm:w-auto px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 disabled:opacity-50 text-white font-bold font-mono text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-amber-500/20 transition-all shrink-0"
              >
                {isSyncingLeetCode ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Syncing API...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    <span>⚡ Connect LeetCode Account</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* CONNECTED PROFILE SUMMARY CARD (#leetcode-stats-card) */}
          {studentProfile.leetcodeStats && (
            <div id="leetcode-stats-card" className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border border-amber-500/40 space-y-4 animate-fadeIn shadow-2xl">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-extrabold text-white font-mono">@{studentProfile.leetcodeStats.username}</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-mono font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                      <span>🟢 Synced with LeetCode API</span>
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 font-mono">
                    Global Rank: <strong className="text-amber-300">#{studentProfile.leetcodeStats.ranking.toLocaleString()}</strong>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 rounded-xl bg-orange-500/20 text-orange-400 border border-orange-500/30 text-xs font-mono font-bold flex items-center gap-1.5">
                    <span>🔥</span>
                    <span>{studentProfile.leetcodeStats.streakDays || 14} Day Streak</span>
                  </span>

                  <button
                    onClick={handleSyncLeetCode}
                    disabled={isSyncingLeetCode}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono cursor-pointer border border-slate-700"
                    title="Refresh LeetCode Stats"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSyncingLeetCode ? 'animate-spin' : ''}`} />
                  </button>

                  <button
                    onClick={handleDisconnectLeetCode}
                    className="p-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/50 text-rose-300 text-xs font-mono cursor-pointer border border-rose-500/30"
                    title="Disconnect LeetCode Account"
                  >
                    Disconnect
                  </button>
                </div>
              </div>

              {/* Solved Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center font-mono">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-[11px] text-slate-400 block uppercase">Total Solved</span>
                  <span className="text-xl font-black text-white">{studentProfile.leetcodeStats.totalSolved}</span>
                </div>

                <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-1">
                  <span className="text-[11px] text-emerald-400 block uppercase font-bold">Easy</span>
                  <span className="text-xl font-black text-emerald-300">{studentProfile.leetcodeStats.easySolved}</span>
                </div>

                <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/30 space-y-1">
                  <span className="text-[11px] text-amber-400 block uppercase font-bold">Medium</span>
                  <span className="text-xl font-black text-amber-300">{studentProfile.leetcodeStats.mediumSolved}</span>
                </div>

                <div className="p-3 rounded-xl bg-rose-950/20 border border-rose-500/30 space-y-1">
                  <span className="text-[11px] text-rose-400 block uppercase font-bold">Hard</span>
                  <span className="text-xl font-black text-rose-300">{studentProfile.leetcodeStats.hardSolved}</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-1">
                <span>Last Synced: {new Date(studentProfile.leetcodeStats.lastSyncedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                <span className="text-indigo-300">Acceptance Rate: {studentProfile.leetcodeStats.acceptanceRate || 71.4}%</span>
              </div>
            </div>
          )}
        </div>
        {/* MULTILINGUAL & LOCALIZATION SETTINGS */}
        <div className="glass-panel p-6 rounded-2xl border border-indigo-500/30 bg-slate-950/80 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="text-sm font-bold text-white flex items-center gap-2">
              <Globe className="w-4 h-4 text-emerald-400" />
              <span>Multilingual Platform & Voice Settings</span>
            </div>
            {isSaved && (
              <span className="text-xs font-mono text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Saved to Firestore!
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-slate-400 font-mono block mb-1">Preferred Interface Language</label>
              <select
                value={prefLang}
                onChange={e => setPrefLang(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono focus:outline-none"
              >
                <option value="English">English</option>
                <option value="Telugu">Telugu (తెలుగు)</option>
                <option value="Hindi">Hindi (हिंदी)</option>
                <option value="Tamil">Tamil (தமிழ்)</option>
                <option value="Kannada">Kannada (కన్నడ)</option>
                <option value="Malayalam">Malayalam (മലയാളം)</option>
                <option value="Marathi">Marathi (मराठी)</option>
                <option value="Bengali">Bengali (বাংলা)</option>
                <option value="Gujarati">Gujarati (ગુજરાતી)</option>
                <option value="Punjabi">Punjabi (ਪੰਜਾਬੀ)</option>
              </select>
            </div>

            <div>
              <label className="text-slate-400 font-mono block mb-1">Default Speech Input Language</label>
              <select
                value={speechLang}
                onChange={e => setSpeechLang(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-indigo-300 font-mono focus:outline-none"
              >
                <option value="en-US">English (en-US)</option>
                <option value="te-IN">Telugu (te-IN)</option>
                <option value="hi-IN">Hindi (hi-IN)</option>
                <option value="ta-IN">Tamil (ta-IN)</option>
                <option value="kn-IN">Kannada (kn-IN)</option>
                <option value="ml-IN">Malayalam (ml-IN)</option>
                <option value="mr-IN">Marathi (mr-IN)</option>
                <option value="bn-IN">Bengali (bn-IN)</option>
                <option value="gu-IN">Gujarati (gu-IN)</option>
                <option value="pa-IN">Punjabi (pa-IN)</option>
              </select>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-800 text-xs">
            <label className="flex items-center gap-3 text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={autoDetect}
                onChange={e => setAutoDetect(e.target.checked)}
                className="rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500"
              />
              <span>Enable Automatic Speech Language Detection</span>
            </label>

            <label className="flex items-center gap-3 text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={bilingual}
                onChange={e => setBilingual(e.target.checked)}
                className="rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500"
              />
              <span>Enable Bilingual Mode (Native Language + English Dual Output)</span>
            </label>
          </div>

          <button
            onClick={handleSaveLanguageSettings}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold font-mono text-xs cursor-pointer shadow-lg"
          >
            Save Multilingual Preferences to Firestore 🌐
          </button>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-sm font-bold text-white flex items-center gap-2">
              {theme === 'dark' ? <Moon className="w-4 h-4 text-indigo-400" /> : <Sun className="w-4 h-4 text-amber-400" />}
              <span>Appearance & Theme</span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">Switch between glassmorphic dark theme and crisp light theme</p>
          </div>

          <button
            onClick={toggleTheme}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition-colors"
          >
            {theme === 'dark' ? 'Switch to Light Mode ☀️' : 'Switch to Dark Mode 🌙'}
          </button>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="text-sm font-bold text-white flex items-center gap-2">
            <Brain className="w-4 h-4 text-purple-400" />
            <span>AI Personalization & Challenge Level</span>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300">Learning Speed Pace</span>
              <span className="font-mono text-indigo-400 font-bold">1.4x Accelerated</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300">Peak Focus Prediction Model</span>
              <span className="font-mono text-purple-400 font-bold">Chronotype v3.1</span>
            </div>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="text-sm font-bold text-white flex items-center gap-2">
            <Bell className="w-4 h-4 text-indigo-400" />
            <span>Smart Notifications</span>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-3 text-xs text-slate-300 cursor-pointer">
              <input type="checkbox" defaultChecked className="rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500" />
              <span>Daily Morning Mission AI Generation Alert (08:30 AM)</span>
            </label>
            <label className="flex items-center gap-3 text-xs text-slate-300 cursor-pointer">
              <input type="checkbox" defaultChecked className="rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500" />
              <span>Peak Focus Window Auto-Launch Reminders</span>
            </label>
          </div>
        </div>

        {/* Product Tour Replay Section */}
        <div className="glass-panel p-6 rounded-2xl border border-purple-500/30 bg-purple-950/20 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-bold text-white flex items-center gap-2">
                <span className="text-purple-400">🎥</span>
                <span>Chrona Product Tour & Cinematic Showcase</span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">Re-watch the 60-second product tour to learn about Chrona AI features</p>
            </div>
            <button
              onClick={openProductTour}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md shadow-purple-500/20 cursor-pointer transition-all"
            >
              Watch Product Tour 🎥
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
