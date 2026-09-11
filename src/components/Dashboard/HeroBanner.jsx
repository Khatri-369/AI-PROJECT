import React from 'react';
import MascotRobot from '../MascotRobot';
import { 
  FileUp, 
  CalendarDays, 
  Bot, 
  ClipboardCheck, 
  LineChart, 
  ArrowRight 
} from 'lucide-react';

export default function HeroBanner({ onNavigate }) {
  const steps = [
    { id: 'upload', label: 'Upload Notes', icon: FileUp },
    { id: 'studyplan', label: 'Get Study Plan', icon: CalendarDays },
    { id: 'tutor', label: 'Learn with AI', icon: Bot },
    { id: 'quiz', label: 'Take Quizzes', icon: ClipboardCheck },
    { id: 'progress', label: 'Track Progress', icon: LineChart },
  ];

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-50/90 via-indigo-50/60 to-purple-50/70 border border-indigo-100/80 p-6 md:p-8 card-shadow">
      {/* Decorative gradient orbs */}
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-blue-300/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-indigo-300/20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6">
        {/* Left Welcome Copy & Stepper */}
        <div className="flex-1 text-left">
          <span className="text-sm font-bold text-indigo-600 tracking-wide">
            Hi Om,
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 mt-1 font-['Outfit'] tracking-tight">
            Let's make you exam-ready! 🚀
          </h2>
          <p className="text-sm md:text-base text-slate-600 mt-2 max-w-2xl font-normal leading-relaxed">
            Your AI study assistant is here to plan, teach, test and adapt — all in one place.
          </p>

          {/* Workflow Stepper */}
          <div className="mt-6 flex items-center flex-wrap gap-2 text-xs">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <React.Fragment key={step.id}>
                  <button
                    onClick={() => onNavigate(step.id)}
                    className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/90 hover:bg-white border border-slate-200/80 hover:border-indigo-300 text-slate-700 hover:text-indigo-600 font-semibold shadow-sm hover:shadow transition-all group active:scale-95"
                  >
                    <Icon className="w-3.5 h-3.5 text-indigo-500 group-hover:scale-110 transition-transform" />
                    <span>{step.label}</span>
                  </button>
                  {idx < steps.length - 1 && (
                    <ArrowRight className="w-3.5 h-3.5 text-slate-300 shrink-0 hidden sm:inline" />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Right 3D Robot Mascot */}
        <div className="shrink-0 flex items-center justify-center">
          <MascotRobot className="w-44 h-44 sm:w-52 sm:h-52" />
        </div>
      </div>
    </div>
  );
}
