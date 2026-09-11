import React, { useState } from 'react';
import { X, CheckCircle2, AlertCircle, ArrowRight, HelpCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function QuickQuizModal({ isOpen, onClose, questions = [], onQuizSubmitted }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const currentQ = questions[currentIndex] || questions[0];

  const handleSelectOption = (index) => {
    if (isSubmitted) return;
    setSelectedAnswers({
      ...selectedAnswers,
      [currentIndex]: index,
    });
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Calculate score
      let correct = 0;
      questions.forEach((q, idx) => {
        if (selectedAnswers[idx] === q.correctIndex) {
          correct += 1;
        }
      });
      const scorePercentage = Math.round((correct / questions.length) * 100);
      setIsSubmitted(true);

      if (scorePercentage >= 60) {
        try {
          confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
        } catch (e) {}
      }

      onQuizSubmitted({
        score: scorePercentage,
        correctCount: correct,
        total: questions.length
      });
    }
  };

  const resetQuiz = () => {
    setSelectedAnswers({});
    setIsSubmitted(false);
    setCurrentIndex(0);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
              TOC Quick Quiz
            </span>
            <h3 className="text-lg font-bold text-slate-900 font-['Outfit'] mt-1">
              Question {currentIndex + 1} of {questions.length}
            </h3>
          </div>
          <button
            onClick={resetQuiz}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Question & Options */}
        <div className="p-6">
          <p className="text-sm font-bold text-slate-800 mb-5 leading-relaxed">
            {currentQ.question}
          </p>

          <div className="space-y-3">
            {currentQ.options.map((option, idx) => {
              const isSelected = selectedAnswers[currentIndex] === idx;
              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(idx)}
                  className={`w-full text-left p-3.5 rounded-2xl border text-xs font-semibold flex items-center gap-3 transition-all ${
                    isSelected
                      ? 'bg-indigo-50 border-indigo-500 text-indigo-900 ring-1 ring-indigo-500 shadow-xs'
                      : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  <span className={`w-6 h-6 rounded-xl flex items-center justify-center font-bold text-[11px] shrink-0 ${
                    isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className="flex-1">{option}</span>
                </button>
              );
            })}
          </div>

          {isSubmitted && (
            <div className="mt-4 p-3 rounded-2xl bg-indigo-50/70 border border-indigo-100 text-xs text-slate-700">
              <strong className="text-indigo-900 block font-bold mb-0.5">Explanation:</strong>
              {currentQ.explanation}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <button
            disabled={currentIndex === 0}
            onClick={() => setCurrentIndex(currentIndex - 1)}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 disabled:opacity-30"
          >
            Previous
          </button>

          <button
            onClick={handleNext}
            disabled={selectedAnswers[currentIndex] === undefined}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-sm flex items-center gap-2 ${
              selectedAnswers[currentIndex] === undefined
                ? 'bg-slate-300 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700 active:scale-95'
            }`}
          >
            <span>{currentIndex === questions.length - 1 ? 'Submit Quiz' : 'Next Question'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
