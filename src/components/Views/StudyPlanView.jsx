import React from 'react';
import { Calendar, Clock, CheckCircle2, AlertCircle, Sparkles, RefreshCw } from 'lucide-react';

export default function StudyPlanView({ plan = [], onRegenerate }) {
  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 card-shadow">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-600 border border-indigo-100">
              10-Day Exam Sprint
            </span>
            <span className="text-xs text-slate-400">Target: 20 Sep 2025</span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 font-['Outfit'] mt-1">
            Theory of Computation (TOC) — Adaptive Schedule
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Generated autonomously by the Planner Agent based on 2 hrs/day and quiz performance.
          </p>
        </div>
        <button
          onClick={onRegenerate}
          className="px-4 py-2.5 rounded-2xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold border border-indigo-200 flex items-center justify-center gap-2 transition-all active:scale-95 shrink-0"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Re-evaluate & Adapt Plan</span>
        </button>
      </div>

      {/* Adaptive Agent Highlight Box */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider">
            Live Agent Adaptation Active
          </h4>
          <p className="text-xs text-amber-800/90 mt-0.5 leading-relaxed">
            Following your 45% score on Unit 2 Quiz, Day 9 has been automatically converted from general mock tests to targeted remedial revision of <strong>NFA to DFA Conversion</strong> and <strong>Pumping Lemma</strong>.
          </p>
        </div>
      </div>

      {/* Days Timeline */}
      <div className="space-y-3">
        {plan.map((day) => {
          const isDone = day.status === 'completed';
          const isToday = day.isToday;
          const isAdaptive = day.status === 'adaptive';

          return (
            <div
              key={day.day}
              className={`p-5 rounded-3xl border transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                isToday
                  ? 'bg-gradient-to-r from-indigo-50/90 to-blue-50/90 border-indigo-300 ring-2 ring-indigo-500/20 card-shadow'
                  : isAdaptive
                  ? 'bg-amber-50/40 border-amber-200 card-shadow'
                  : isDone
                  ? 'bg-white/80 border-slate-200/60 opacity-80'
                  : 'bg-white border-slate-200/80 card-shadow'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 font-extrabold text-sm ${
                  isDone
                    ? 'bg-emerald-500 text-white'
                    : isToday
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                    : isAdaptive
                    ? 'bg-amber-500 text-white'
                    : 'bg-slate-100 text-slate-700'
                }`}>
                  {isDone ? <CheckCircle2 className="w-5 h-5" /> : `D${day.day}`}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-sm font-bold text-slate-900">{day.title}</h4>
                    {isToday && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-600 text-white">
                        Today's Target
                      </span>
                    )}
                    {isAdaptive && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        Adapted by AI
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{day.desc}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 sm:self-center self-end">
                <span className="text-xs font-semibold text-slate-500 bg-white px-3 py-1.5 rounded-xl border border-slate-200 flex items-center gap-1.5 shadow-2xs">
                  <Clock className="w-3.5 h-3.5 text-indigo-500" />
                  {day.hours} hrs
                </span>
                <span className={`text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-xl ${
                  isDone
                    ? 'text-emerald-700 bg-emerald-50 border border-emerald-200'
                    : isToday
                    ? 'text-indigo-700 bg-indigo-50 border border-indigo-200'
                    : 'text-slate-400 bg-slate-50 border border-slate-200'
                }`}>
                  {isDone ? 'Finished' : isToday ? 'Active' : 'Scheduled'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
