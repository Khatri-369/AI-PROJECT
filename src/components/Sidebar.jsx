import React from 'react';
import { 
  LayoutDashboard, 
  UploadCloud, 
  CalendarDays, 
  MessageSquareCode, 
  ClipboardCheck, 
  BarChart3, 
  Settings, 
  LogOut,
  Mountain
} from 'lucide-react';

export default function Sidebar({ currentView, onNavigate }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'upload', label: 'Upload Materials', icon: UploadCloud },
    { id: 'studyplan', label: 'Study Plan', icon: CalendarDays },
    { id: 'tutor', label: 'AI Tutor', icon: MessageSquareCode },
    { id: 'quiz', label: 'Quiz', icon: ClipboardCheck },
    { id: 'progress', label: 'Progress', icon: BarChart3 },
  ];

  return (
    <aside className="w-64 bg-white/70 backdrop-blur-md border-r border-slate-200/80 flex flex-col justify-between shrink-0 min-h-[calc(100vh-61px)] p-4 transition-all">
      {/* Top Nav Links */}
      <div className="space-y-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-indigo-50 to-blue-50/80 text-indigo-700 shadow-sm border border-indigo-100/80 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              <Icon className={`w-5 h-5 transition-transform duration-200 ${
                isActive ? 'text-indigo-600 scale-110' : 'text-slate-500'
              }`} />
              <span>{item.label}</span>
              {isActive && (
                <div className="ml-auto w-1.5 h-4 bg-indigo-600 rounded-full"></div>
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom Controls & Motivational Card */}
      <div className="space-y-4 pt-4 border-t border-slate-100">
        <div className="space-y-1">
          <button
            onClick={() => onNavigate('settings')}
            className={`w-full flex items-center gap-3.5 px-4 py-2.5 rounded-2xl text-sm font-medium transition-colors ${
              currentView === 'settings'
                ? 'bg-slate-100 text-slate-900 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
            }`}
          >
            <Settings className="w-4 h-4 text-slate-500" />
            <span>Settings</span>
          </button>
          <button
            onClick={() => alert("Logged out for demo. You can sign in back anytime.")}
            className="w-full flex items-center gap-3.5 px-4 py-2.5 rounded-2xl text-sm font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition-colors"
          >
            <LogOut className="w-4 h-4 text-slate-500 hover:text-rose-600" />
            <span>Logout</span>
          </button>
        </div>

        {/* Motivational Card */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 via-indigo-600 to-indigo-800 text-white p-4 shadow-lg shadow-indigo-500/15">
          {/* Subtle mountain backdrop pattern */}
          <div className="absolute inset-0 opacity-15 pointer-events-none flex items-end justify-center">
            <Mountain className="w-48 h-48 -mb-10 text-white" />
          </div>
          <div className="relative z-10">
            <p className="text-xs italic font-medium leading-relaxed tracking-wide text-indigo-50">
              "Discipline today leads to the results you want tomorrow."
            </p>
            <div className="mt-2.5 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping"></span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-200">Daily Focus</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
