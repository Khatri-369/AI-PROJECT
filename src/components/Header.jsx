import React, { useState } from 'react';
import { 
  GraduationCap, 
  Sparkles, 
  ArrowRight, 
  Bell, 
  ChevronDown, 
  Search,
  CheckCircle2,
  BookOpen,
  Calendar,
  AlertTriangle
} from 'lucide-react';

export default function Header({ onAskAI, onNavigate, notifications = [] }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onAskAI(searchQuery);
      setSearchQuery('');
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-6 py-3 flex items-center justify-between gap-4 transition-all">
      {/* Brand Logo */}
      <div 
        onClick={() => onNavigate('dashboard')}
        className="flex items-center gap-3 cursor-pointer select-none group"
      >
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
          <GraduationCap className="w-6 h-6 stroke-[2.2]" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <h1 className="text-xl font-extrabold bg-gradient-to-r from-blue-700 via-indigo-700 to-indigo-900 bg-clip-text text-transparent font-['Outfit'] tracking-tight">
              StudyAgent
            </h1>
          </div>
          <p className="text-[11px] font-medium text-slate-500 tracking-wide">
            Study Smarter. Score Higher.
          </p>
        </div>
      </div>

      {/* AI Search / Ask Bar */}
      <div className="flex-1 max-w-2xl mx-4">
        <form onSubmit={handleSearchSubmit} className="relative flex items-center">
          <div className="absolute left-3.5 text-indigo-500 pointer-events-none flex items-center gap-1">
            <Sparkles className="w-4 h-4 animate-pulse" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Ask anything about your study material..."
            className="w-full pl-10 pr-12 py-2.5 bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200/90 rounded-2xl text-sm font-medium text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all shadow-inner"
          />
          <button
            type="submit"
            aria-label="Submit search"
            className="absolute right-1.5 p-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm hover:from-blue-700 hover:to-indigo-700 hover:shadow-md transition-all active:scale-95"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Right User & Notification Controls */}
      <div className="flex items-center gap-4">
        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            aria-label="Toggle notifications"
            className="relative p-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100/90 active:bg-slate-200 transition-colors"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white"></span>
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 py-3 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="px-4 pb-2 border-b border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Notifications</span>
                <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-semibold">2 New</span>
              </div>
              <div className="divide-y divide-slate-50 max-h-72 overflow-y-auto">
                <div className="p-3 hover:bg-slate-50 transition-colors cursor-pointer flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 mt-0.5">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-800">Unit 2 Quiz Evaluated: 45%</p>
                    <p className="text-[11px] text-slate-500">Agent detected weak areas in NFA to DFA.</p>
                    <span className="text-[10px] text-slate-400">10 mins ago</span>
                  </div>
                </div>
                <div className="p-3 hover:bg-slate-50 transition-colors cursor-pointer flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-800">Study Plan Adapted</p>
                    <p className="text-[11px] text-slate-500">Extra revision slot allocated for Day 9.</p>
                    <span className="text-[10px] text-slate-400">1 hour ago</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Chip */}
        <div 
          onClick={() => onNavigate('settings')}
          className="flex items-center gap-3 pl-2 pr-3 py-1.5 rounded-2xl hover:bg-slate-100/80 cursor-pointer transition-colors border border-transparent hover:border-slate-200/60"
        >
          <div className="w-9 h-9 rounded-xl bg-slate-700 text-white flex items-center justify-center font-bold text-sm shadow-sm ring-2 ring-indigo-100">
            O
          </div>
          <div className="hidden sm:block text-left">
            <div className="text-xs font-bold text-slate-800 leading-tight">Om Khatri</div>
            <div className="text-[11px] font-medium text-indigo-600 leading-tight">Let's learn! 🚀</div>
          </div>
          <ChevronDown className="w-4 h-4 text-slate-400 hidden sm:block" />
        </div>
      </div>
    </header>
  );
}
