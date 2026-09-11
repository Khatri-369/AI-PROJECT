import React from 'react';
import { Calendar, Clock, BookOpen, CheckCircle2, ChevronRight } from 'lucide-react';

export default function ExamCard({ exam, onNavigate }) {
  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200/80 card-shadow card-shadow-hover flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Calendar className="w-4 h-4 stroke-[2.2]" />
          </div>
          <h3 className="font-bold text-slate-800 text-base font-['Outfit']">Upcoming Exam</h3>
        </div>
        <button
          onClick={() => onNavigate('studyplan')}
          className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-0.5"
        >
          View All
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Main Subject & Badge */}
      <div className="my-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h4 className="text-lg font-bold text-slate-900 leading-snug">
              {exam.subject}
            </h4>
            <p className="text-xs font-medium text-slate-500 mt-1 flex items-center gap-1.5">
              <span>{exam.date}</span>
              <span className="w-1 h-1 rounded-full bg-slate-300"></span>
              <span className="text-indigo-600 font-semibold">({exam.daysLeft} days left)</span>
            </p>
          </div>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-200/60 shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            {exam.status}
          </span>
        </div>
      </div>

      {/* Stats Pills */}
      <div className="grid grid-cols-2 gap-3 pt-2">
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100/90">
          <div className="w-8 h-8 rounded-xl bg-white shadow-xs flex items-center justify-center text-slate-700">
            <Clock className="w-4 h-4 text-indigo-600" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-slate-400">Study Time per Day</p>
            <p className="text-sm font-bold text-slate-800">{exam.dailyStudyHours} hours</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100/90">
          <div className="w-8 h-8 rounded-xl bg-white shadow-xs flex items-center justify-center text-slate-700">
            <BookOpen className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-slate-400">Total Units</p>
            <p className="text-sm font-bold text-slate-800">{exam.totalUnits} Units</p>
          </div>
        </div>
      </div>
    </div>
  );
}
