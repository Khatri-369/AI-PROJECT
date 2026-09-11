export const initialUserData = {
  name: "Om Khatri",
  greeting: "Hi Om,",
  tagline: "Let's learn! 🚀",
  avatarInitial: "O",
  exam: {
    subject: "Theory of Computation (TOC)",
    date: "20 Sep 2025",
    daysLeft: 10,
    status: "On Track",
    dailyStudyHours: 2,
    totalUnits: 5,
  },
  initialTasks: [
    { id: 1, text: "Read Unit 2: Regular Expressions", completed: true, subject: "TOC", estMinutes: 30 },
    { id: 2, text: "Watch AI Tutor explanation", completed: true, subject: "TOC", estMinutes: 20 },
    { id: 3, text: "Solve 10 practice questions", completed: true, subject: "TOC", estMinutes: 40 },
    { id: 4, text: "Take Unit 2 quiz", completed: false, subject: "TOC", estMinutes: 15 },
    { id: 5, text: "Revise mistakes & Pumping Lemma", completed: false, subject: "TOC", estMinutes: 25 },
  ],
  stats: {
    overallProgress: 65,
    unitsCompleted: "3/5",
    quizzesTaken: 12,
    averageScore: "78%",
    weakTopicCount: 2,
  },
  subjects: [
    { id: 'toc', name: "Theory of Computation", progress: 60, color: "#3b82f6", units: 5, active: true },
    { id: 'dbms', name: "DBMS", progress: 75, color: "#10b981", units: 6 },
    { id: 'os', name: "Operating Systems", progress: 40, color: "#f97316", units: 5 },
    { id: 'cn', name: "Computer Networks", progress: 20, color: "#8b5cf6", units: 5 },
    { id: 'dsa', name: "DSA", progress: 80, color: "#ec4899", units: 8 },
  ],
  recentQuiz: {
    title: "Unit 2 Quiz",
    date: "12 Sep 2025, 10:30 AM",
    score: 45,
    weakAreas: ["NFA to DFA", "Regular Expressions", "Pumping Lemma"],
    totalQuestions: 10,
    correctQuestions: 4,
    questions: [
      {
        question: "Can an NFA with epsilon transitions recognize languages not recognized by a DFA?",
        userAnswer: "Yes, epsilon transitions add computational power",
        correctAnswer: "No, DFA and NFA have equal expressive power (Regular languages)",
        isCorrect: false,
        topic: "NFA to DFA",
        explanation: "By subset construction theorem, any NFA (with or without ε-transitions) can be converted to an equivalent DFA."
      },
      {
        question: "What is the Pumping Lemma for regular languages used to prove?",
        userAnswer: "That a language is regular",
        correctAnswer: "That a language is NOT regular",
        isCorrect: false,
        topic: "Pumping Lemma",
        explanation: "Pumping Lemma is a necessary (not sufficient) condition used by contradiction to prove a language is non-regular."
      },
      {
        question: "Which regular expression represents strings ending with '01' over {0,1}?",
        userAnswer: "(0+1)*01",
        correctAnswer: "(0+1)*01",
        isCorrect: true,
        topic: "Regular Expressions",
        explanation: "Correct! Any sequence of 0s and 1s followed by the substring '01'."
      }
    ]
  },
  studyPlan: [
    { day: 1, title: "Day 1: Unit 1 Foundations", desc: "DFA, state transition diagrams, alphabet and language definitions", status: "completed", hours: 2 },
    { day: 2, title: "Day 2: NFA & Equivalence", desc: "NFA design, epsilon-closures, subset construction algorithm", status: "completed", hours: 2 },
    { day: 3, title: "Day 3: Regular Expressions", desc: "Arden's Theorem, converting regex to finite automata", status: "completed", hours: 2 },
    { day: 4, title: "Day 4: Pumping Lemma (Today)", desc: "Proof of non-regularity, pumping length, game of adversary", status: "in-progress", hours: 2.5, isToday: true },
    { day: 5, title: "Day 5: Context-Free Grammars", desc: "Derivation trees, ambiguity in grammars, Chomsky hierarchy", status: "upcoming", hours: 2 },
    { day: 6, title: "Day 6: Pushdown Automata", desc: "PDA transitions, acceptance by final state vs empty store", status: "upcoming", hours: 2 },
    { day: 7, title: "Day 7: Normal Forms & Parsing", desc: "Chomsky Normal Form (CNF) & Greibach Normal Form (GNF)", status: "upcoming", hours: 2 },
    { day: 8, title: "Day 8: Turing Machines", desc: "Standard TM model, tape movements, recursively enumerable languages", status: "upcoming", hours: 2 },
    { day: 9, title: "Day 9: Adaptive Remedial Revision", desc: "Auto-scheduled by Agent: Heavy revision of Unit 2 weak areas (NFA to DFA, Pumping Lemma)", status: "adaptive", hours: 2.5 },
    { day: 10, title: "Day 10: Mock Exam & Summary", desc: "Full-length 50-mark mock exam + formula recap session", status: "upcoming", hours: 2 },
  ],
  sampleDocuments: [
    { id: 1, name: "TOC_Unit_1_Finite_Automata.pdf", size: "2.4 MB", subject: "Theory of Computation", status: "Ready", chunks: 42, uploadedAt: "Sep 9, 2025" },
    { id: 2, name: "TOC_Unit_2_Regular_Expressions.pdf", size: "3.1 MB", subject: "Theory of Computation", status: "Ready", chunks: 56, uploadedAt: "Sep 10, 2025" },
    { id: 3, name: "TOC_Unit_3_Context_Free_Grammar.pdf", size: "4.0 MB", subject: "Theory of Computation", status: "Analyzing", chunks: 38, uploadedAt: "Sep 11, 2025" },
    { id: 4, name: "DBMS_Unit_1_ER_Model.pdf", size: "1.8 MB", subject: "DBMS", status: "Ready", chunks: 28, uploadedAt: "Sep 5, 2025" },
  ],
  quickQuizQuestions: [
    {
      id: 1,
      question: "Which of the following is an undecidable problem?",
      options: [
        "Membership problem for CFG",
        "Halting problem for Turing Machines",
        "Emptiness problem for DFA",
        "Equivalence problem for DFA"
      ],
      correctIndex: 1,
      explanation: "Turing's Halting Problem is famously undecidable, proving that no algorithm can determine if an arbitrary program halts."
    },
    {
      id: 2,
      question: "Minimum number of states required in a DFA accepting strings ending with '01' over alphabet {0, 1} is:",
      options: ["2 states", "3 states", "4 states", "5 states"],
      correctIndex: 1,
      explanation: "3 states are required: start state (initial/neither), state after seeing '0', and accepting state after seeing '1' after '0'."
    },
    {
      id: 3,
      question: "Which machine accepts Context-Sensitive Languages (CSL)?",
      options: ["Finite Automata", "Push Down Automata", "Linear Bounded Automata", "Turing Machine"],
      correctIndex: 2,
      explanation: "Type-1 Context-Sensitive Languages are accepted by Linear Bounded Automata (LBA)."
    }
  ],
  tutorSuggestions: [
    "Explain DFA vs NFA with a clear real-world analogy",
    "What should I study today for TOC Unit 2?",
    "Summarize Pumping Lemma proof steps in 4 bullet points",
    "How does Arden's theorem find regular expressions from state transitions?"
  ]
};
