import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useChrona } from '../../context/ChronaContext';
import {
  saveCalendarEventToFirestore,
  getUserCalendarEventsFromFirestore,
  deleteCalendarEventFromFirestore,
  getDailyPlannerFromFirestore,
  getCareerGpsFromFirestore,
  type FirestoreCalendarEvent
} from '../../services/firebaseService';
import { VoiceInputField } from '../common/VoiceInputField';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  CheckCircle2,
  RefreshCw,
  Gift,
  Bell,
  Trash2,
  X,
  Layers
} from 'lucide-react';

export const CalendarView: React.FC = () => {
  const { currentUser } = useAuth();
  const { missions, toggleMission } = useChrona();

  // Active View Mode: 'month' | 'week' | 'day'
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');

  // Navigation State
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string>(new Date().toISOString().split('T')[0]);

  // Calendar Events State
  const [events, setEvents] = useState<FirestoreCalendarEvent[]>([]);
  const [dailySchedule, setDailySchedule] = useState<Array<{ timeSlot: string; activity: string; category?: string }>>([]);
  const [roadmapNodes, setRoadmapNodes] = useState<any[]>([]);

  // Search Query
  const [searchQuery, setSearchQuery] = useState<string>('');

  // UI Modal Controls
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isDateDetailOpen, setIsDateDetailOpen] = useState<boolean>(false);
  const [detailActiveTab, setDetailActiveTab] = useState<'tasks' | 'deadlines' | 'reminders' | 'notes' | 'mission' | 'gps' | 'schedule'>('tasks');
  const [aiRescheduling, setAiRescheduling] = useState<boolean>(false);

  // New Event Form State
  const [newEventTitle, setNewEventTitle] = useState<string>('');
  const [newEventDesc, setNewEventDesc] = useState<string>('');
  const [newEventCategory, setNewEventCategory] = useState<FirestoreCalendarEvent['category']>('Study');
  const [newEventType, setNewEventType] = useState<FirestoreCalendarEvent['type']>('Task');
  const [newEventPriority, setNewEventPriority] = useState<FirestoreCalendarEvent['priority']>('High');
  const [newEventMinutes, setNewEventMinutes] = useState<number>(45);
  const [newEventDueTime, setNewEventDueTime] = useState<string>('14:00');
  const [newEventRepeat, setNewEventRepeat] = useState<FirestoreCalendarEvent['repeat']>('None');
  const [newEventNotes, setNewEventNotes] = useState<string>('');

  // Load Firestore Data on Mount & Login
  useEffect(() => {
    const loadAllData = async () => {
      if (!currentUser) return;
      const fsEvents = await getUserCalendarEventsFromFirestore(currentUser.id);
      setEvents(fsEvents);

      const planner = await getDailyPlannerFromFirestore(currentUser.id);
      if (planner?.dailySchedule) {
        setDailySchedule(planner.dailySchedule);
      }

      const gps = await getCareerGpsFromFirestore(currentUser.id);
      if (gps?.roadmapNodes) {
        setRoadmapNodes(gps.roadmapNodes);
      }
    };

    loadAllData();
  }, [currentUser]);

  // Date Calculation Utilities
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    const now = new Date();
    setCurrentDate(now);
    setSelectedDateStr(now.toISOString().split('T')[0]);
  };

  // Generate Month Grid Days
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();

  const monthGridDays = useMemo(() => {
    const daysArr: Array<{ dateStr: string; dayNum: number; isCurrentMonth: boolean }> = [];
    const prevMonthLastDate = new Date(year, month, 0).getDate();

    // Padding from Previous Month
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const pDate = new Date(year, month - 1, prevMonthLastDate - i);
      daysArr.push({
        dateStr: pDate.toISOString().split('T')[0],
        dayNum: prevMonthLastDate - i,
        isCurrentMonth: false
      });
    }

    // Days of Current Month
    for (let d = 1; d <= daysInMonth; d++) {
      // Format YYYY-MM-DD cleanly in local timezone
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      daysArr.push({
        dateStr,
        dayNum: d,
        isCurrentMonth: true
      });
    }

    // Padding for Next Month grid completion to 35 or 42 cells
    const remainingCells = 35 - daysArr.length >= 0 ? 35 - daysArr.length : 42 - daysArr.length;
    for (let n = 1; n <= remainingCells; n++) {
      const nDate = new Date(year, month + 1, n);
      daysArr.push({
        dateStr: nDate.toISOString().split('T')[0],
        dayNum: n,
        isCurrentMonth: false
      });
    }

    return daysArr;
  }, [year, month, daysInMonth, firstDayIndex]);

  // Click Date Handler
  const handleDateClick = (dateStr: string) => {
    setSelectedDateStr(dateStr);
    setIsDateDetailOpen(true);
  };

  // Save New Event to Firestore
  const handleSaveNewEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle.trim() || !currentUser) return;

    const newEv: FirestoreCalendarEvent = {
      eventId: `cal_${Date.now()}`,
      userId: currentUser.id,
      date: selectedDateStr,
      title: newEventTitle.trim(),
      description: newEventDesc.trim(),
      category: newEventCategory,
      type: newEventType,
      priority: newEventPriority,
      estimatedMinutes: newEventMinutes,
      dueTime: newEventDueTime,
      repeat: newEventRepeat,
      status: 'Pending',
      notes: newEventNotes.trim(),
      createdAt: new Date().toISOString()
    };

    await saveCalendarEventToFirestore(currentUser.id, newEv);
    setEvents(prev => [...prev, newEv]);

    // Reset Form
    setNewEventTitle('');
    setNewEventDesc('');
    setNewEventNotes('');
    setIsAddModalOpen(false);
  };

  // Toggle Event Completed / Pending
  const toggleEventStatus = async (ev: FirestoreCalendarEvent) => {
    if (!currentUser) return;
    const updatedStatus = ev.status === 'Completed' ? 'Pending' : 'Completed';
    const updatedEv = { ...ev, status: updatedStatus as any };

    await saveCalendarEventToFirestore(currentUser.id, updatedEv);
    setEvents(prev => prev.map(e => (e.eventId === ev.eventId ? updatedEv : e)));
  };

  // Delete Calendar Event
  const handleDeleteEvent = async (eventId: string) => {
    if (!currentUser) return;
    await deleteCalendarEventFromFirestore(currentUser.id, eventId);
    setEvents(prev => prev.filter(e => e.eventId !== eventId));
  };

  // Move Overdue Task
  const handleMoveTask = async (ev: FirestoreCalendarEvent, targetDateStr: string) => {
    if (!currentUser) return;
    const updatedEv = { ...ev, date: targetDateStr, status: 'Pending' as const };
    await saveCalendarEventToFirestore(currentUser.id, updatedEv);
    setEvents(prev => prev.map(e => (e.eventId === ev.eventId ? updatedEv : e)));
  };

  // One-Click AI Auto-Reschedule & Workload Balance
  const handleAiAutoReschedule = async () => {
    if (!currentUser) return;
    setAiRescheduling(true);

    const todayStr = new Date().toISOString().split('T')[0];
    const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];

    // Find overdue or pending low priority tasks and reschedule to tomorrow
    const overdueEvents = events.filter(e => e.status === 'Overdue' || (e.date < todayStr && e.status !== 'Completed'));

    for (const ev of overdueEvents) {
      const rescheduledEv = { ...ev, date: tomorrowStr, status: 'Pending' as const };
      await saveCalendarEventToFirestore(currentUser.id, rescheduledEv);
    }

    const fsEvents = await getUserCalendarEventsFromFirestore(currentUser.id);
    setEvents(fsEvents);
    setAiRescheduling(false);
  };

  // Filter events by Search Query & Selected Date
  const filteredEventsForDate = (dateStr: string) => {
    return events.filter(e => {
      if (e.date !== dateStr) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return e.title.toLowerCase().includes(q) || e.category.toLowerCase().includes(q) || (e.description && e.description.toLowerCase().includes(q));
      }
      return true;
    });
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const selectedDateEvents = filteredEventsForDate(selectedDateStr);

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* CALENDAR HEADER & METRICS BAR */}
      <div className="glass-panel p-6 rounded-3xl border border-indigo-500/20 bg-slate-950/80 space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 font-mono text-xs font-semibold mb-1">
              <CalendarIcon className="w-4 h-4" />
              <span>CENTRAL TIME SYSTEM • MASTER CHRONA CALENDAR</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
              <span>📅 AI Central Master Calendar</span>
            </h1>
            <p className="text-xs text-slate-300 mt-1">
              Synchronized with Today's Mission, Career GPS Roadmaps, Plan My Day & Personal Deadlines.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleAiAutoReschedule}
              disabled={aiRescheduling}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-lg shadow-indigo-500/20"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${aiRescheduling ? 'animate-spin' : ''}`} />
              <span>{aiRescheduling ? 'AI Rescheduling Workload...' : 'One-Click AI Workload Reschedule'}</span>
            </button>

            <button
              onClick={() => {
                setSelectedDateStr(todayStr);
                setIsAddModalOpen(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>Add Event / Task</span>
            </button>
          </div>
        </div>

        {/* NAVIGATION & SEARCH TOOLBAR */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t border-slate-800">
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevMonth}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <h2 className="text-lg font-bold text-white font-mono min-w-[180px] text-center">
              {currentDate.toLocaleString('default', { month: 'long' })} {year}
            </h2>
            <button
              onClick={handleNextMonth}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              onClick={handleToday}
              className="px-3 py-1.5 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/40 text-indigo-300 font-mono text-xs font-bold cursor-pointer"
            >
              Today
            </button>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search tasks, deadlines, birthdays..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs font-mono">
              {(['month', 'week', 'day'] as const).map(mode => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-3 py-1 rounded-lg capitalize cursor-pointer transition-all ${
                    viewMode === mode ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* MONTH VIEW GRID */}
      {viewMode === 'month' && (
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 bg-slate-950/90 space-y-3">
          {/* DAY NAMES HEADER */}
          <div className="grid grid-cols-7 gap-2 text-center text-xs font-mono font-bold text-indigo-400 pb-2 border-b border-slate-800">
            <span>SUN</span>
            <span>MON</span>
            <span>TUE</span>
            <span>WED</span>
            <span>THU</span>
            <span>FRI</span>
            <span>SAT</span>
          </div>

          {/* MONTH GRID CELL TILES */}
          <div className="grid grid-cols-7 gap-2">
            {monthGridDays.map((cell, idx) => {
              const isToday = cell.dateStr === todayStr;
              const dateEvs = filteredEventsForDate(cell.dateStr);

              // Synced Today's Mission check for today's cell
              const missionCount = cell.dateStr === todayStr ? missions.length : 0;

              return (
                <div
                  key={idx}
                  onClick={() => handleDateClick(cell.dateStr)}
                  className={`p-2.5 rounded-2xl border min-h-[110px] sm:min-h-[130px] flex flex-col justify-between cursor-pointer transition-all hover:border-indigo-500/60 ${
                    isToday
                      ? 'bg-indigo-950/40 border-indigo-500 shadow-lg shadow-indigo-500/20'
                      : cell.isCurrentMonth
                      ? 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-900'
                      : 'bg-slate-950/40 border-slate-900/40 opacity-40'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className={`font-extrabold ${isToday ? 'text-indigo-400 text-sm font-black' : 'text-slate-300'}`}>
                      {cell.dayNum}
                    </span>
                    {isToday && (
                      <span className="px-2 py-0.5 rounded-full bg-indigo-600 text-white text-[9px] font-bold">
                        TODAY
                      </span>
                    )}
                  </div>

                  {/* PREVIEW BADGES */}
                  <div className="space-y-1 my-1 overflow-hidden">
                    {dateEvs.slice(0, 2).map(e => (
                      <div
                        key={e.eventId}
                        className={`px-2 py-1 rounded-lg text-[10px] font-mono truncate border flex items-center justify-between ${
                          e.status === 'Completed'
                            ? 'bg-slate-950 text-slate-500 line-through border-slate-800'
                            : e.type === 'Deadline'
                            ? 'bg-rose-950/60 text-rose-300 border-rose-800'
                            : e.type === 'Birthday'
                            ? 'bg-purple-950/60 text-purple-300 border-purple-800'
                            : 'bg-indigo-950/60 text-indigo-300 border-indigo-800'
                        }`}
                      >
                        <span className="truncate">{e.title}</span>
                      </div>
                    ))}

                    {missionCount > 0 && (
                      <div className="px-2 py-0.5 rounded-lg bg-emerald-950/60 text-emerald-300 border border-emerald-800 text-[10px] font-mono font-bold truncate">
                        ⚡ {missionCount} Missions
                      </div>
                    )}

                    {dateEvs.length > 2 && (
                      <div className="text-[9px] font-mono text-indigo-400 font-bold text-center">
                        +{dateEvs.length - 2} more items
                      </div>
                    )}
                  </div>

                  <div className="text-[10px] text-slate-500 font-mono pt-1 border-t border-slate-800/60 flex items-center justify-between">
                    <span>{dateEvs.length} items</span>
                    <span className="text-indigo-400">+ Add</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* WEEK VIEW GRID */}
      {viewMode === 'week' && (
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 bg-slate-950/90 space-y-4">
          <h3 className="text-base font-bold text-white font-mono flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-400" />
            <span>Weekly Schedule Breakdown</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
            {monthGridDays.slice(0, 7).map((cell, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="text-xs font-bold text-indigo-400 font-mono flex items-center justify-between">
                  <span>Day {idx + 1}</span>
                  <span>{cell.dateStr}</span>
                </div>

                <div className="space-y-2">
                  {filteredEventsForDate(cell.dateStr).map(e => (
                    <div key={e.eventId} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white space-y-1">
                      <div className="font-bold flex items-center justify-between">
                        <span>{e.title}</span>
                        <span className="text-[10px] text-indigo-300 font-mono">{e.dueTime}</span>
                      </div>
                      <p className="text-[10px] text-slate-400">{e.category}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* DAY VIEW GRID */}
      {viewMode === 'day' && (
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 bg-slate-950/90 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-base font-bold text-white font-mono">
              Day Planner View: {selectedDateStr}
            </h3>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold cursor-pointer"
            >
              + Add Event
            </button>
          </div>

          <div className="space-y-2">
            {dailySchedule.map((slot, idx) => (
              <div key={idx} className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                <span className="font-mono text-indigo-300 font-bold w-24">{slot.timeSlot}</span>
                <span className="text-white font-bold flex-1">{slot.activity}</span>
                <span className="px-2.5 py-1 rounded-full bg-slate-950 text-slate-400 font-mono text-[10px]">
                  {slot.category || 'Focus'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* DATE DETAIL PLANNER MODAL */}
      {isDateDetailOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-3xl max-h-[85vh] overflow-y-auto glass-panel p-6 sm:p-8 rounded-3xl border border-indigo-500/40 bg-slate-950/95 shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <span className="text-xs font-mono text-indigo-400 font-bold">DATE PLANNER BREAKDOWN</span>
                <h3 className="text-xl font-black text-white">{selectedDateStr}</h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-xs font-bold cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Task</span>
                </button>

                <button
                  onClick={() => setIsDateDetailOpen(false)}
                  className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* TAB SELECTOR */}
            <div className="flex items-center gap-2 overflow-x-auto border-b border-slate-800 pb-2 text-xs font-mono">
              {(['tasks', 'deadlines', 'reminders', 'notes', 'mission', 'gps', 'schedule'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setDetailActiveTab(tab)}
                  className={`px-3 py-1.5 rounded-xl font-bold uppercase transition-all cursor-pointer ${
                    detailActiveTab === tab ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* TAB 1: TASKS */}
            {detailActiveTab === 'tasks' && (
              <div className="space-y-3">
                {selectedDateEvents.filter(e => e.type === 'Task').length === 0 ? (
                  <div className="text-center py-8 text-slate-400 font-mono text-xs">
                    No custom tasks added for this date. Click "+ Add Task" to schedule!
                  </div>
                ) : (
                  selectedDateEvents.filter(e => e.type === 'Task').map(ev => (
                    <div
                      key={ev.eventId}
                      className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-4 text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => toggleEventStatus(ev)}
                          className={`w-5 h-5 rounded-lg border flex items-center justify-center cursor-pointer ${
                            ev.status === 'Completed' ? 'bg-emerald-600 border-emerald-400 text-white' : 'bg-slate-950 border-slate-700'
                          }`}
                        >
                          {ev.status === 'Completed' && <CheckCircle2 className="w-3.5 h-3.5" />}
                        </button>
                        <div>
                          <h4 className={`font-bold text-white ${ev.status === 'Completed' ? 'line-through text-slate-500' : ''}`}>
                            {ev.title}
                          </h4>
                          <span className="text-[10px] text-slate-400 font-mono">{ev.category} • {ev.estimatedMinutes} mins • {ev.priority} Priority</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleMoveTask(ev, new Date(Date.now() + 86400000).toISOString().split('T')[0])}
                          className="px-2.5 py-1 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[10px] font-mono text-indigo-300 cursor-pointer"
                        >
                          Move Tomorrow
                        </button>
                        <button
                          onClick={() => handleDeleteEvent(ev.eventId)}
                          className="p-1.5 rounded-xl bg-rose-950/40 text-rose-400 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* TAB 2: DEADLINES */}
            {detailActiveTab === 'deadlines' && (
              <div className="space-y-3">
                {selectedDateEvents.filter(e => e.type === 'Deadline').map(ev => (
                  <div key={ev.eventId} className="p-4 rounded-2xl bg-rose-950/30 border border-rose-500/40 flex items-center justify-between text-xs">
                    <div>
                      <h4 className="font-bold text-rose-200">{ev.title}</h4>
                      <p className="text-[10px] text-slate-400">{ev.description || 'Assignment / Exam Submission'}</p>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-rose-600 text-white font-mono text-[10px] font-bold">
                      DEADLINE
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* TAB 3: BIRTHDAYS & REMINDERS */}
            {detailActiveTab === 'reminders' && (
              <div className="space-y-3">
                {selectedDateEvents.filter(e => e.type === 'Birthday' || e.type === 'Reminder').map(ev => (
                  <div key={ev.eventId} className="p-4 rounded-2xl bg-purple-950/30 border border-purple-500/40 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      {ev.type === 'Birthday' ? <Gift className="w-4 h-4 text-purple-400" /> : <Bell className="w-4 h-4 text-indigo-400" />}
                      <span className="font-bold text-white">{ev.title}</span>
                    </div>
                    <span className="text-purple-300 font-mono text-[10px]">{ev.dueTime || 'All Day'}</span>
                  </div>
                ))}
              </div>
            )}

            {/* TAB 4: TODAY'S MISSION AUTO-SYNC */}
            {detailActiveTab === 'mission' && (
              <div className="space-y-3">
                {missions.map(m => (
                  <div key={m.id} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => toggleMission(m.id)}
                        className={`w-5 h-5 rounded-lg border flex items-center justify-center cursor-pointer ${
                          m.completed ? 'bg-emerald-600 border-emerald-400 text-white' : 'bg-slate-950 border-slate-700'
                        }`}
                      >
                        {m.completed && <CheckCircle2 className="w-3.5 h-3.5" />}
                      </button>
                      <span className={`font-bold text-white ${m.completed ? 'line-through text-slate-500' : ''}`}>⚡ {m.title}</span>
                    </div>
                    <span className="text-indigo-400 font-mono text-[10px]">{m.estimatedMinutes} mins</span>
                  </div>
                ))}
              </div>
            )}

            {/* TAB 5: CAREER GPS ROADMAP AUTO-SYNC */}
            {detailActiveTab === 'gps' && (
              <div className="space-y-3">
                {roadmapNodes.map((n, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 text-xs space-y-1">
                    <div className="font-bold text-indigo-300">{n.title}</div>
                    <p className="text-slate-300 text-[11px]">{n.subtitle}</p>
                  </div>
                ))}
              </div>
            )}

            {/* TAB 6: PLAN MY DAY SCHEDULE AUTO-SYNC */}
            {detailActiveTab === 'schedule' && (
              <div className="space-y-2">
                {dailySchedule.map((slot, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs flex items-center justify-between">
                    <span className="font-mono text-indigo-300 font-bold">{slot.timeSlot}</span>
                    <span className="text-white font-bold">{slot.activity}</span>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={() => setIsDateDetailOpen(false)}
              className="w-full py-3 rounded-2xl bg-indigo-600 text-white font-bold text-xs cursor-pointer"
            >
              Close Date Planner
            </button>
          </div>
        </div>
      )}

      {/* ADD TASK / EVENT MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <form onSubmit={handleSaveNewEvent} className="w-full max-w-lg glass-panel p-6 sm:p-8 rounded-3xl border border-indigo-500/40 bg-slate-950/95 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-indigo-400" />
                <span>Add Task to {selectedDateStr}</span>
              </h3>

              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <VoiceInputField
                  label="Task Title *"
                  placeholder="Type or speak (e.g. Add DSA practice tomorrow at 7 PM)..."
                  value={newEventTitle}
                  onChange={setNewEventTitle}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 font-mono block mb-1">Category</label>
                  <select
                    value={newEventCategory}
                    onChange={e => setNewEventCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-indigo-300 font-mono focus:outline-none"
                  >
                    <option value="Study">Study</option>
                    <option value="Assignment">Assignment</option>
                    <option value="Project">Project</option>
                    <option value="Exam">Exam</option>
                    <option value="Meeting">Meeting</option>
                    <option value="Personal">Personal</option>
                    <option value="Workout">Workout</option>
                    <option value="Internship">Internship</option>
                    <option value="Hackathon">Hackathon</option>
                    <option value="Custom">Custom</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 font-mono block mb-1">Item Type</label>
                  <select
                    value={newEventType}
                    onChange={e => setNewEventType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-indigo-300 font-mono focus:outline-none"
                  >
                    <option value="Task">Task</option>
                    <option value="Deadline">Deadline</option>
                    <option value="Birthday">Birthday</option>
                    <option value="Reminder">Reminder</option>
                    <option value="Note">Note</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2">
                <div>
                  <label className="text-slate-400 font-mono block mb-1">Priority</label>
                  <select
                    value={newEventPriority}
                    onChange={e => setNewEventPriority(e.target.value as any)}
                    className="w-full px-2 py-2 rounded-xl bg-slate-900 border border-slate-800 text-indigo-300 font-mono text-[11px] focus:outline-none"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 font-mono block mb-1">Duration (m)</label>
                  <input
                    type="number"
                    value={newEventMinutes}
                    onChange={e => setNewEventMinutes(Number(e.target.value))}
                    className="w-full px-2 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono text-[11px] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-400 font-mono block mb-1">Due Time</label>
                  <input
                    type="time"
                    value={newEventDueTime}
                    onChange={e => setNewEventDueTime(e.target.value)}
                    className="w-full px-2 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono text-[11px] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-400 font-mono block mb-1">Repeat</label>
                  <select
                    value={newEventRepeat}
                    onChange={e => setNewEventRepeat(e.target.value as any)}
                    className="w-full px-2 py-2 rounded-xl bg-slate-900 border border-slate-800 text-purple-300 font-mono text-[11px] focus:outline-none"
                  >
                    <option value="None">None</option>
                    <option value="Daily">Daily</option>
                    <option value="Weekly">Weekly</option>
                    <option value="Monthly">Monthly</option>
                  </select>
                </div>
              </div>

              <div>
                <VoiceInputField
                  label="Notes / Description"
                  isTextArea
                  rows={3}
                  placeholder="Type or speak optional details, links, or notes..."
                  value={newEventNotes}
                  onChange={setNewEventNotes}
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs cursor-pointer shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-2"
            >
              <span>Save Task to Calendar 🚀</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
