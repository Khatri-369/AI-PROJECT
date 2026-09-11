import React, { useState, useEffect, useRef } from 'react';
import { Bot, Send, Sparkles, BookOpen, User, Lightbulb, HelpCircle, FileText, CheckCircle2 } from 'lucide-react';

export default function AITutorView({ initialQuery = '' }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: "Hello Om! I am your AI Study Tutor. I'm grounded in your uploaded PDFs (TOC Unit 1-3 & DBMS). Ask me any concept, or click one of the quick learning modes below!",
      citation: null
    },
    {
      id: 2,
      sender: 'user',
      text: "Explain DFA vs NFA simply",
      citation: null
    },
    {
      id: 3,
      sender: 'bot',
      text: "Here is the key distinction between DFA and NFA based on your Unit 1 notes:\n\n1. **Deterministic (DFA)**: For every state and input symbol, there is exactly ONE transition. Think of a train on a track where every switch is predetermined.\n2. **Non-Deterministic (NFA)**: For a state and symbol, there can be ZERO, ONE, or MULTIPLE transitions, plus epsilon (ε) transitions. Think of choosing multiple paths at once in parallel.\n\n*Important Viva Fact*: Both have identical computational power (recognize the exact same set of Regular Languages) through subset construction.",
      citation: "TOC_Unit_1_Finite_Automata.pdf (Section 1.3, Page 8)"
    }
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (initialQuery) {
      handleSendMessage(initialQuery);
    }
  }, [initialQuery]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = (textToSend) => {
    const text = textToSend || inputQuery;
    if (!text.trim()) return;

    const userMsg = { id: Date.now(), sender: 'user', text };
    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsTyping(true);

    // Simulate Agentic RAG retrieval + LLM synthesis
    setTimeout(() => {
      let botReply = `Based on your uploaded course notes on ${text}, here is the breakdown:\n\n• Core Concept: Key theoretical principles indicate how transitions and language bounds are evaluated.\n• Exam Tip: Always write formal 5-tuple definition (Q, Σ, δ, q0, F) when answering 5-mark questions.\n• Adaptive Warning: You had difficulties with this in the Unit 2 quiz. Make sure to practice 2 state transition examples!`;
      let citation = "TOC_Unit_2_Regular_Expressions.pdf (Page 14)";

      if (text.toLowerCase().includes('pumping lemma')) {
        botReply = "The Pumping Lemma for Regular Languages states that if a language L is regular, then every string w in L with length |w| ≥ p (pumping length) can be divided into 3 parts: w = xyz, satisfying:\n1. |y| > 0 (y cannot be empty)\n2. |xy| ≤ p\n3. For all i ≥ 0, xy^i z ∈ L.\n\n*Usage*: We use it for **proof by contradiction** to prove a language is NOT regular!";
        citation = "TOC_Unit_2_Regular_Expressions.pdf (Theorem 2.4, Page 22)";
      }

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'bot',
          text: botReply,
          citation: citation
        }
      ]);
      setIsTyping(false);
    }, 1200);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {/* Header Info */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/80 card-shadow flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 font-['Outfit']">
              AI Tutor — Grounded in Uploaded Material
            </h2>
            <p className="text-xs text-slate-500 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Supabase pgvector RAG Active (3 Documents Indexed)</span>
            </p>
          </div>
        </div>

        {/* Learning Actions chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-[11px] font-bold text-slate-600">
          <button
            onClick={() => handleSendMessage("Explain Pumping Lemma simply with an analogy")}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 transition-colors shrink-0"
          >
            💡 Give Analogy
          </button>
          <button
            onClick={() => handleSendMessage("Create a 5-mark exam-style answer for DFA vs NFA")}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 transition-colors shrink-0"
          >
            📝 Exam-Style Answer
          </button>
        </div>
      </div>

      {/* Chat Messages Window */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 card-shadow min-h-[480px] max-h-[550px] flex flex-col justify-between">
        <div className="overflow-y-auto space-y-4 pr-2 flex-1">
          {messages.map((m) => {
            const isBot = m.sender === 'bot';
            return (
              <div
                key={m.id}
                className={`flex gap-3 ${isBot ? 'items-start' : 'items-start flex-row-reverse'}`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                  isBot ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-700 text-white'
                }`}>
                  {isBot ? <Bot className="w-4 h-4" /> : 'O'}
                </div>

                <div className={`max-w-[80%] rounded-2xl p-4 text-xs leading-relaxed ${
                  isBot
                    ? 'bg-slate-50 border border-slate-200/80 text-slate-800'
                    : 'bg-indigo-600 text-white font-medium shadow-md shadow-indigo-500/15'
                }`}>
                  <p className="whitespace-pre-line">{m.text}</p>

                  {/* RAG Source Citation Badge */}
                  {m.citation && (
                    <div className="mt-3 pt-2.5 border-t border-slate-200/80 flex items-center gap-1.5 text-[11px] font-bold text-indigo-600 bg-white/80 px-2.5 py-1 rounded-xl">
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Source: {m.citation}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {isTyping && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center text-xs">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-slate-100 rounded-2xl px-4 py-3 text-xs text-slate-500 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce"></span>
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.4s]"></span>
                <span className="text-[11px] font-semibold text-slate-500 ml-1">Retrieving notes & drafting answer...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <div className="pt-4 border-t border-slate-100">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Ask a question or request a topic summary..."
              className="flex-1 px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
            />
            <button
              type="submit"
              disabled={!inputQuery.trim()}
              className="p-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white shadow-md shadow-indigo-500/20 active:scale-95 transition-all"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
