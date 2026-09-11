import React from 'react';
import { CheckCircle2, Circle, CheckSquare, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function TasksCard({ tasks, onToggleTask }) {
  const completedCount = tasks.filter(t => t.completed).length;
  const totalCount = tasks.length;

  const handleToggle = (taskId, currentlyCompleted) => {
    onToggleTask(taskId);
    if (!currentlyCompleted && completedCount + 1 === totalCount) {
      // Trigger confetti celebration when all tasks completed!
      try {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.7 }
        });
      } catch (e) {
        // Fallback
      }
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200/80 card-shadow card-shadow-hover flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckSquare className="w-4 h-4 stroke-[2.2]" />
          </div>
          <h3 className="font-bold text-slate-800 text-base font-['Outfit']">Today's Tasks</h3>
        </div>
        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
          {completedCount}/{totalCount} completed
        </span>
      </div>

      {/* Task List */}
      <div className="my-3 space-y-2.5">
        {tasks.map((task) => (
          <div
            key={task.id}
            onClick={() => handleToggle(task.id, task.completed)}
            className={`flex items-center gap-3 p-2.5 rounded-2xl cursor-pointer transition-all duration-150 border ${
              task.completed
                ? 'bg-slate-50/60 border-slate-100 text-slate-400'
                : 'bg-white hover:bg-indigo-50/40 border-slate-200/70 hover:border-indigo-200 text-slate-700 shadow-2xs'
            }`}
          >
            <button
              type="button"
              className={`w-5 h-5 rounded-lg flex items-center justify-center transition-all ${
                task.completed
                  ? 'bg-emerald-500 text-white shadow-xs'
                  : 'border-2 border-slate-300 hover:border-indigo-500 text-transparent'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
            </button>
            <span className={`text-xs font-semibold select-none flex-1 ${
              task.completed ? 'line-through text-slate-400' : 'text-slate-700'
            }`}>
              {task.text}
            </span>
            <span className="text-[10px] font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
              {task.estMinutes}m
            </span>
          </div>
        ))}
      </div>

      {/* Footer hint */}
      <div className="pt-2 text-center">
        <p className="text-[11px] text-slate-400 font-medium">
          💡 Completing today's tasks keeps your exam plan on schedule.
        </p>
      </div>
    </div>
  );
}
