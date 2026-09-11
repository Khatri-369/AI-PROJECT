import React from 'react';
import { FileQuestion, AlertCircle, ArrowRight, ChevronRight, Sparkles } from 'lucide-react';

export default function QuizResultCard({ quiz, onViewAnalysis, onNavigate }) {
  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200/80 card-shadow card-shadow-hover flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <FileQuestion className="w-4 h-4 stroke-[2.2]" />
          </div>
          <h3 className="font-bold text-slate-800 text-base font-['Outfit']">Recent Quiz Result</h3>
        </div>
        <button
          onClick={() => onNavigate('quiz')}
          className="text-xs font-semibold text-purple-600 hover:text-purple-700 hover:underline flex items-center gap-0.5"
        >
          View All
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Main Score & Date */}
      <div className="my-3 flex items-start justify-between">
        <div>
          <h4 className="text-lg font-bold text-slate-900 leading-snug">{quiz.title}</h4>
          <p className="text-xs font-medium text-slate-400 mt-0.5">{quiz.date}</p>
        </div>
        <div className="text-right">
          <span className="text-2xl font-black text-rose-500 font-['Outfit']">
            {quiz.score}%
          </span>
          <p className="text-[10px] font-bold text-rose-400 uppercase tracking-wider mt-0.5">
            Needs Revision
          </p>
        </div>
      </div>

      {/* Weak Areas Pills */}
      <div className="p-3 rounded-2xl bg-rose-50/70 border border-rose-100/90 my-2">
        <div className="flex items-center gap-1.5 text-xs font-bold text-rose-700 mb-2">
          <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
          <span>Weak Areas Detected by Agent</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {quiz.weakAreas.map((area, idx) => (
            <span
              key={idx}
              className="px-2.5 py-1 rounded-xl bg-white text-rose-600 border border-rose-200/70 text-[11px] font-semibold shadow-xs"
            >
              {area}
            </span>
          ))}
        </div>
      </div>

      {/* View Detailed Analysis Action */}
      <div className="pt-2">
        <button
          onClick={onViewAnalysis}
          className="w-full py-2.5 px-4 rounded-2xl bg-slate-50 hover:bg-indigo-50 border border-slate-200/80 hover:border-indigo-200 text-slate-700 hover:text-indigo-600 text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-95"
        >
          <span>View Detailed Analysis</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
