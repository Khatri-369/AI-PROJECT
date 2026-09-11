import React from 'react';
import { Sparkles, ArrowRight, Flag, Heart } from 'lucide-react';

export default function MotivationalFooter({ onActionClick }) {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-100/70 via-indigo-100/60 to-purple-100/60 border border-indigo-200/60 p-5 md:p-6 card-shadow flex flex-col sm:flex-row items-center justify-between gap-4">
      {/* Flag / Mountain icon & message */}
      <div className="flex items-center gap-4 text-center sm:text-left">
        <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-indigo-500/20">
          <Flag className="w-6 h-6 stroke-[2.2]" />
        </div>
        <div>
          <h4 className="text-base font-extrabold text-slate-800 font-['Outfit']">
            "Small consistent steps lead to big results."
          </h4>
          <p className="text-xs font-semibold text-slate-500 mt-0.5 flex items-center justify-center sm:justify-start gap-1">
            <span>Keep going, you're doing great!</span>
            <span className="text-blue-600">💙</span>
          </p>
        </div>
      </div>

      {/* Button */}
      <button
        onClick={onActionClick}
        className="px-5 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-500/20 flex items-center gap-2 transition-all hover:scale-105 active:scale-95 shrink-0"
      >
        <span>Be so good they can't say no.</span>
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}
