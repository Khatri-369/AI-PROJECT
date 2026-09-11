import React from 'react';
import { BarChart3, TrendingUp, CheckCircle, HelpCircle, AlertCircle, Award } from 'lucide-react';

export default function ProgressCard({ stats, onNavigate }) {
  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200/80 card-shadow card-shadow-hover flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <BarChart3 className="w-4 h-4 stroke-[2.2]" />
          </div>
          <h3 className="font-bold text-slate-800 text-base font-['Outfit']">Overall Progress</h3>
        </div>
        <span className="text-xl font-extrabold text-slate-900 font-['Outfit']">
          {stats.overallProgress}%
        </span>
      </div>

      {/* Main Progress Bar */}
      <div className="my-4">
        <div className="w-full bg-slate-100 rounded-full h-3.5 p-0.5 overflow-hidden">
          <div
            className="bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-600 h-2.5 rounded-full transition-all duration-500 shadow-sm"
            style={{ width: `${Math.min(100, Math.max(0, stats.overallProgress))}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-[11px] font-semibold text-slate-400 mt-1.5 px-0.5">
          <span>Started</span>
          <span className="text-indigo-600">Adaptive Goal: 85%</span>
          <span>Exam Ready</span>
        </div>
      </div>

      {/* 4 Stats Columns */}
      <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-100 text-center">
        <div 
          onClick={() => onNavigate('studyplan')} 
          className="p-2 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors"
        >
          <p className="text-base font-extrabold text-slate-900 font-['Outfit']">
            {stats.unitsCompleted}
          </p>
          <p className="text-[10px] font-semibold text-slate-400 mt-0.5 leading-tight">
            Units Completed
          </p>
        </div>

        <div 
          onClick={() => onNavigate('quiz')} 
          className="p-2 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors"
        >
          <p className="text-base font-extrabold text-slate-900 font-['Outfit']">
            {stats.quizzesTaken}
          </p>
          <p className="text-[10px] font-semibold text-slate-400 mt-0.5 leading-tight">
            Quizzes Taken
          </p>
        </div>

        <div 
          onClick={() => onNavigate('progress')} 
          className="p-2 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors"
        >
          <p className="text-base font-extrabold text-emerald-600 font-['Outfit']">
            {stats.averageScore}
          </p>
          <p className="text-[10px] font-semibold text-slate-400 mt-0.5 leading-tight">
            Average Score
          </p>
        </div>

        <div 
          onClick={() => onNavigate('progress')} 
          className="p-2 rounded-xl hover:bg-rose-50/60 cursor-pointer transition-colors"
        >
          <p className="text-base font-extrabold text-rose-500 font-['Outfit']">
            {stats.weakTopicCount}
          </p>
          <p className="text-[10px] font-semibold text-rose-500 mt-0.5 leading-tight">
            Weak Topics
          </p>
        </div>
      </div>
    </div>
  );
}
