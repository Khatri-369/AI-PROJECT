import React from 'react';
import { X, CheckCircle2, XCircle, AlertTriangle, ArrowRight, Sparkles, BookOpen } from 'lucide-react';

export default function QuizAnalysisModal({ isOpen, onClose, quiz, onGoToStudyPlan, onRetakeQuiz }) {
  if (!isOpen || !quiz) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] shadow-2xl border border-slate-100 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-extrabold text-sm">
              {quiz.score}%
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 font-['Outfit']">
                {quiz.title} — Detailed Evaluation
              </h3>
              <p className="text-xs text-slate-400">Completed on {quiz.date}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Agent Adaptation Notice */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-indigo-50 border border-amber-200/80">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 mt-0.5">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Adaptive Agent Action Triggered
                </h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Because score on Unit 2 is below 60%, the Agent has dynamically modified your upcoming schedule. 
                  <strong className="text-indigo-700 font-bold"> Day 9 Study Session</strong> has been updated to focus on <span className="underline font-semibold">NFA to DFA conversion</span> and <span className="underline font-semibold">Pumping Lemma proofs</span>.
                </p>
              </div>
            </div>
          </div>

          {/* Weak Topics List */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">
              Identified Weak Topics ({quiz.weakAreas.length})
            </h4>
            <div className="flex flex-wrap gap-2">
              {quiz.weakAreas.map((area, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 font-semibold text-xs flex items-center gap-1.5"
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                  {area}
                </span>
              ))}
            </div>
          </div>

          {/* Question Breakdown */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Questions & Explanations ({quiz.questions?.length || 0})
            </h4>

            {quiz.questions?.map((q, i) => (
              <div
                key={i}
                className={`p-4 rounded-2xl border ${
                  q.isCorrect ? 'bg-emerald-50/40 border-emerald-200/80' : 'bg-rose-50/40 border-rose-200/80'
                }`}
              >
                <div className="flex items-start gap-3">
                  {q.isCorrect ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                  )}
                  <div className="space-y-2 flex-1">
                    <p className="text-xs font-bold text-slate-800">
                      Q{i + 1}. {q.question}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div className="p-2 rounded-xl bg-white border border-slate-200">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Your Answer:</span>
                        <span className={`font-semibold ${q.isCorrect ? 'text-emerald-700' : 'text-rose-600'}`}>
                          {q.userAnswer}
                        </span>
                      </div>
                      <div className="p-2 rounded-xl bg-white border border-slate-200">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Correct Answer:</span>
                        <span className="font-semibold text-emerald-700">
                          {q.correctAnswer}
                        </span>
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-600 bg-white/70 p-2.5 rounded-xl border border-slate-200/60 leading-relaxed">
                      <span className="font-bold text-slate-800">Explanation: </span>
                      {q.explanation}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3 shrink-0">
          <button
            onClick={() => { onClose(); onRetakeQuiz(); }}
            className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-white text-xs font-bold transition-all"
          >
            Retake Quiz
          </button>
          <button
            onClick={() => { onClose(); onGoToStudyPlan(); }}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-500/20 flex items-center gap-1.5 transition-all"
          >
            <span>View Updated Study Plan</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
