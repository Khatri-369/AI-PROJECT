import React from 'react';
import { UploadCloud, FileText, Trash2, CheckCircle2, Loader2, Sparkles, Plus } from 'lucide-react';

export default function UploadMaterialsView({ documents, onOpenUploadModal, onDeleteDoc }) {
  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 card-shadow">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 font-['Outfit']">
            Upload Study Materials & Syllabus
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Uploaded PDFs are parsed, chunked, and vectorized into Supabase for RAG and agent planning.
          </p>
        </div>
        <button
          onClick={onOpenUploadModal}
          className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-500/20 flex items-center justify-center gap-2 transition-all active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Upload New PDF / Notes</span>
        </button>
      </div>

      {/* Documents Table Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 card-shadow">
        <h3 className="font-bold text-slate-800 text-base mb-4 font-['Outfit']">
          Processed Documents ({documents.length})
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="pb-3">Document Name</th>
                <th className="pb-3">Subject</th>
                <th className="pb-3">Size</th>
                <th className="pb-3">Chunks</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {documents.map((doc) => (
                <tr key={doc.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3.5 font-bold text-slate-800 flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <span>{doc.name}</span>
                  </td>
                  <td className="py-3.5 text-slate-600 font-medium">{doc.subject}</td>
                  <td className="py-3.5 text-slate-400 font-medium">{doc.size}</td>
                  <td className="py-3.5 font-semibold text-indigo-600">{doc.chunks} chunks</td>
                  <td className="py-3.5">
                    {doc.status === 'Ready' ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Ready
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-600" />
                        Analyzing
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 text-right">
                    <button
                      onClick={() => onDeleteDoc(doc.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Extracted Topics Preview */}
      <div className="bg-gradient-to-br from-indigo-50/70 to-blue-50/70 rounded-3xl p-6 border border-indigo-100 card-shadow">
        <div className="flex items-center gap-2.5 mb-3">
          <Sparkles className="w-5 h-5 text-indigo-600" />
          <h3 className="font-bold text-slate-900 text-sm font-['Outfit']">
            Agentic Topic Extraction Preview (TOC)
          </h3>
        </div>
        <p className="text-xs text-slate-600 mb-4">
          The Topic Analyzer identified 5 units, 18 subtopics, and assigned relative difficulty weights for study scheduling:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { unit: "Unit 1", name: "Finite Automata (DFA/NFA)", diff: "Medium", weight: "20%" },
            { unit: "Unit 2", name: "Regular Expressions & Pumping Lemma", diff: "Hard", weight: "25%" },
            { unit: "Unit 3", name: "Context-Free Grammars & PDA", diff: "Medium", weight: "20%" },
            { unit: "Unit 4", name: "Turing Machines & Decidability", diff: "Hard", weight: "20%" },
            { unit: "Unit 5", name: "Chomsky Hierarchy & Complexity", diff: "Medium", weight: "15%" },
          ].map((u, i) => (
            <div key={i} className="bg-white/90 backdrop-blur-sm p-3.5 rounded-2xl border border-indigo-100/80 shadow-2xs">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-indigo-600">{u.unit}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  u.diff === 'Hard' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'
                }`}>{u.diff}</span>
              </div>
              <p className="text-xs font-bold text-slate-800 mt-1">{u.name}</p>
              <p className="text-[11px] text-slate-400 mt-1">Exam Weight: {u.weight}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
