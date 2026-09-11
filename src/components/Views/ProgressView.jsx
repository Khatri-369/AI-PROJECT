import React from 'react';
import { BarChart3, AlertCircle, TrendingUp, CheckCircle2, BookOpen, Sparkles } from 'lucide-react';

export default function ProgressView({ stats, onNavigate }) {
  const topics = [
    { name: "Deterministic & Non-Deterministic Automata (DFA/NFA)", unit: "Unit 1", mastery: 90, status: "Mastered", color: "bg-emerald-500" },
    { name: "NFA to DFA Subset Construction", unit: "Unit 2", mastery: 40, status: "Weak", color: "bg-rose-500" },
    { name: "Regular Expressions & Arden's Theorem", unit: "Unit 2", mastery: 55, status: "Review", color: "bg-amber-500" },
    { name: "Pumping Lemma for Non-Regularity Proofs", unit: "Unit 2", mastery: 35, status: "Weak", color: "bg-rose-500" },
    { name: "Context-Free Grammars & Parse Trees", unit: "Unit 3", mastery: 75, status: "Good", color: "bg-blue-500" },
    { name: "Pushdown Automata (PDA)", unit: "Unit 3", mastery: 65, status: "Good", color: "bg-indigo-500" },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 card-shadow">
        <h2 className="text-2xl font-extrabold text-slate-900 font-['Outfit']">
          Topic Mastery & Adaptive Analytics
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Detailed cognitive breakdown of what you have mastered vs where the Agent is intervening with extra revision.
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 card-shadow text-center">
          <p className="text-2xl font-black text-slate-900 font-['Outfit']">{stats.overallProgress}%</p>
          <p className="text-xs font-bold text-slate-400 mt-1">Overall Mastery</p>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 card-shadow text-center">
          <p className="text-2xl font-black text-indigo-600 font-['Outfit']">{stats.unitsCompleted}</p>
          <p className="text-xs font-bold text-slate-400 mt-1">Units Covered</p>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 card-shadow text-center">
          <p className="text-2xl font-black text-emerald-600 font-['Outfit']">{stats.averageScore}</p>
          <p className="text-xs font-bold text-slate-400 mt-1">Avg Quiz Score</p>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 card-shadow text-center">
          <p className="text-2xl font-black text-rose-500 font-['Outfit']">{stats.weakTopicCount}</p>
          <p className="text-xs font-bold text-rose-500 mt-1">Weak Focus Areas</p>
        </div>
      </div>

      {/* Detailed Mastery Table */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 card-shadow">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-3">
          <h3 className="font-bold text-slate-800 text-sm font-['Outfit']">Topic-Level Mastery Breakdown</h3>
          <span className="text-xs text-slate-400">Targeting TOC Exam on 20 Sep</span>
        </div>

        <div className="space-y-4">
          {topics.map((t, idx) => (
            <div key={idx} className="p-3.5 rounded-2xl bg-slate-50/70 border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">{t.unit}</span>
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                    t.status === 'Weak' ? 'bg-rose-100 text-rose-700' :
                    t.status === 'Mastered' ? 'bg-emerald-100 text-emerald-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>{t.status}</span>
                </div>
                <p className="text-xs font-bold text-slate-800 mt-1">{t.name}</p>
              </div>

              <div className="w-full sm:w-48 flex items-center gap-3">
                <div className="flex-1 bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div className={`h-full rounded-full ${t.color}`} style={{ width: `${t.mastery}%` }}></div>
                </div>
                <span className="text-xs font-bold text-slate-700 w-8 text-right">{t.mastery}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
