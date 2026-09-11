import React from 'react';
import { Layers, ChevronRight, Plus } from 'lucide-react';

export default function SubjectsCard({ subjects, onSelectSubject, onManage }) {
  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200/80 card-shadow card-shadow-hover flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Layers className="w-4 h-4 stroke-[2.2]" />
          </div>
          <h3 className="font-bold text-slate-800 text-base font-['Outfit']">Subjects</h3>
        </div>
        <button
          onClick={onManage}
          className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:underline"
        >
          Manage
        </button>
      </div>

      {/* Subjects List */}
      <div className="my-3 space-y-3.5">
        {subjects.map((subj) => (
          <div
            key={subj.id}
            onClick={() => onSelectSubject(subj)}
            className="group flex items-center justify-between gap-3 cursor-pointer p-1.5 rounded-xl hover:bg-slate-50 transition-colors"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-slate-700 group-hover:text-indigo-600 transition-colors truncate">
                  {subj.name}
                </span>
                <span className="text-xs font-bold text-slate-600 ml-2">
                  {subj.progress}%
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ 
                    width: `${subj.progress}%`,
                    backgroundColor: subj.color 
                  }}
                ></div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all shrink-0" />
          </div>
        ))}
      </div>

      {/* Quick Add subject button */}
      <div className="pt-2">
        <button
          onClick={onManage}
          className="w-full py-2 px-3 rounded-2xl border border-dashed border-slate-300 hover:border-indigo-400 hover:bg-indigo-50/30 text-slate-500 hover:text-indigo-600 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add New Subject or Syllabus</span>
        </button>
      </div>
    </div>
  );
}
