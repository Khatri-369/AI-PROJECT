import React, { useState } from 'react';
import { Settings, Save, Database, ShieldCheck, User, Calendar, Clock } from 'lucide-react';

export default function SettingsView() {
  const [name, setName] = useState("Om Khatri");
  const [dailyHours, setDailyHours] = useState(2);
  const [examDate, setExamDate] = useState("2025-09-20");
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 card-shadow">
        <h2 className="text-2xl font-extrabold text-slate-900 font-['Outfit']">
          Application & Study Preferences
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Configure your study constraints, upcoming deadlines, and backend connectivity.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Profile Settings */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 card-shadow space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <User className="w-4 h-4 text-indigo-600" />
            <h3 className="font-bold text-slate-800 text-sm font-['Outfit']">Student Profile</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Student Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Primary Focus Exam</label>
              <input
                type="text"
                defaultValue="Theory of Computation (TOC)"
                className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Study Planner Constraints */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 card-shadow space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Clock className="w-4 h-4 text-indigo-600" />
            <h3 className="font-bold text-slate-800 text-sm font-['Outfit']">Agent Planner Constraints</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Upcoming Exam Date</label>
              <input
                type="date"
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase">Available Study Time</label>
                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full">{dailyHours} Hours/Day</span>
              </div>
              <input
                type="range"
                min="1"
                max="8"
                step="0.5"
                value={dailyHours}
                onChange={(e) => setDailyHours(Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer mt-2"
              />
            </div>
          </div>
        </div>

        {/* Supabase & Architecture Hookup Notice */}
        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-3xl p-6 border border-indigo-100 card-shadow">
          <div className="flex items-center gap-2.5 mb-2">
            <Database className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-slate-900 text-sm font-['Outfit']">
              Supabase & Agent Backend Connection
            </h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Ready for your backend and agent teammates. They can place environment variables in <code className="bg-white/80 px-1.5 py-0.5 rounded font-mono text-[11px] text-indigo-700">.env</code>:
          </p>
          <div className="mt-3 p-3 bg-slate-900 text-indigo-200 rounded-2xl text-[11px] font-mono leading-loose">
            VITE_SUPABASE_URL=https://your-project.supabase.co<br />
            VITE_SUPABASE_ANON_KEY=eyJhbGciOi...<br />
            VITE_AGENT_API_URL=http://localhost:5000/api
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-500/20 flex items-center gap-2 active:scale-95 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>{isSaved ? "Saved Successfully!" : "Save Preferences"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
