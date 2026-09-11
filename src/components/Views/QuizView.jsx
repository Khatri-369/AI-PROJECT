import React, { useState } from 'react';
import { ClipboardCheck, Sparkles, Play, Award, AlertCircle, History, ArrowRight } from 'lucide-react';

export default function QuizView({ onStartQuiz, onViewAnalysis }) {
  const [selectedSubject, setSelectedSubject] = useState('Theory of Computation');
  const [selectedUnit, setSelectedUnit] = useState('Unit 2: Regular Expressions');
  const [numQuestions, setNumQuestions] = useState(10);
  const [difficulty, setDifficulty] = useState('Medium');

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 card-shadow">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 font-['Outfit']">
            AI Quiz Generator & Performance Evaluator
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Generate custom test sets from indexed PDFs to test conceptual understanding and detect weak topics.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quiz Configuration Card */}
        <div className="lg:col-span-1 bg-white rounded-3xl p-6 border border-slate-200/80 card-shadow space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-slate-800 text-sm font-['Outfit']">Configure Quiz</h3>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1.5">Subject</label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-purple-500"
            >
              <option>Theory of Computation</option>
              <option>DBMS</option>
              <option>Operating Systems</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1.5">Unit / Topic</label>
            <select
              value={selectedUnit}
              onChange={(e) => setSelectedUnit(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-purple-500"
            >
              <option>Unit 2: Regular Expressions & Pumping Lemma</option>
              <option>Unit 1: Finite Automata & Equivalence</option>
              <option>Unit 3: Context-Free Grammars & PDA</option>
              <option>Unit 4: Turing Machines & Decidability</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1.5">Questions</label>
              <select
                value={numQuestions}
                onChange={(e) => setNumQuestions(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800"
              >
                <option value={5}>5 MCQs</option>
                <option value={10}>10 MCQs</option>
                <option value={15}>15 MCQs</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1.5">Difficulty</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800"
              >
                <option>Easy</option>
                <option>Medium</option>
                <option>Hard</option>
              </select>
            </div>
          </div>

          <button
            onClick={onStartQuiz}
            className="w-full mt-4 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-bold shadow-md shadow-purple-500/20 flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Generate & Start Quiz</span>
          </button>
        </div>

        {/* History Table */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200/80 card-shadow">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-3">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-slate-500" />
              <h3 className="font-bold text-slate-800 text-sm font-['Outfit']">Past Quiz Evaluations</h3>
            </div>
            <span className="text-xs text-slate-400 font-medium">Auto-recorded for Adaptive Re-planning</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="pb-3">Quiz Topic</th>
                  <th className="pb-3">Date</th>
                  <th className="pb-3">Score</th>
                  <th className="pb-3">Detected Weaknesses</th>
                  <th className="pb-3 text-right">Review</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                <tr className="hover:bg-slate-50/60">
                  <td className="py-3.5 font-bold text-slate-800">Unit 2: Regular Expressions</td>
                  <td className="py-3.5 text-slate-500">12 Sep 2025</td>
                  <td className="py-3.5">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-rose-50 text-rose-600 border border-rose-200">
                      45%
                    </span>
                  </td>
                  <td className="py-3.5">
                    <span className="text-[11px] text-rose-600 font-semibold bg-rose-50 px-2 py-0.5 rounded-md">
                      NFA to DFA, Pumping Lemma
                    </span>
                  </td>
                  <td className="py-3.5 text-right">
                    <button
                      onClick={onViewAnalysis}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-800 hover:underline"
                    >
                      Analysis →
                    </button>
                  </td>
                </tr>

                <tr className="hover:bg-slate-50/60">
                  <td className="py-3.5 font-bold text-slate-800">Unit 1: Finite Automata</td>
                  <td className="py-3.5 text-slate-500">10 Sep 2025</td>
                  <td className="py-3.5">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-emerald-50 text-emerald-600 border border-emerald-200">
                      85%
                    </span>
                  </td>
                  <td className="py-3.5">
                    <span className="text-[11px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md">
                      None (Mastered)
                    </span>
                  </td>
                  <td className="py-3.5 text-right">
                    <button
                      onClick={onViewAnalysis}
                      className="text-xs font-bold text-slate-400 hover:text-indigo-600 hover:underline"
                    >
                      View →
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
