import React, { useState } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import HeroBanner from './components/Dashboard/HeroBanner';
import ExamCard from './components/Dashboard/ExamCard';
import TasksCard from './components/Dashboard/TasksCard';
import ProgressCard from './components/Dashboard/ProgressCard';
import SubjectsCard from './components/Dashboard/SubjectsCard';
import QuizResultCard from './components/Dashboard/QuizResultCard';
import QuickActions from './components/Dashboard/QuickActions';
import MotivationalFooter from './components/Dashboard/MotivationalFooter';

// Modals
import UploadModal from './components/Modals/UploadModal';
import QuizAnalysisModal from './components/Modals/QuizAnalysisModal';
import QuickQuizModal from './components/Modals/QuickQuizModal';

// Views
import UploadMaterialsView from './components/Views/UploadMaterialsView';
import StudyPlanView from './components/Views/StudyPlanView';
import AITutorView from './components/Views/AITutorView';
import QuizView from './components/Views/QuizView';
import ProgressView from './components/Views/ProgressView';
import SettingsView from './components/Views/SettingsView';

// Mock Data
import { initialUserData } from './data/mockData';

export default function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [tutorQuery, setTutorQuery] = useState('');
  
  // App state
  const [tasks, setTasks] = useState(initialUserData.initialTasks);
  const [stats, setStats] = useState(initialUserData.stats);
  const [exam, setExam] = useState(initialUserData.exam);
  const [subjects, setSubjects] = useState(initialUserData.subjects);
  const [recentQuiz, setRecentQuiz] = useState(initialUserData.recentQuiz);
  const [documents, setDocuments] = useState(initialUserData.sampleDocuments);
  const [studyPlan, setStudyPlan] = useState(initialUserData.studyPlan);

  // Modals state
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isAnalysisOpen, setIsAnalysisOpen] = useState(false);
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);

  // Dynamic task toggle
  const handleToggleTask = (taskId) => {
    setTasks((prevTasks) => {
      const updated = prevTasks.map((t) => 
        t.id === taskId ? { ...t, completed: !t.completed } : t
      );
      
      // Update overall progress dynamically
      const completed = updated.filter(t => t.completed).length;
      const progressDelta = Math.round((completed / updated.length) * 10);
      setStats(prev => ({
        ...prev,
        overallProgress: Math.min(100, 60 + progressDelta)
      }));

      return updated;
    });
  };

  // AI Search routing
  const handleAskAI = (query) => {
    setTutorQuery(query);
    setCurrentView('tutor');
  };

  // New PDF upload
  const handleUploadComplete = (newDoc) => {
    const created = {
      id: Date.now(),
      ...newDoc
    };
    setDocuments(prev => [created, ...prev]);
  };

  // Quiz submission handler
  const handleQuizSubmitted = ({ score, correctCount, total }) => {
    setRecentQuiz(prev => ({
      ...prev,
      title: "TOC Quick Quiz",
      date: "Just now",
      score: score,
      weakAreas: score < 60 ? ["Pumping Lemma", "Automata Minimization"] : ["Minor Concept Gaps"]
    }));

    setStats(prev => ({
      ...prev,
      quizzesTaken: prev.quizzesTaken + 1,
      averageScore: `${Math.round((parseInt(prev.averageScore) + score) / 2)}%`
    }));
  };

  const handleRegeneratePlan = () => {
    alert("🤖 Adaptive Planner Triggered: Analyzed your recent quiz performance (45% on Unit 2). Rescheduled Day 9 to prioritize remedial revision for NFA-to-DFA & Pumping Lemma.");
  };

  return (
    <div className="min-h-screen bg-[#f5f7fc] text-slate-800 flex flex-col font-['Plus_Jakarta_Sans']">
      {/* Top Header */}
      <Header
        onAskAI={handleAskAI}
        onNavigate={setCurrentView}
      />

      {/* Main Layout Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar
          currentView={currentView}
          onNavigate={setCurrentView}
        />

        {/* Dynamic Main Content Container */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {currentView === 'dashboard' && (
            <div className="space-y-6 max-w-7xl mx-auto">
              {/* Hero Banner */}
              <HeroBanner onNavigate={setCurrentView} />

              {/* 6-Card Grid matching mockup */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {/* 1. Upcoming Exam */}
                <ExamCard
                  exam={exam}
                  onNavigate={setCurrentView}
                />

                {/* 2. Today's Tasks */}
                <TasksCard
                  tasks={tasks}
                  onToggleTask={handleToggleTask}
                />

                {/* 3. Overall Progress */}
                <ProgressCard
                  stats={stats}
                  onNavigate={setCurrentView}
                />

                {/* 4. Subjects */}
                <SubjectsCard
                  subjects={subjects}
                  onSelectSubject={() => setCurrentView('upload')}
                  onManage={() => setCurrentView('upload')}
                />

                {/* 5. Recent Quiz Result */}
                <QuizResultCard
                  quiz={recentQuiz}
                  onViewAnalysis={() => setIsAnalysisOpen(true)}
                  onNavigate={setCurrentView}
                />

                {/* 6. Quick Actions */}
                <QuickActions
                  onUploadClick={() => setIsUploadOpen(true)}
                  onAskTutorClick={() => setCurrentView('tutor')}
                  onTakeQuizClick={() => setIsQuizModalOpen(true)}
                  onViewPlanClick={() => setCurrentView('studyplan')}
                />
              </div>

              {/* Motivational Banner at Bottom */}
              <MotivationalFooter
                onActionClick={() => {
                  alert("🌟 Keep consistent! Check off today's study tasks to maintain your exam streak.");
                }}
              />
            </div>
          )}

          {currentView === 'upload' && (
            <UploadMaterialsView
              documents={documents}
              onOpenUploadModal={() => setIsUploadOpen(true)}
              onDeleteDoc={(id) => setDocuments(docs => docs.filter(d => d.id !== id))}
            />
          )}

          {currentView === 'studyplan' && (
            <StudyPlanView
              plan={studyPlan}
              onRegenerate={handleRegeneratePlan}
            />
          )}

          {currentView === 'tutor' && (
            <AITutorView
              initialQuery={tutorQuery}
            />
          )}

          {currentView === 'quiz' && (
            <QuizView
              onStartQuiz={() => setIsQuizModalOpen(true)}
              onViewAnalysis={() => setIsAnalysisOpen(true)}
            />
          )}

          {currentView === 'progress' && (
            <ProgressView
              stats={stats}
              onNavigate={setCurrentView}
            />
          )}

          {currentView === 'settings' && (
            <SettingsView />
          )}
        </main>
      </div>

      {/* Modals */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploadComplete={handleUploadComplete}
      />

      <QuizAnalysisModal
        isOpen={isAnalysisOpen}
        onClose={() => setIsAnalysisOpen(false)}
        quiz={recentQuiz}
        onGoToStudyPlan={() => {
          setIsAnalysisOpen(false);
          setCurrentView('studyplan');
        }}
        onRetakeQuiz={() => {
          setIsAnalysisOpen(false);
          setIsQuizModalOpen(true);
        }}
      />

      <QuickQuizModal
        isOpen={isQuizModalOpen}
        onClose={() => setIsQuizModalOpen(false)}
        questions={initialUserData.quickQuizQuestions}
        onQuizSubmitted={handleQuizSubmitted}
      />
    </div>
  );
}
