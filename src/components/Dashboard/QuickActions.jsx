import React from 'react';
import { 
  Zap, 
  UploadCloud, 
  MessageSquare, 
  ClipboardCheck, 
  CalendarDays 
} from 'lucide-react';

export default function QuickActions({ 
  onUploadClick, 
  onAskTutorClick, 
  onTakeQuizClick, 
  onViewPlanClick 
}) {
  const actions = [
    {
      id: 'upload',
      title: 'Upload Notes/PDFs',
      icon: UploadCloud,
      bgColor: 'bg-blue-50/90 hover:bg-blue-100/90',
      iconBg: 'bg-blue-500 text-white',
      borderColor: 'border-blue-200/70',
      textColor: 'text-blue-950',
      onClick: onUploadClick,
    },
    {
      id: 'tutor',
      title: 'Ask AI Tutor',
      icon: MessageSquare,
      bgColor: 'bg-emerald-50/90 hover:bg-emerald-100/90',
      iconBg: 'bg-emerald-500 text-white',
      borderColor: 'border-emerald-200/70',
      textColor: 'text-emerald-950',
      onClick: onAskTutorClick,
    },
    {
      id: 'quiz',
      title: 'Take a Quiz',
      icon: ClipboardCheck,
      bgColor: 'bg-purple-50/90 hover:bg-purple-100/90',
      iconBg: 'bg-purple-500 text-white',
      borderColor: 'border-purple-200/70',
      textColor: 'text-purple-950',
      onClick: onTakeQuizClick,
    },
    {
      id: 'plan',
      title: 'View Study Plan',
      icon: CalendarDays,
      bgColor: 'bg-amber-50/90 hover:bg-amber-100/90',
      iconBg: 'bg-amber-500 text-white',
      borderColor: 'border-amber-200/70',
      textColor: 'text-amber-950',
      onClick: onViewPlanClick,
    },
  ];

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200/80 card-shadow card-shadow-hover flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Zap className="w-4 h-4 stroke-[2.2]" />
          </div>
          <h3 className="font-bold text-slate-800 text-base font-['Outfit']">Quick Actions</h3>
        </div>
      </div>

      {/* 2x2 Action Buttons Grid */}
      <div className="grid grid-cols-2 gap-3 my-3">
        {actions.map((act) => {
          const Icon = act.icon;
          return (
            <button
              key={act.id}
              onClick={act.onClick}
              className={`p-4 rounded-2xl border ${act.borderColor} ${act.bgColor} flex flex-col items-center justify-center text-center gap-2.5 transition-all duration-200 shadow-2xs hover:shadow-md hover:-translate-y-0.5 active:scale-95 group`}
            >
              <div className={`w-10 h-10 rounded-xl ${act.iconBg} flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform`}>
                <Icon className="w-5 h-5 stroke-[2.2]" />
              </div>
              <span className={`text-xs font-bold ${act.textColor} leading-tight`}>
                {act.title}
              </span>
            </button>
          );
        })}
      </div>

      {/* Helper text */}
      <div className="pt-1 text-center">
        <span className="text-[11px] font-medium text-slate-400">
          ⚡ One-click shortcuts to key agent workflows
        </span>
      </div>
    </div>
  );
}
