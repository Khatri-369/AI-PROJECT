import React, { useState } from 'react';
import { X, UploadCloud, FileText, CheckCircle2, Loader2, Sparkles, ArrowRight } from 'lucide-react';

export default function UploadModal({ isOpen, onClose, onUploadComplete }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [subject, setSubject] = useState('Theory of Computation');
  const [processingStage, setProcessingStage] = useState('idle'); // idle, extracting, analyzing, ready

  if (!isOpen) return null;

  const handleFileDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleStartProcessing = () => {
    if (!selectedFile) return;
    setProcessingStage('extracting');
    
    setTimeout(() => {
      setProcessingStage('analyzing');
    }, 1200);

    setTimeout(() => {
      setProcessingStage('ready');
    }, 2400);
  };

  const handleFinish = () => {
    onUploadComplete({
      name: selectedFile ? selectedFile.name : "TOC_Unit_4_Turing_Machines.pdf",
      subject: subject,
      size: selectedFile ? `${(selectedFile.size / (1024*1024)).toFixed(1)} MB` : "3.2 MB",
      status: "Ready",
      chunks: 48,
      uploadedAt: "Just now"
    });
    onClose();
    setProcessingStage('idle');
    setSelectedFile(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-slate-100 overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 font-['Outfit']">Upload Notes / Syllabus</h3>
              <p className="text-xs text-slate-500">Agent will parse, chunk, and index for RAG & Planning</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* Subject Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Select Subject
            </label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              disabled={processingStage !== 'idle'}
              className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="Theory of Computation">Theory of Computation (TOC)</option>
              <option value="DBMS">Database Management Systems (DBMS)</option>
              <option value="Operating Systems">Operating Systems (OS)</option>
              <option value="Computer Networks">Computer Networks (CN)</option>
              <option value="DSA">Data Structures & Algorithms (DSA)</option>
            </select>
          </div>

          {/* Drag and Drop Zone */}
          {processingStage === 'idle' ? (
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleFileDrop}
              className="border-2 border-dashed border-indigo-200 hover:border-indigo-400 bg-indigo-50/20 hover:bg-indigo-50/40 rounded-2xl p-8 text-center transition-all cursor-pointer relative"
            >
              <input
                type="file"
                accept=".pdf,.docx,.txt"
                onChange={handleFileSelect}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <div className="w-12 h-12 mx-auto rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3 shadow-xs">
                <FileText className="w-6 h-6" />
              </div>
              {selectedFile ? (
                <div>
                  <p className="text-sm font-bold text-indigo-900">{selectedFile.name}</p>
                  <p className="text-xs text-slate-500 mt-1">{(selectedFile.size / 1024).toFixed(1)} KB — Click to change</p>
                </div>
              ) : (
                <div>
                  <p className="text-sm font-bold text-slate-700">
                    Click to browse or drop your PDF / Notes
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Supports PDF, DOCX, TXT up to 25MB
                  </p>
                </div>
              )}
            </div>
          ) : (
            /* Processing Pipeline Tracker */
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 space-y-4">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span>Agent Ingestion Pipeline</span>
              </h4>

              {/* Stage 1: Uploaded */}
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-slate-800">1. Stored in Supabase Bucket</p>
                  <p className="text-[11px] text-slate-500">{selectedFile?.name || "Uploaded PDF"}</p>
                </div>
              </div>

              {/* Stage 2: Extracting */}
              <div className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                  processingStage === 'extracting' ? 'bg-blue-600 text-white animate-spin' :
                  processingStage === 'analyzing' || processingStage === 'ready' ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-400'
                }`}>
                  {processingStage === 'extracting' ? <Loader2 className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-4 h-4" />}
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-slate-800">2. Text Extraction & Clean-up</p>
                  <p className="text-[11px] text-slate-500">Extracting chapters, mathematical proofs & diagrams</p>
                </div>
              </div>

              {/* Stage 3: Analyzing & Chunking */}
              <div className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                  processingStage === 'analyzing' ? 'bg-indigo-600 text-white animate-spin' :
                  processingStage === 'ready' ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-400'
                }`}>
                  {processingStage === 'analyzing' ? <Loader2 className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-4 h-4" />}
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-slate-800">3. Vector Embeddings (pgvector)</p>
                  <p className="text-[11px] text-slate-500">Generating 768-dim embeddings for RAG retrieval</p>
                </div>
              </div>

              {/* Stage 4: Ready */}
              {processingStage === 'ready' && (
                <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Processing complete! Ready for AI Tutor & Adaptive Planner.</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-6 bg-slate-50/70 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-slate-600 hover:text-slate-900 font-semibold text-xs"
          >
            Cancel
          </button>
          {processingStage === 'idle' ? (
            <button
              onClick={handleStartProcessing}
              disabled={!selectedFile}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold shadow-sm flex items-center gap-2 transition-all ${
                selectedFile
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-md active:scale-95'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <span>Process Document</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : processingStage === 'ready' ? (
            <button
              onClick={handleFinish}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-500/20 flex items-center gap-2 transition-all active:scale-95"
            >
              <span>Done & Save</span>
              <CheckCircle2 className="w-4 h-4" />
            </button>
          ) : (
            <button
              disabled
              className="px-5 py-2.5 rounded-xl bg-indigo-400 text-white text-xs font-bold flex items-center gap-2 cursor-wait"
            >
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Analyzing Document...</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
